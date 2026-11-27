import { hydrateRoot, createRoot, type Root } from 'react-dom/client'
import { useState } from 'react'
import DishOrbitCarousel from './ui/dish-orbit-carousel'
import { localizedDishes, type MenuLanguage } from './ui/menu-locales'
let mounted:{host:HTMLElement;root:Root}|undefined
function Menu({scope,host}:{scope:HTMLElement;host:HTMLElement}){
 const language=(scope.lang||'es') as MenuLanguage
 const flavour=Number(host.dataset.flavour||0),single=scope.dataset.mode==='flavour'
 const [selected,setSelected]=useState(0)
 const [dishes]=useState(()=>localizedDishes(language).filter((_,i)=>!single||i===flavour).map(d=>({...d,image:window.SMOKERS_ASSETS?.[d.image.split('/').pop()!]||d.image})))
 const order=()=>document.getElementById('ss-pedir')?.scrollIntoView({behavior:scope.dataset.motion==='off'||matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})
 return <DishOrbitCarousel dishes={dishes} language={language} initialIndex={0} selectedIndex={selected} onChange={setSelected} fontSrc={null} onOrder={order}/>
}
window.SMOKERS_MOUNT_ORBIT=(scope:HTMLElement)=>{
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
