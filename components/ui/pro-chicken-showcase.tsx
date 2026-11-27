import {useRef} from 'react'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {useGSAP} from '@gsap/react'
gsap.registerPlugin(ScrollTrigger,useGSAP)
export type Locale='es'|'ca'|'en'
export type ProDishTuple=[string,string,string,string,string,string,string]
const copy:Record<Locale,ProDishTuple[]>={
 en:[['Signature flavour','Spiced','Chicken','Tender chicken, marinated in our signature spice blend and slowly smoked for a rich, bold flavour.','Bold & smoky','Signature spice','Ready in 15 min'],['Herb infused','Herb','Chicken','Juicy chicken slow-cooked with a blend of fresh herbs, olive oil and a touch of smoke.','Herb infused','Slow smoked','Gluten-free']],
 es:[['Sabor de autor','Pollo','especiado','Pollo tierno, marinado con nuestra mezcla de especias y ahumado lentamente para un sabor intenso.','Sabor ahumado','Mezcla de especias','Listo en 15 min'],['Aromas del campo','Pollo','a las hierbas','Pollo jugoso, cocinado lentamente con hierbas aromáticas, aceite de oliva y un toque de humo.','Hierbas aromáticas','Ahumado lento','Sin gluten']],
 ca:[['Sabor d’autor','Pollastre','especiat','Pollastre tendre, marinat amb la nostra barreja d’espècies i fumat lentament per a un sabor intens.','Sabor fumat','Barreja d’espècies','Llest en 15 min'],['Aromes del camp','Pollastre','a les herbes','Pollastre sucós, cuinat lentament amb herbes aromàtiques, oli d’oliva i un toc de fum.','Herbes aromàtiques','Fumat lent','Sense gluten']]
}
function Icon({kind}:{kind:number}) {return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind===2?<><circle cx="16" cy="16" r="12"/><path d="M16 8v9l6 4"/></>:kind===1||kind===3?<><path d="M5 25C3 10 16 8 27 4c1 15-7 23-18 20M5 28 23 10M13 20v-7"/></>:kind===4?<><path d="M12 28c-15-12 5-13 2-24 13 10-1 13 5 24M22 7c8 7 4 12 1 15M6 12c-4 5-3 9 0 12"/></>:kind===5?<><path d="M16 3v26M16 12C7 12 7 5 7 5c8 0 9 7 9 7ZM16 20C7 20 7 13 7 13c8 0 9 7 9 7ZM16 12c9 0 9-7 9-7-8 0-9 7-9 7ZM16 20c9 0 9-7 9-7-8 0-9 7-9 7ZM3 29 29 3"/></>:<path d="M23 5c-5 0-3 6-6 10S8 23 3 24c13 7 24-3 24-14 0-3-2-5-4-5Zm0 0 2-4"/>}</svg>}
export default function ProChickenShowcase({lang='es',motion=true,assets={},proDishes=[]}:{lang?:Locale;motion?:boolean;assets?:Record<string,string>;proDishes?:ProDishTuple[]}){
 const ref=useRef<HTMLElement>(null)
 const asset=(name:string)=>assets[name]||'/assets/'+name
 const dishes=[...copy[lang],...(Array.isArray(proDishes)?proDishes:[])]
 useGSAP(()=>{
  const host=ref.current
  if(!host)return
  const releasePending=()=>host.parentElement?.removeAttribute('data-pro-pending')
  if(!motion||matchMedia('(prefers-reduced-motion: reduce)').matches){releasePending();return}
  let cancelled=false, timer=0
  const ctx=gsap.context(()=>{},ref)
  const clear=()=>{ctx.revert();delete host.dataset.scrollMotion}
  const setup=()=>{
   if(cancelled)return
   clear()
   if(innerWidth<=639){
    host.dataset.scrollMotion='phone'
    ctx.add(()=>{
     host.querySelectorAll<HTMLElement>('.ss-chicken-dish').forEach((dish)=>{
      gsap.set(dish,{autoAlpha:0,y:24})
      gsap.to(dish,{autoAlpha:1,y:0,duration:.75,ease:'power3.out',scrollTrigger:{trigger:dish,start:'top 82%',toggleActions:'play none none none',once:true}})
     })
    })
    ScrollTrigger.refresh()
    releasePending()
    return
   }
   if(innerWidth<=1024){releasePending();return}
   const desktop=matchMedia('(min-width: 801px) and (min-height: 650px)').matches
   host.dataset.scrollMotion=desktop?'sticky':'flow'
   ctx.add(()=>{
    const tl=gsap.timeline({paused:true,defaults:{ease:'none'}})
    const track=host.querySelector<HTMLElement>('.ss-chicken-composition')!
    const cards=host.querySelectorAll<HTMLElement>('.ss-chicken-dish')
    const brand=host.querySelector('.ss-chicken-brand')
    gsap.set(brand,{autoAlpha:1,y:0})
    tl.to(brand,{autoAlpha:0,y:-12,duration:.7,ease:'power1.out'},0)
    gsap.to(brand!.querySelector('img'),{scale:1.035,y:-5,duration:2.8,repeat:-1,yoyo:true,ease:'sine.inOut'})
    gsap.fromTo(brand!.querySelector('span'),{scaleX:.4,opacity:.4},{scaleX:1,opacity:1,duration:2,repeat:-1,yoyo:true,ease:'sine.inOut'})
    const hasMore=dishes.length>2
    const overflow=hasMore?Math.max(0,track.scrollWidth-host.clientWidth+80):0
    gsap.set(track,{x:0})
    gsap.set(cards,{autoAlpha:0,y:28,scale:.96})
    tl.to(cards,{autoAlpha:1,y:0,scale:1,duration:1.1,stagger:.18,ease:'power2.out'},.2)
    if(overflow>0)tl.to(track,{x:-overflow,duration:3.1,ease:'none'},.7)
    tl.fromTo(host.querySelector('.ss-chicken-bg'),{y:-45,scale:1.14},{y:45,scale:1.06,duration:4.2},0)
    const trigger=ScrollTrigger.create({animation:tl,trigger:host.parentElement,start:desktop?'top top':'top 85%',end:desktop?'bottom bottom':'bottom 90%',scrub:.65,invalidateOnRefresh:true})
    tl.progress(trigger.progress)
   })
   ScrollTrigger.refresh()
   releasePending()
  }
  setup()
  let layoutWidth=innerWidth
  let sticky=matchMedia('(min-width: 801px) and (min-height: 650px)').matches
  const resize=()=>{
   const nextSticky=matchMedia('(min-width: 801px) and (min-height: 650px)').matches
   if(innerWidth===layoutWidth&&nextSticky===sticky)return
   layoutWidth=innerWidth;sticky=nextSticky
   clearTimeout(timer);timer=window.setTimeout(setup,180)
  }
  window.addEventListener('resize',resize)
  return ()=>{cancelled=true;clearTimeout(timer);window.removeEventListener('resize',resize);clear()}

 },{scope:ref,dependencies:[motion,lang,dishes.length],revertOnUpdate:true})
 return <section ref={ref} className="ss-chicken-showcase" id="ss-signatures" aria-label={lang==='en'?'Signature B2B flavours':lang==='ca'?'Especialitats per a professionals':'Especialidades para profesionales'}>
  <img className="ss-chicken-bg" src={asset('pro-chicken-background.webp')} alt="" width="1536" height="1024" loading="lazy"/>
  <div className="ss-chicken-brand" aria-hidden="true"><img src={asset('smokers-loader-logo.png')} width="1680" height="386" alt=""/><p>{lang==='es'?'Fuego lento. Sabor intenso.':lang==='ca'?'Foc lent. Sabor intens.':'Slow fire. Bold flavour.'}</p><span/></div>
  <div className="ss-chicken-composition" data-has-more={dishes.length>2?'true':'false'}>{dishes.map((dish,i)=><article className={'ss-chicken-dish ss-chicken-dish-'+i} key={i}>
   <div className="ss-chicken-copy"><p className="ss-chicken-kicker">{dish[0]}</p><h2>{dish[1]} <em>{dish[2]}</em></h2><p className="ss-chicken-description">{dish[3]}</p><ul className="ss-chicken-facts">{dish.slice(4).map((fact,j)=><li key={j}><Icon kind={(i%2)*3+j}/><span>{fact}</span></li>)}</ul></div>
  </article>)}</div>
 </section>
}
