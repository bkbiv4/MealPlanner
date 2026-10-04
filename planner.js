const ingredient = (name, amount, unit, category) => ({name,amount,unit,category});
const r = (id,name,slot,emoji,p,c,f,time,vegetarian,ingredients,steps) => ({id,name,slot,emoji,p,c,f,time,vegetarian,ingredients:ingredients.map(x=>ingredient(...x)),steps});
export const recipes = [
 r('eggs','Spinach & feta eggs','breakfast','🍳',25,6,29,10,true,[['Eggs',3,'each','Protein & dairy'],['Spinach',50,'g','Produce'],['Feta',30,'g','Protein & dairy'],['Olive oil',5,'ml','Pantry']],['Sauté spinach in the oil.','Beat eggs, add to the pan and cook until set. Finish with crumbled feta.']),
 r('yogurt','Berry yogurt bowl','breakfast','🫐',28,35,13,5,true,[['Greek yogurt',250,'g','Protein & dairy'],['Berries',100,'g','Produce'],['Oats',25,'g','Pantry'],['Walnuts',15,'g','Pantry']],['Spoon yogurt into a bowl.','Top with berries, oats and chopped walnuts.']),
 r('oats','Banana overnight oats','breakfast','🍌',22,78,17,5,true,[['Oats',70,'g','Pantry'],['Milk',200,'ml','Protein & dairy'],['Banana',1,'each','Produce'],['Peanut butter',20,'g','Pantry']],['For immediate serving, simmer oats with milk until tender.','Slice banana and add it with peanut butter. For overnight preparation, follow verified storage guidance.']),
 r('avocado','Avocado cottage bowl','breakfast','🥑',30,12,28,5,true,[['Cottage cheese',200,'g','Protein & dairy'],['Avocado',1,'each','Produce'],['Tomatoes',100,'g','Produce']],['Slice avocado and tomatoes.','Serve over cottage cheese with your preferred seasoning.']),
 r('toast','Eggs on wholegrain toast','breakfast','🍞',27,48,20,10,true,[['Eggs',3,'each','Protein & dairy'],['Wholegrain bread',2,'slices','Pantry'],['Tomatoes',100,'g','Produce'],['Olive oil',5,'ml','Pantry']],['Toast the bread.','Cook eggs until set in the oil and serve with tomatoes.']),
 r('chicken','Chicken avocado salad','lunch','🥗',48,14,32,20,false,[['Chicken breast',180,'g','Protein & dairy'],['Avocado',1,'each','Produce'],['Mixed greens',80,'g','Produce'],['Tomatoes',100,'g','Produce'],['Olive oil',10,'ml','Pantry']],['Cook chicken fully, following verified safe-temperature guidance.','Slice and serve with chopped avocado, greens and tomatoes. Dress with oil.']),
 r('rice','Chicken & rice bowl','lunch','🍚',52,85,16,25,false,[['Chicken breast',180,'g','Protein & dairy'],['Rice (dry)',100,'g','Pantry'],['Broccoli',150,'g','Produce'],['Olive oil',10,'ml','Pantry']],['Cook rice according to its package directions.','Cook chicken fully and steam broccoli. Assemble with oil and seasoning.']),
 r('chickpea','Chickpea quinoa bowl','lunch','🥙',25,80,22,20,true,[['Chickpeas (drained)',180,'g','Pantry'],['Quinoa (dry)',60,'g','Pantry'],['Cucumber',100,'g','Produce'],['Feta',40,'g','Protein & dairy'],['Olive oil',10,'ml','Pantry']],['Cook quinoa according to package directions.','Combine with chickpeas, diced cucumber, feta and oil.']),
 r('tuna','Tuna crunch lettuce cups','lunch','🥬',42,9,25,10,false,[['Tuna (drained)',160,'g','Protein & dairy'],['Lettuce',100,'g','Produce'],['Cucumber',100,'g','Produce'],['Mayonnaise',30,'g','Pantry']],['Mix drained tuna, diced cucumber and mayonnaise.','Spoon into lettuce leaves immediately before serving.']),
 r('tofu','Tofu sesame noodles','lunch','🍜',32,75,24,20,true,[['Tofu',200,'g','Protein & dairy'],['Noodles (dry)',80,'g','Pantry'],['Carrots',100,'g','Produce'],['Sesame oil',10,'ml','Pantry'],['Soy sauce',15,'ml','Pantry']],['Cook noodles according to package directions.','Sauté tofu and carrots. Toss with noodles, sesame oil and soy sauce.']),
 r('salmon','Salmon & green vegetables','dinner','🐟',45,16,32,25,false,[['Salmon',200,'g','Protein & dairy'],['Broccoli',200,'g','Produce'],['Zucchini',150,'g','Produce'],['Olive oil',10,'ml','Pantry']],['Roast or pan cook salmon fully, following verified safe-temperature guidance.','Cook broccoli and zucchini in oil and serve together.']),
 r('pasta','Turkey tomato pasta','dinner','🍝',50,92,20,25,false,[['Ground turkey',180,'g','Protein & dairy'],['Pasta (dry)',110,'g','Pantry'],['Tomato sauce',150,'g','Pantry'],['Spinach',60,'g','Produce'],['Olive oil',5,'ml','Pantry']],['Cook pasta according to package directions.','Brown turkey fully, add sauce and spinach, and simmer. Toss with pasta.']),
 r('lentils','Lentil sweet potato bowl','dinner','🍠',27,98,17,30,true,[['Lentils (cooked)',220,'g','Pantry'],['Sweet potato',250,'g','Produce'],['Spinach',80,'g','Produce'],['Greek yogurt',80,'g','Protein & dairy'],['Olive oil',10,'ml','Pantry']],['Dice sweet potato and cook until tender in a covered pan with oil and a little water.','Heat lentils with spinach. Serve with sweet potato and yogurt.']),
 r('beef','Beef & broccoli skillet','dinner','🥦',48,15,33,20,false,[['Beef strips',200,'g','Protein & dairy'],['Broccoli',200,'g','Produce'],['Soy sauce',15,'ml','Pantry'],['Olive oil',10,'ml','Pantry']],['Cook beef fully, following verified safe-temperature guidance.','Sauté broccoli, add soy sauce and combine with beef.']),
 r('frittata','Garden feta frittata','dinner','🌿',32,14,35,20,true,[['Eggs',4,'each','Protein & dairy'],['Zucchini',150,'g','Produce'],['Spinach',60,'g','Produce'],['Feta',50,'g','Protein & dairy'],['Olive oil',5,'ml','Pantry']],['Sauté chopped vegetables in oil.','Add beaten eggs and feta. Cover and cook gently until eggs are fully set.']),
 r('beanrice','Black bean rice skillet','dinner','🫘',26,105,18,25,true,[['Black beans (drained)',220,'g','Pantry'],['Rice (dry)',90,'g','Pantry'],['Tomatoes',150,'g','Produce'],['Avocado',0.5,'each','Produce']],['Cook rice according to package directions.','Heat beans with chopped tomatoes. Serve over rice with avocado.'])
];
export const slots=['breakfast','lunch','dinner'];
export const presets={balanced:{protein:120,carbs:180,fat:70},keto:{protein:120,carbs:35,fat:100},carb:{protein:120,carbs:280,fat:60},vegetarian:{protein:90,carbs:220,fat:70},custom:{protein:120,carbs:180,fat:70}};
export const recipeById=id=>recipes.find(r=>r.id===id);
export function eligible(recipe,s){const exclusions=s.exclude.toLowerCase().split(',').map(x=>x.trim()).filter(Boolean);return (s.diet!=='vegetarian'||recipe.vegetarian)&&!exclusions.some(x=>recipe.ingredients.some(i=>i.name.toLowerCase().includes(x)));}
export function totals(meals){return meals.reduce((a,m)=>{const r=recipeById(m.id);if(!r)return a;for(const key of ['p','c','f','time'])a[key]+=r[key]* (key==='time'?1:m.portion);return a;},{p:0,c:0,f:0,time:0});}
export const calories=t=>Math.round(t.p*4+t.c*4+t.f*9);
export function score(meals,s){const t=totals(meals);return Math.abs(t.p-s.protein)/Math.max(s.protein,20)+Math.abs(t.c-s.carbs)/Math.max(s.carbs,25)+Math.abs(t.f-s.fat)/Math.max(s.fat,10);}
export function generate(s,previous=[]){
 const result=[],usage={};
 for(let day=0;day<7;day++){
  const choices=slots.map((slot,index)=>{
   const locked=previous[day]?.[index];
   if(locked?.locked&&recipeById(locked.id)&&eligible(recipeById(locked.id),s))return [locked];
   return recipes.filter(r=>r.slot===slot&&eligible(r,s)).flatMap(r=>[0.75,1,1.25,1.5].map(portion=>({id:r.id,portion,locked:false})));
  });
  let best=null,bestScore=Infinity;
  for(const b of choices[0])for(const l of choices[1])for(const d of choices[2]){
   const meals=[b,l,d];if(totals(meals).time>s.minutes)continue;
   const value=score(meals,s)+meals.reduce((n,m)=>n+(usage[m.id]||0)*0.08,0);
   if(value<bestScore){best=meals;bestScore=value;}
  }
  result.push(best||[]);for(const m of best||[])usage[m.id]=(usage[m.id]||0)+1;
 }
 return result;
}
export function groceries(plan,people){const items=new Map();for(const day of plan)for(const m of day){const r=recipeById(m.id);for(const i of r.ingredients){const key=i.name+'|'+i.unit;const item=items.get(key)||{...i,amount:0,key};item.amount+=i.amount*m.portion*people;items.set(key,item);}}return [...items.values()].sort((a,b)=>a.category.localeCompare(b.category)||a.name.localeCompare(b.name));}
export function swap(plan,day,index,s){const meals=plan[day];if(!meals?.[index]||meals[index].locked)return false;const current=meals[index];const candidates=recipes.filter(r=>r.slot===slots[index]&&r.id!==current.id&&eligible(r,s)).flatMap(r=>[0.75,1,1.25,1.5].map(portion=>({id:r.id,portion,locked:false}))).filter(m=>{const copy=[...meals];copy[index]=m;return totals(copy).time<=s.minutes;});candidates.sort((a,b)=>{const x=[...meals],y=[...meals];x[index]=a;y[index]=b;return score(x,s)-score(y,s);});if(!candidates.length)return false;meals[index]=candidates[0];return true;}
