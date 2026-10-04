import {walmartURL,parseProductHTML} from './products.js';
import {readNutritionImage} from './label-ocr.js';
export async function importProduct(url){
 const identity=walmartURL(url);const supplied=new URL(url);let next=`https://www.walmart.com${supplied.pathname}`;const signal=AbortSignal.timeout(15000);
 for(let i=0;i<4;i++){
  let response;try{response=await fetch(next,{redirect:'manual',signal,headers:{Accept:'text/html'}});}catch(e){if(['EACCES','EPERM'].includes(e.cause?.code))throw new Error('The local app server is not allowed to connect to Walmart. Restart the server with network access, then retry. You can also enter details manually or paste nutrition label text.');if(['TimeoutError','AbortError'].includes(e.name))throw new Error('Walmart did not respond within 15 seconds. Retry or enter details manually.');throw new Error('The app server could not connect to Walmart. Check its internet access, then retry or enter details manually.');}
  if(response.status>=300&&response.status<400){const location=response.headers.get('location');await response.body?.cancel();if(!location)throw new Error('Walmart redirected without a product page.');const destination=new URL(location,next).href;if(walmartURL(destination).retailerId!==identity.retailerId)throw new Error('Walmart redirected to a different item. Review the link manually.');next=destination;continue;}
  if(!response.ok){await response.body?.cancel();throw new Error(`Walmart could not be read (HTTP ${response.status}). Enter details manually or paste the nutrition label.`);}
  const chunks=[];let size=0;for await(const chunk of response.body){size+=chunk.length;if(size>5_000_000)throw new Error('Product page is too large to import. Enter the details manually.');chunks.push(chunk);}
  const html=Buffer.concat(chunks).toString('utf8');
  if(/<title[^>]*>\s*(?:Robot or human|Access Denied|Verify you are human)/i.test(html))throw new Error('Walmart returned an access-check page instead of the item. Enter details manually or paste the label text.');
  const draft=parseProductHTML(html,identity.url);draft.observedAt=new Date().toISOString();
  let message=draft.name?'Available metadata imported. Review every value before saving.':'Walmart did not expose readable product metadata. The link is ready; enter details or paste a label below.';
  if(draft.nutritionSource&&/^https:\/\/(?:images\.salsify\.com|i5\.walmartimages\.com|i5\.walmartimages\.ca)\//i.test(draft.nutritionSource)){
   try{const label=await readNutritionImage(draft.nutritionSource);draft.nutrition={...label.nutrition,...Object.fromEntries(Object.entries(draft.nutrition).filter(([,value])=>value!==null&&value!==undefined))};if(label.servingSize)draft.servingSize=draft.servingSize||label.servingSize;if(label.servingsPerContainer)draft.servingsPerContainer=draft.servingsPerContainer||label.servingsPerContainer;draft.extraction=label.extraction;draft.reviewed=false;
    const count=Object.keys(label.nutrition).length;message=count?`Item imported and ${count} nutrition fields read from the label image. Compare every value with the source before saving.`:'Item imported, but no readable nutrient amounts were found in the image. Open the label or paste its text.';if(label.extraction.warnings.length)message+=' '+label.extraction.warnings.join(' ');
    draft.notes=draft.notes.replace('Open the nutrition source and transcribe the label or paste its text; amounts are not inferred from the image.','Automatically read with local OCR; compare extracted values with the original image.');
   }catch(e){message=`Item details imported. Automatic label reading could not finish: ${e.message}. Open the nutrition source or paste label text.`;}
  }
  return {draft,message};
 }
 throw new Error('Walmart redirected too many times. Enter the details manually.');
}
