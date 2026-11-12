import { dishes } from './menu-dishes'
export type MenuLanguage = 'en' | 'es' | 'ca'
const bases = {en:'/en/at-home/menu/',es:'/es/en-casa/carta/',ca:'/ca/a-casa/carta/'}
const translations = {
 es: [
  ['Carrillada de','cerdo ahumada','carrillada-de-cerdo-ahumada','Carrillera marinada 12 horas, ahumada 4 horas con leña y cocinada a baja temperatura hasta que se deshace. Ni cuchillo.'],
  ['Pollo a las','especias','pollo-a-las-especias','Pollo marinado con nuestra mezcla de especias y ahumado con leña. Crujiente por fuera, jugoso por dentro.'],
  ['Pollo a las','hierbas','pollo-a-las-hierbas','Pollo marinado con hierbas mediterráneas, ahumado suave y asado lentamente. El favorito de cada día.'],
  ['Canelones de','carne','canelones-de-carne','Canelones de carne a la catalana, con bechamel y nuestro toque de humo. La receta de siempre, con nuestro método.'],
  ['Ensalada','Smokers','ensalada-smokers','Ensalada Smokers. Completa tu pedido. Consulta disponibilidad, ingredientes y alérgenos en Glovo o Uber Eats.'],
  ['Patatas a la','trufa','patatas-a-la-trufa','Patatas a la trufa. Completa tu pedido. Consulta disponibilidad, ingredientes y alérgenos en Glovo o Uber Eats.'],
  ['Patatas','Smokers','patatas-smokers','Patatas Smokers. Completa tu pedido. Consulta disponibilidad, ingredientes y alérgenos en Glovo o Uber Eats.'],
  ['Berenjena con','queso','berenjena-rellena-de-queso','Berenjena rellena de queso y dorada al horno. Consulta disponibilidad en Glovo o Uber Eats.']
 ],
 ca: [
  ['Galta de','porc fumada','galta-de-porc-fumada','Galta marinada 12 hores, fumada 4 hores amb llenya i cuita a baixa temperatura fins que es desfà. Sense ganivet.'],
  ['Pollastre a les','espècies','pollastre-a-les-especies','Pollastre marinat amb la nostra barreja d’espècies i fumat amb llenya. Cruixent per fora, sucós per dins.'],
  ['Pollastre a les','herbes','pollastre-a-les-herbes','Pollastre marinat amb herbes mediterrànies, fumat suau i rostit lentament. El favorit de cada dia.'],
  ['Canelons de','carn','canelons-de-carn','Canelons de carn a la catalana, amb beixamel i el nostre toc de fum. La recepta de sempre, amb el nostre mètode.'],
  ['Amanida','Smokers','amanida-smokers','Amanida Smokers. Completa la teva comanda. Consulta disponibilitat, ingredients i al·lèrgens a Glovo o Uber Eats.'],
  ['Patates amb','tòfona','patates-amb-tofona','Patates amb tòfona. Completa la teva comanda. Consulta disponibilitat, ingredients i al·lèrgens a Glovo o Uber Eats.'],
  ['Patates','Smokers','patates-smokers','Patates Smokers. Completa la teva comanda. Consulta disponibilitat, ingredients i al·lèrgens a Glovo o Uber Eats.'],
  ['Albergínia amb','formatge','alberginia-farcida-de-formatge','Albergínia farcida de formatge i daurada al forn. Consulta disponibilitat a Glovo o Uber Eats.']
 ]
}
const slugs=['pork-cheek','spiced-chicken','herb-chicken','meat-cannelloni','smokers-salad','truffle-potatoes','smokers-potatoes','cheese-stuffed-eggplant']
export const menuCopy={
 en:{dishes:'Dishes',choose:'Choose a dish',details:'View details',reheat:'How to reheat',overview:'Overview',ingredients:'Ingredients',order:'Order now',previous:'Previous dish',next:'Next dish',link:'Link to this dish',note:'Check the current ingredients and allergens on Glovo or Uber Eats before ordering.',meat:'Wood-smoked dishes',sides:'Salads & sides',vegetable:'Stuffed eggplant'},
 es:{dishes:'Platos',choose:'Elige un plato',details:'Ver detalles',reheat:'Cómo regenerar',overview:'Descripción',ingredients:'Ingredientes',order:'Pide ahora',previous:'Plato anterior',next:'Plato siguiente',link:'Enlace a este plato',note:'Consulta los ingredientes y alérgenos actualizados en Glovo o Uber Eats antes de pedir.',meat:'Platos ahumados con leña',sides:'Ensaladas y guarniciones',vegetable:'Berenjena rellena'},
 ca:{dishes:'Plats',choose:'Tria un plat',details:'Veure detalls',reheat:'Com regenerar',overview:'Descripció',ingredients:'Ingredients',order:'Demana ara',previous:'Plat anterior',next:'Plat següent',link:'Enllaç a aquest plat',note:'Consulta els ingredients i al·lèrgens actualitzats a Glovo o Uber Eats abans de demanar.',meat:'Plats fumats amb llenya',sides:'Amanides i guarnicions',vegetable:'Albergínia farcida'}
}
export function localizedDishes(lang:MenuLanguage){
 const copy=menuCopy[lang]
 return dishes.map((d,i)=>{
  const translated=lang==='en'?null:translations[lang][i]
  const title=translated?.[0]||d.title,subtitle=translated?.[1]||d.subtitle,label=title+' '+subtitle
  const category=i<4?copy.meat:i<7?copy.sides:copy.vegetable
  const seoDescription=(translated?.[3]||d.description)+' '+({en:'Explore this flavour in the Smokers menu and choose your next dish.',es:'Descubre este sabor en la carta de Smokers y elige tu próximo plato.',ca:'Descobreix aquest sabor a la carta de Smokers i tria el teu proper plat.'})[lang]
  return {...d,thumbnail:d.image.replace('.webp','-thumb.webp'),title,subtitle,label,seoDescription,description:translated?.[3]||d.description,ingredientsNote:copy.note,category,eyebrow:'SMOKERS · '+category.toLocaleUpperCase(lang),alt:lang==='en'?d.alt:label,href:(typeof window!=='undefined'&&window.SMOKERS_CMS?window.SMOKERS_CMS.url(bases[lang]+(translated?.[2]||slugs[i])+'/'):bases[lang]+(translated?.[2]||slugs[i])+'/')}
 })
}
