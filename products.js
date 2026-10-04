export const nutritionFields=[['calories','Calories','kcal'],['protein','Protein','g'],['carbs','Total carbohydrate','g'],['fat','Total fat','g'],['saturatedFat','Saturated fat','g'],['transFat','Trans fat','g'],['cholesterol','Cholesterol','mg'],['sodium','Sodium','mg'],['fiber','Dietary fiber','g'],['sugars','Total sugars','g'],['addedSugars','Added sugars','g'],['vitaminD','Vitamin D','mcg'],['calcium','Calcium','mg'],['iron','Iron','mg'],['potassium','Potassium','mg']];
export function walmartURL(value){let u;try{u=new URL(value);}catch{throw new Error('Enter a valid Walmart product URL.');}if(u.protocol!=='https:'||!['walmart.com','www.walmart.com'].includes(u.hostname)||u.username||u.password||u.port)throw new Error('Use an https://www.walmart.com product link.');const match=u.pathname.match(/^\/ip\/(?:[^/]+\/)?(\d+)\/?$/);if(!match)throw new Error('The link must be a Walmart /ip/ product page.');return {url:`https://www.walmart.com/ip/${match[1]}`,retailerId:match[1]};}
function number(value,label){if(value===null||value===undefined||value==='')return null;if(typeof value!=='number'&&typeof value!=='string')throw new Error(`${label} must be a number.`);const n=Number(value);if(!Number.isFinite(n)||n<0||n>1e7)throw new Error(`${label} must be a nonnegative number.`);return n;}
function text(v,max=1000){return String(v??'').trim().slice(0,max);}
function sourceURL(v){if(!v)return '';let u;try{u=new URL(v);}catch{throw new Error('Source links must be valid HTTPS URLs.');}if(u.protocol!=='https:'||u.username||u.password)throw new Error('Source links must use HTTPS.');return u.href;}
export function validateProduct(input){
 const identity=walmartURL(input.url);const name=text(input.name,300);if(!name)throw new Error('An item name is required.');
 const p={...identity,name,brand:text(input.brand,100),packageSize:text(input.packageSize,100),servingSize:text(input.servingSize,150),servingsPerContainer:number(input.servingsPerContainer,'Servings per container'),regularPrice:number(input.regularPrice,'Regular price'),currentPrice:number(input.currentPrice,'Current price'),discountedPrice:number(input.discountedPrice,'Discounted price'),currency:'USD',priceContext:text(input.priceContext,300),priceSource:sourceURL(input.priceSource)||identity.url,nutritionSource:sourceURL(input.nutritionSource),notes:text(input.notes,3000),nutrition:{},reviewed:Boolean(input.reviewed),observedAt:input.observedAt?new Date(input.observedAt).toISOString():null};
 if(p.servingsPerContainer===0)throw new Error('Servings per container must be greater than zero or blank.');
 if(p.discountedPrice!==null&&p.regularPrice!==null&&p.discountedPrice>p.regularPrice)throw new Error('Discounted price cannot exceed the regular price.');
 for(const [key,label] of nutritionFields)p.nutrition[key]=number(input.nutrition?.[key],label);
 if(input.extraction&&typeof input.extraction==='object')p.extraction={method:text(input.extraction.method,100),confidence:number(input.extraction.confidence,'OCR confidence'),text:text(input.extraction.text,20000),warnings:Array.isArray(input.extraction.warnings)?input.extraction.warnings.map(x=>text(x,300)).slice(0,20):[],extractedAt:text(input.extraction.extractedAt,100)};
 return p;
}
export function packageNutrition(p){return Object.fromEntries(nutritionFields.map(([k])=>[k,p.servingsPerContainer!==null&&p.nutrition[k]!==null?p.nutrition[k]*p.servingsPerContainer:null]));}
const numeric=v=>{const m=String(v??'').match(/^(?:USD\s*)?\$?\s*(\d+(?:\.\d+)?)(?:\s*(?:g|mg|mcg|kcal|calories))?$/i);return m?Number(m[1]):null;};
export function parseProductHTML(html,url){
 const identity=walmartURL(url),draft={...identity,name:'',nutrition:{},priceSource:identity.url,notes:'Imported fields need review. Blank fields were not available in the page metadata.'};
 const candidates=[];const collect=o=>{if(Array.isArray(o))o.forEach(collect);else if(o&&typeof o==='object'){if([o['@type']].flat().includes('Product'))candidates.push(o);if(o['@graph'])collect(o['@graph']);}};
 for(const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{collect(JSON.parse(m[1]));}catch{}}
 const product=candidates.find(p=>String(p.url||p['@id']||'').includes(identity.retailerId)||String(p.sku||p.productID||'')===identity.retailerId)||(candidates.length===1?candidates[0]:null);
 if(product){
 draft.name=String(product.name||'');draft.brand=String(product.brand?.name||product.brand||'');
 const offers=[product.offers].flat().filter(Boolean);const offer=offers.find(o=>!o.priceCurrency||o.priceCurrency==='USD');
 if(offer)draft.currentPrice=numeric(offer.price); // A displayed price is not proof of a discount.
 const n=product.nutrition;if(n){draft.servingSize=n.servingSize||'';const map={calories:'calories',protein:'proteinContent',carbs:'carbohydrateContent',fat:'fatContent',saturatedFat:'saturatedFatContent',transFat:'transFatContent',cholesterol:'cholesterolContent',sodium:'sodiumContent',fiber:'fiberContent',sugars:'sugarContent'};for(const [k,v]of Object.entries(map))draft.nutrition[k]=numeric(n[v]);draft.nutritionSource=identity.url;}
 }
 // Walmart's main item is in Next.js page data, not always Product JSON-LD.
 const nextScript=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>/\bid\s*=\s*["']__NEXT_DATA__["']/i.test(m[1]));
 if(nextScript){try{
  const data=JSON.parse(nextScript[2]).props?.pageProps?.initialData?.data;
  const main=data?.product;
  if(main&&String(main.usItemId)===identity.retailerId){
   draft.name=main.name||draft.name;draft.brand=typeof main.brand==='string'?main.brand:draft.brand;
   const prices=main.priceInfo;
   if(prices?.currentPrice?.currencyUnit==='USD')draft.currentPrice=numeric(prices.currentPrice.price);
   const was=prices?.wasPrice?.currencyUnit==='USD'?numeric(prices.wasPrice.price):null;
   if(was!==null){draft.regularPrice=was;if(draft.currentPrice!==null&&draft.currentPrice<was)draft.discountedPrice=draft.currentPrice;}
   const specs=data.idml?.specifications||[];
   draft.packageSize=specs.find(x=>/^(?:weight|net weight|size|count per pack)$/i.test(x.name))?.value||'';
   const label=specs.find(x=>/^nutrition facts label image$/i.test(x.name))?.value;
   if(label&&/^https:\/\//i.test(label)){draft.nutritionSource=label;draft.notes+=' Nutrition facts are supplied as a label image. Open the nutrition source and transcribe the label or paste its text; amounts are not inferred from the image.';}
   const store=main.location?.pickupLocation?.storeId||main.location?.storeIds?.[0];
   draft.priceContext=[main.sellerName,store?`Page default store ${store} (not your selected store)`:null,'Confirm local price and fulfillment before shopping'].filter(Boolean).join('; ');
  }
 }catch{/* A malformed script must not override a valid metadata draft. */}}
 return draft;
}
export function mergeProductImport(saved,fresh){
 if(!saved)return fresh;
 const merged={...saved,...fresh,nutrition:{...fresh.nutrition}};
 for(const key of ['name','brand','packageSize','servingSize','servingsPerContainer','nutritionSource']){
  if(saved[key]!==null&&saved[key]!==undefined&&saved[key]!==''&&!(key==='name'&&/^Walmart item \d+ — details pending$/.test(saved.name)))merged[key]=saved[key];
 }
 for(const [key,value]of Object.entries(saved.nutrition||{}))if(value!==null&&value!==undefined)merged.nutrition[key]=value;
 merged.reviewed=false;
 return merged;
}
export function parseLabel(text){
 text=String(text).replace(/\b[Oo](?=\s*(?:g|mg|mcg)\b)/g,'0');
 const nutrition={};const patterns={calories:/\bCalories\s*[:|]?\s*(\d+(?:\.\d+)?)/i,protein:/\bProtein\s*[:|]?\s*(\d+(?:\.\d+)?)\s*g\b/i,carbs:/\bTotal\s+Carbohydrate\s*[:|]?\s*(\d+(?:\.\d+)?)\s*g\b/i,fat:/\bTotal\s+Fat\s*[:|]?\s*(\d+(?:\.\d+)?)\s*g\b/i,saturatedFat:/\bSaturated\s+Fat\s*[:|]?\s*(\d+(?:\.\d+)?)\s*g\b/i,transFat:/\bTrans\s+Fat\s*[:|]?\s*(\d+(?:\.\d+)?)\s*g\b/i,cholesterol:/\bCholesterol\s*[:|]?\s*(\d+(?:\.\d+)?)\s*mg\b/i,sodium:/\bSodium\s*[:|]?\s*(\d+(?:\.\d+)?)\s*mg\b/i,fiber:/\bDietary\s+Fiber\s*[:|]?\s*(\d+(?:\.\d+)?)\s*g\b/i,sugars:/\b(?:Total\s+)?Sugars\s*[:|]?\s*(\d+(?:\.\d+)?)\s*g\b/i,addedSugars:/(?:Includes\s+)(\d+(?:\.\d+)?)\s*g\s+Added\s+Sugars/i,vitaminD:/\bVitamin\s+D\s*[:|]?\s*(\d+(?:\.\d+)?)\s*(?:mcg|µg)\b/i,calcium:/\bCalcium\s*[:|]?\s*(\d+(?:\.\d+)?)\s*mg\b/i,iron:/\bIron\s*[:|]?\s*(\d+(?:\.\d+)?)\s*mg\b/i,potassium:/\bPotassium\s*[:|]?\s*(\d+(?:\.\d+)?)\s*mg\b/i};
 for(const [key,re]of Object.entries(patterns)){const m=text.match(re);if(m)nutrition[key]=Number(m[1]);}
 const count=text.match(/(\d+(?:\.\d+)?)\s+servings?\s+per\s+container/i)||text.match(/servings?\s+per\s+container\s*[:|]?\s*(\d+(?:\.\d+)?)/i);
 const size=text.match(/Serving\s+Size\s*[:|]?\s*([^\n|]+)/i);
 const servingSize=size?size[1].split(/\b(?:Total\s+(?:Fat|Carbohydrate)|Saturated\s+Fat|Cholesterol|Sodium|Dietary\s+Fiber|Sugars|Protein|Calories)\b/i)[0].trim():'';
 return {nutrition,...(count?{servingsPerContainer:Number(count[1])}:{}),...(servingSize?{servingSize}: {})};
}
