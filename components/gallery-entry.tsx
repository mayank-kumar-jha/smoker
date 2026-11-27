import {createRoot, type Root} from 'react-dom/client'
import PolaroidLineCarousel, {type Slide} from './ui/polaroid-line-carousel'

let mounted:{host:HTMLElement;root:Root;cleanup:()=>void}|undefined

window.SMOKERS_MOUNT_GALLERY=(scope:HTMLElement)=>{
 const host=scope.querySelector<HTMLElement>('.ss-gallery-mount')
 if(!host){mounted?.cleanup();mounted?.root.unmount();mounted=undefined;return}
 if(mounted?.host===host)return
 mounted?.cleanup();mounted?.root.unmount()
 const slides:Slide[]=[...host.querySelectorAll('figure')].map(figure=>{
  const img=figure.querySelector('img')
  return {image:img?.currentSrc||img?.src,title:figure.querySelector('figcaption')?.textContent||'',alt:img?.alt||''}
 })
 if(!slides.length)return
 const lang=scope.lang==='es'?'es':scope.lang==='ca'?'ca':'en'
 const labels={
  en:{region:'Smokers food gallery',previous:'Previous photo',next:'Next photo',position:(i:number,n:number,title:string)=>`Photo ${i} of ${n}: ${title}`},
  es:{region:'Galería de platos Smokers',previous:'Foto anterior',next:'Foto siguiente',position:(i:number,n:number,title:string)=>`Foto ${i} de ${n}: ${title}`},
  ca:{region:'Galeria de plats Smokers',previous:'Foto anterior',next:'Foto següent',position:(i:number,n:number,title:string)=>`Foto ${i} de ${n}: ${title}`}
 }[lang]
 const root=createRoot(host),reduced=matchMedia('(prefers-reduced-motion: reduce)')
 const render=()=>{const motion=scope.dataset.motion!=='off'&&!reduced.matches;root.render(<PolaroidLineCarousel slides={slides} height="100%" cardWidth={340} sag={24} swing={motion?0.65:0} autoplay={motion?5500:0} background="transparent" ink="#3e1d0d" string="#9b6945" ariaLabel={labels.region} previousLabel={labels.previous} nextLabel={labels.next} positionLabel={labels.position}/>)}
 reduced.addEventListener('change',render);scope.addEventListener('smokers:motion',render)
 mounted={host,root,cleanup:()=>{reduced.removeEventListener('change',render);scope.removeEventListener('smokers:motion',render)}}
 render()
}

declare global {interface Window {SMOKERS_MOUNT_GALLERY:(scope:HTMLElement)=>void}}
