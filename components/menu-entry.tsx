import { hydrateRoot, createRoot, type Root } from 'react-dom/client'
import { useEffect, useState } from 'react'
import DishOrbitCarousel from './ui/dish-orbit-carousel'
import { localizedDishes, type MenuLanguage } from './ui/menu-locales'
import { StrokeDrawType } from './ui/stroke-draw-type'
let titleRoot:Root|undefined,titleHost:HTMLElement|undefined
let mounted:{host:HTMLElement;root:Root}|undefined
function Menu({scope,host}:{scope:HTMLElement;host:HTMLElement}){
 const language=(scope.lang||'es') as MenuLanguage
 const initial=Number(host.dataset.flavour||0)
 const [selected,setSelected]=useState(initial)
 const [dishes]=useState(()=>localizedDishes(language).map(d=>({...d,image:window.SMOKERS_ASSETS?.[d.image.split('/').pop()!]||d.image})))
 const order=()=>document.getElementById('ss-pedir')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})
 const sync=(index:number)=>{
  const dish=dishes[index],title=dish.label+' | Smokers · Badalona'
  document.title=title
  document.querySelector('meta[name="description"]')?.setAttribute('content',dish.seoDescription)
  const canonical=document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  const origin=canonical?new URL(canonical.href).origin:location.origin
  canonical?.setAttribute('href',origin+dish.href)
  for(const [key,value] of [['title',title],['description',dish.seoDescription],['url',origin+dish.href]])document.querySelector(`meta[property="og:${key}"]`)?.setAttribute('content',value)
  for(const [key,value] of [['title',title],['description',dish.seoDescription]])document.querySelector(`meta[name="twitter:${key}"]`)?.setAttribute('content',value)
  for(const lang of ['es','ca','en'] as MenuLanguage[]){
   const href=localizedDishes(lang)[index].href
   document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`)?.setAttribute('href',origin+href)
   scope.querySelectorAll(`.ss-languages a[hreflang="${lang}"]`).forEach(a=>a.setAttribute('href',href))
  }
 }
 useEffect(()=>{
  if(window.SMOKERS_STANDALONE)return
  const originalTitle=document.title
  const nodes=[...document.querySelectorAll('meta[name="description"],meta[property^="og:"],meta[name^="twitter:"],link[rel="canonical"],link[rel="alternate"],.ss-languages a[hreflang]')]
  const attributes=nodes.map(node=>[...node.attributes].map(a=>[a.name,a.value]))
  const back=()=>{
   const index=dishes.findIndex(d=>d.href===location.pathname)
   setSelected(index<0?initial:index)
   if(index>=0)sync(index)
   else {document.title=originalTitle;nodes.forEach((node,i)=>attributes[i].forEach(([name,value])=>node.setAttribute(name,value)))}
  }
  addEventListener('popstate',back)
  let alive=true
  if(host.dataset.flavour!==undefined)document.fonts.ready.then(()=>{if(alive&&!location.hash)host.closest('section')?.scrollIntoView({behavior:'instant',block:'start'})})
  return()=>{alive=false;removeEventListener('popstate',back)}
 },[])
 const change=(index:number)=>{
  setSelected(index)
  if(window.SMOKERS_STANDALONE)return
  if(location.pathname!==dishes[index].href)history.pushState({flavour:index},'',dishes[index].href)
  sync(index)
 }
 return <DishOrbitCarousel dishes={dishes} language={language} initialIndex={initial} selectedIndex={selected} onChange={change} fontSrc={null} onOrder={order}/>
}
window.SMOKERS_MOUNT_ORBIT=(scope:HTMLElement)=>{
 const title=scope.querySelector<HTMLElement>('.ss-eat-animation')
 if(title!==titleHost){titleRoot?.unmount();titleRoot=undefined;titleHost=title||undefined;if(title){titleRoot=createRoot(title.querySelector<HTMLElement>('.ss-eat-effect')!);titleRoot.render(<StrokeDrawType text={title.dataset.text!} host={title}/>)}}
 const host=scope.querySelector<HTMLElement>('.ss-orbit-mount')
 if(!host){mounted?.root.unmount();mounted=undefined;return}
 if(mounted?.host===host)return
 mounted?.root.unmount()
 const content=<Menu scope={scope} host={host}/>,hydrate=host.hasChildNodes()&&!window.SMOKERS_STANDALONE
 const root=hydrate?hydrateRoot(host,content):createRoot(host)
 if(!hydrate)root.render(content)
 mounted={host,root}
}
declare global{interface Window{SMOKERS_ASSETS?:Record<string,string>;SMOKERS_STANDALONE?:boolean;SMOKERS_MOUNT_ORBIT:(scope:HTMLElement)=>void}}
