import { renderToString } from 'react-dom/server'
import DishOrbitCarousel from './ui/dish-orbit-carousel'
import { localizedDishes, type MenuLanguage } from './ui/menu-locales'
export const menuPages=Object.fromEntries((['es','ca','en'] as MenuLanguage[]).map(lang=>[lang,localizedDishes(lang)]))
export const markups=Object.fromEntries((['es','ca','en'] as MenuLanguage[]).map(lang=>[lang,menuPages[lang].map((_,index)=>renderToString(<DishOrbitCarousel dishes={menuPages[lang]} language={lang} initialIndex={index}/>))]))
export const markup=markups.en[0]
