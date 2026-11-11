import {renderToString} from 'react-dom/server'
import ProChickenShowcase,{type Locale} from './ui/pro-chicken-showcase'
export const markup=Object.fromEntries((['es','ca','en'] as Locale[]).map(lang=>[lang,renderToString(<ProChickenShowcase lang={lang}/>)]))
