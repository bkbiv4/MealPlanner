import {nutritionFields} from './products.js';
export const batchUnits=['packages','servings','grams','pieces'];
const positive=(value,label)=>{const n=Number(value);if(!Number.isFinite(n)||n<=0||n>100000)throw new Error(`${label} must be greater than zero.`);return n;};
export function validateBatch(input,products){
 const name=String(input.name||'').trim().slice(0,200);if(!name)throw new Error('Name your batch.');
 const portions=positive(input.portions,'Meal portions');if(!Number.isInteger(portions)||portions>1000)throw new Error('Use a whole number of meal portions, up to 1000.');
 if(!Array.isArray(input.ingredients)||!input.ingredients.length||input.ingredients.length>50)throw new Error('Add at least one ingredient (up to 50).');
 const ingredients=input.ingredients.map(row=>{const productId=String(row.productId);if(!products.some(p=>p.id===productId))throw new Error('One ingredient is not in the Food Library.');if(!batchUnits.includes(row.unit))throw new Error('Choose a valid ingredient unit.');return {productId,amount:positive(row.amount,'Ingredient amount'),unit:row.unit,unitsPerPackage:['grams','pieces'].includes(row.unit)?positive(row.unitsPerPackage,'Amount per package'):null};});
 const assignments=(input.assignments||[]).map(a=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(a.date)||new Date(a.date+'T12:00:00Z').toISOString().slice(0,10)!==a.date)throw new Error('Choose a valid meal date.');if(!['breakfast','lunch','dinner'].includes(a.slot))throw new Error('Choose a meal slot.');return {date:a.date,slot:a.slot,portions:positive(a.portions,'Assigned portions')};});
 if(assignments.length>1000)throw new Error('Too many scheduled meals.');
 if(new Set(assignments.map(a=>a.date+'|'+a.slot)).size!==assignments.length)throw new Error('This batch already occupies that meal slot.');
 if(assignments.reduce((n,a)=>n+a.portions,0)>portions+1e-8)throw new Error('You cannot schedule more portions than the batch makes.');
 let prepMinutes=null;if(input.prepMinutes!==null&&input.prepMinutes!==undefined&&input.prepMinutes!==''){prepMinutes=positive(input.prepMinutes,'Prep minutes');}
 return {name,portions,ingredients,assignments,prepMinutes,notes:String(input.notes||'').slice(0,3000)};
}
export function packageAmount(row,product){if(row.unit==='packages')return row.amount;if(row.unit==='servings')return product.servingsPerContainer>0?row.amount/product.servingsPerContainer:null;return row.unitsPerPackage>0?row.amount/row.unitsPerPackage:null;}
export function calculateBatch(batch,products){
 const byId=new Map(products.map(p=>[p.id,p]));const rows=batch.ingredients.map(row=>{const product=byId.get(row.productId);if(!product)return {...row,product:null,packages:null,labelServings:null,cost:null};const packages=packageAmount(row,product);return {...row,product,packages,labelServings:row.unit==='servings'?row.amount:packages!==null&&product.servingsPerContainer>0?packages*product.servingsPerContainer:null,cost:packages!==null&&(product.currentPrice??product.discountedPrice??product.regularPrice)!==null?packages*(product.currentPrice??product.discountedPrice??product.regularPrice):null};});
 const nutrition={};const knownNutrition={};for(const [key]of nutritionFields){knownNutrition[key]=rows.reduce((n,row)=>n+(row.labelServings!==null&&row.product?.nutrition[key]!==null&&row.product?.nutrition[key]!==undefined?row.labelServings*row.product.nutrition[key]:0),0);nutrition[key]=rows.every(row=>row.labelServings!==null&&row.product?.nutrition[key]!==null&&row.product?.nutrition[key]!==undefined)?knownNutrition[key]:null;}
 const cost=rows.every(row=>row.cost!==null)?rows.reduce((n,r)=>n+r.cost,0):null;
 const packageUse=new Map();for(const row of rows){const old=packageUse.get(row.productId)||{product:row.product,packages:0,known:true};old.known&&=row.packages!==null;if(row.packages!==null)old.packages+=row.packages;packageUse.set(row.productId,old);}
 const shopping=[...packageUse.values()].map(x=>({...x,buyPackages:x.known?Math.ceil(x.packages-1e-9):null,remainderPackages:x.known?Math.ceil(x.packages-1e-9)-x.packages:null}));
 const purchaseCost=shopping.every(x=>x.buyPackages!==null&&x.product&&(x.product.currentPrice??x.product.discountedPrice??x.product.regularPrice)!==null)?shopping.reduce((n,x)=>n+x.buyPackages*(x.product.currentPrice??x.product.discountedPrice??x.product.regularPrice),0):null;
 const scheduled=batch.assignments.reduce((n,a)=>n+a.portions,0);
 return {rows,nutrition,knownNutrition,perPortion:Object.fromEntries(nutritionFields.map(([key])=>[key,nutrition[key]===null?null:nutrition[key]/batch.portions])),cost,costPerPortion:cost===null?null:cost/batch.portions,shopping,purchaseCost,scheduled,remaining:batch.portions-scheduled};
}
export function assignmentAt(batches,date,slot){for(const batch of batches){const assignment=batch.assignments.find(a=>a.date===date&&a.slot===slot);if(assignment)return {batch,assignment};}return null;}
