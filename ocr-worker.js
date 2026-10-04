import {createRequire} from 'node:module';
import {homedir} from 'node:os';
import path from 'node:path';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url);
function dependency(name){try{return require(name);}catch{const bundled=process.env.GATHER_NODE_MODULES||path.join(homedir(),'.cache','codex-runtimes','codex-primary-runtime','dependencies','node','node_modules');return require(path.join(bundled,name));}}
let worker;
try{
 const {createWorker}=dependency('tesseract.js'),sharp=dependency('sharp');
 await mkdir(new URL('./data/ocr/',import.meta.url),{recursive:true});
 const input=await sharp(process.argv[2],{limitInputPixels:16_000_000}).rotate().trim({threshold:15}).resize({width:1800,height:2200,fit:'inside',withoutEnlargement:false}).flatten({background:'#ffffff'}).grayscale().normalise().png().toBuffer();
 worker=await createWorker('eng',1,{cachePath:path.resolve('data/ocr'),errorHandler:()=>{}});
 await worker.setParameters({tessedit_pageseg_mode:'3',preserve_interword_spaces:'1'});
 const result=await worker.recognize(input);
 process.send?.({text:result.data.text,confidence:result.data.confidence,engine:'Tesseract.js local OCR'});
}catch(e){process.send?.({error:e.message});process.exitCode=1;}finally{await worker?.terminate();process.disconnect?.();}
