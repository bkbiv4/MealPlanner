import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {openDatabase} from './database.js';
import {importProduct} from './import-product.js';
import {readNutritionImage} from './label-ocr.js';
const root = path.dirname(fileURLToPath(import.meta.url));
await mkdir(path.join(root,'data'),{recursive:true});
const db=openDatabase(path.join(root,'data','gather.sqlite'));
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
const allowed = new Set(['index.html', 'style.css', 'app.js', 'planner.js','products.js','product-ui.js','batches.js','batch-ui.js']);
const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
async function body(req){let data='';for await(const chunk of req){data+=chunk;if(data.length>100000)throw new Error('Request is too large.');}try{return JSON.parse(data);}catch{throw new Error('Invalid JSON request.');}}
const server = http.createServer(async (req, res) => {
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname.startsWith('/api/')){
   const host=req.headers.host||'';if(!/^(localhost|127\.0\.0\.1):\d+$/.test(host)){json(res,403,{error:'Local requests only.'});return;}
   if(req.method!=='GET'&&req.headers.origin&&req.headers.origin!==`http://${host}`){json(res,403,{error:'Cross-origin writes are not allowed.'});return;}
   try{
    if(pathname==='/api/products'&&req.method==='GET'){json(res,200,db.list());return;}
    if(pathname==='/api/batches'&&req.method==='GET'){json(res,200,db.listBatches());return;}
    if(pathname==='/api/batches'&&req.method==='POST'){json(res,200,db.saveBatch(await body(req)));return;}
    if(pathname==='/api/products'&&req.method==='POST'){json(res,200,db.save(await body(req)));return;}
    if(pathname==='/api/products/import'&&req.method==='POST'){const input=await body(req);try{json(res,200,await importProduct(input.url));}catch(e){json(res,422,{error:e.message});}return;}
    if(pathname==='/api/products/read-label'&&req.method==='POST'){const input=await body(req);try{json(res,200,await readNutritionImage(input.url));}catch(e){json(res,422,{error:e.message});}return;}
    const history=pathname.match(/^\/api\/products\/(\d+)\/history$/);if(history&&req.method==='GET'){json(res,200,db.history(history[1]));return;}
    json(res,404,{error:'Not found.'});
   }catch(e){json(res,400,{error:e.message});}return;
  }
  const file = pathname.slice(1) || 'index.html';
  if (!allowed.has(file)) { res.writeHead(404); res.end('Not found'); return; }
  try { res.writeHead(200, { 'Content-Type': types[path.extname(file)] }); res.end(await readFile(path.join(root, file))); }
  catch { res.writeHead(500); res.end('Unable to load file'); }
});
server.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => console.log('Meal Planner: http://localhost:' + server.address().port));
