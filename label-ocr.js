import {fork} from 'node:child_process';
import {mkdir,writeFile,unlink} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {parseLabel,nutritionFields} from './products.js';
const allowedHosts=new Set(['images.salsify.com','i5.walmartimages.com','i5.walmartimages.ca']);
export function labelURL(value){const u=new URL(value);if(u.protocol!=='https:'||!allowedHosts.has(u.hostname)||u.port||u.username||u.password)throw new Error('This nutrition image host is not supported for automatic reading.');return u.href;}
async function downloadLabel(value){let url=labelURL(value);const signal=AbortSignal.timeout(15000);for(let i=0;i<4;i++){
 const response=await fetch(url,{redirect:'manual',signal});
 if(response.status>=300&&response.status<400){const location=response.headers.get('location');await response.body?.cancel();if(!location)throw new Error('Label image redirected without a destination.');url=labelURL(new URL(location,url).href);continue;}
 if(!response.ok){await response.body?.cancel();throw new Error(`Label image could not be read (HTTP ${response.status}).`);}
 const type=response.headers.get('content-type')||'';if(!/^image\/(?:jpeg|png|webp)(?:;|$)/i.test(type)){await response.body?.cancel();throw new Error('The label source did not return a supported image.');}
 const chunks=[];let size=0;for await(const chunk of response.body){size+=chunk.length;if(size>8_000_000)throw new Error('Label image is too large to read automatically.');chunks.push(chunk);}return Buffer.concat(chunks);
}throw new Error('Too many label image redirects.');}
function recognize(file){return new Promise((resolve,reject)=>{
 const child=fork(fileURLToPath(new URL('./ocr-worker.js',import.meta.url)),[file],{cwd:fileURLToPath(new URL('.',import.meta.url)),stdio:['ignore','ignore','pipe','ipc'],windowsHide:true});
 let settled=false;let stderr='';child.stderr.on('data',data=>{stderr=(stderr+data).slice(-1000);});
 const finish=(error,result)=>{if(settled)return;settled=true;clearTimeout(timer);child.kill();error?reject(error):resolve(result);};
 const timer=setTimeout(()=>finish(new Error('Local label reading timed out. Retry or paste the label text.')),60000);
 child.on('message',result=>finish(result.error?new Error(result.error):null,result));child.on('error',error=>finish(error));child.on('exit',code=>{if(!settled)finish(new Error(`Local OCR stopped before reading the label${code?` (code ${code})`:''}. ${stderr}`));});
});}
export function nutritionFromOCR(result){
 const parsed=parseLabel(result.text);const warnings=[];
 if(/\b[Oo]\s*(?:g|mg|mcg)\b/.test(result.text))warnings.push('Letter O readings were interpreted as zero amounts; verify the zero values against the image.');
 // Only explicit gram/milligram/microgram amounts are accepted, never %DV.
 const maximum={calories:3000,protein:300,carbs:500,fat:300,saturatedFat:150,transFat:50,cholesterol:2000,sodium:10000,fiber:100,sugars:300,addedSugars:300,vitaminD:1000,calcium:5000,iron:200,potassium:10000};
 for(const [k,v]of Object.entries(parsed.nutrition))if(v>maximum[k]){delete parsed.nutrition[k];warnings.push(`${nutritionFields.find(x=>x[0]===k)[1]} was unclear and left blank.`);}
 if(parsed.servingsPerContainer>1000){delete parsed.servingsPerContainer;warnings.push('Servings per container was unclear and left blank.');}
 if(result.confidence<65)warnings.push('This image has low OCR confidence; compare every extracted value with the label.');
 return {...parsed,extraction:{method:result.engine,confidence:result.confidence,text:result.text.slice(0,20000),warnings,extractedAt:new Date().toISOString()}};
}
let running=0;
export async function readNutritionImage(url){if(running>=2)throw new Error('Label reader is busy. Retry in a moment.');running++;let file;try{
 const bytes=await downloadLabel(url);const directory=new URL('./data/labels/',import.meta.url);await mkdir(directory,{recursive:true});file=fileURLToPath(new URL(`${randomUUID()}.image`,directory));await writeFile(file,bytes);return nutritionFromOCR(await recognize(file));
}finally{running--;if(file)await unlink(file).catch(()=>{});}}
