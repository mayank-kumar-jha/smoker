import {useRef} from 'react'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {useGSAP} from '@gsap/react'
gsap.registerPlugin(ScrollTrigger,useGSAP)
export type Locale='es'|'ca'|'en'
const copy={
 en:[['Signature flavour','Spiced','Chicken','Tender chicken, marinated in our signature spice blend and slowly smoked for a rich, bold flavour.','Bold & smoky','Signature spice','Ready in 15 min'],['Herb infused','Herb','Chicken','Juicy chicken slow-cooked with a blend of fresh herbs, olive oil and a touch of smoke.','Herb infused','Slow smoked','Gluten-free']],
 es:[['Sabor de autor','Pollo','especiado','Pollo tierno, marinado con nuestra mezcla de especias y ahumado lentamente para un sabor intenso.','Sabor ahumado','Mezcla de especias','Listo en 15 min'],['Aromas del campo','Pollo','a las hierbas','Pollo jugoso, cocinado lentamente con hierbas aromáticas, aceite de oliva y un toque de humo.','Hierbas aromáticas','Ahumado lento','Sin gluten']],
 ca:[['Sabor d’autor','Pollastre','especiat','Pollastre tendre, marinat amb la nostra barreja d’espècies i fumat lentament per a un sabor intens.','Sabor fumat','Barreja d’espècies','Llest en 15 min'],['Aromes del camp','Pollastre','a les herbes','Pollastre sucós, cuinat lentament amb herbes aromàtiques, oli d’oliva i un toc de fum.','Herbes aromàtiques','Fumat lent','Sense gluten']]
}
function Icon({kind}:{kind:number}) {return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind===2?<><circle cx="16" cy="16" r="12"/><path d="M16 8v9l6 4"/></>:kind===1||kind===3?<><path d="M5 25C3 10 16 8 27 4c1 15-7 23-18 20M5 28 23 10M13 20v-7"/></>:kind===4?<><path d="M12 28c-15-12 5-13 2-24 13 10-1 13 5 24M22 7c8 7 4 12 1 15M6 12c-4 5-3 9 0 12"/></>:kind===5?<><path d="M16 3v26M16 12C7 12 7 5 7 5c8 0 9 7 9 7ZM16 20C7 20 7 13 7 13c8 0 9 7 9 7ZM16 12c9 0 9-7 9-7-8 0-9 7-9 7ZM16 20c9 0 9-7 9-7-8 0-9 7-9 7ZM3 29 29 3"/></>:<path d="M23 5c-5 0-3 6-6 10S8 23 3 24c13 7 24-3 24-14 0-3-2-5-4-5Zm0 0 2-4"/>}</svg>}
export default function ProChickenShowcase({lang='es',motion=true,assets={}}:{lang?:Locale;motion?:boolean;assets?:Record<string,string>}){
 const ref=useRef<HTMLElement>(null)
 const asset=(name:string)=>assets[name]||'/assets/'+name
 useGSAP(()=>{
  const host=ref.current
  if(!host||!motion||matchMedia('(prefers-reduced-motion: reduce)').matches)return
  let cancelled=false, timer=0
  const ctx=gsap.context(()=>{},ref)
  const clear=()=>{ctx.revert();delete host.dataset.scrollMotion}
  const setup=()=>{
   if(cancelled)return
   clear()
   if(innerWidth<=639){
    host.dataset.scrollMotion='phone'
    ctx.add(()=>{
     host.querySelectorAll<HTMLElement>('.ss-chicken-dish').forEach((dish,i)=>{
      const plate=dish.querySelector('.ss-chicken-plate'),copy=dish.querySelector('.ss-chicken-copy')
      gsap.set(plate,{autoAlpha:0,x:i?60:-60,rotation:i?25:-25,scale:.9})
      gsap.set(copy,{autoAlpha:0,y:24})
      const tl=gsap.timeline({scrollTrigger:{trigger:dish,start:'top 78%',toggleActions:'play none none none',once:true},defaults:{ease:'power3.out'}})
      tl.to(plate,{autoAlpha:1,x:0,rotation:0,scale:1,duration:1},0)
        .to(copy,{autoAlpha:1,y:0,duration:.8},.15)
     })
    })
    ScrollTrigger.refresh()
    return
   }
   if(innerWidth<=1024)return
   const desktop=matchMedia('(min-width: 801px) and (min-height: 650px)').matches
   host.dataset.scrollMotion=desktop?'sticky':'flow'
   ctx.add(()=>{
    const tl=gsap.timeline({paused:true,defaults:{ease:'none'}})
    const plates=host.querySelectorAll('.ss-chicken-plate')
    const brand=host.querySelector('.ss-chicken-brand')
    gsap.set(brand,{autoAlpha:1,y:0})
    tl.to(brand,{autoAlpha:0,y:-12,duration:.7,ease:'power1.out'},0)
    // Quiet breathing while the branded opening is waiting for the next scroll.
    gsap.to(brand!.querySelector('img'),{scale:1.035,y:-5,duration:2.8,repeat:-1,yoyo:true,ease:'sine.inOut'})
    gsap.fromTo(brand!.querySelector('span'),{scaleX:.4,opacity:.4},{scaleX:1,opacity:1,duration:2,repeat:-1,yoyo:true,ease:'sine.inOut'})
    // Establish every initial state synchronously, including delayed/staggered children.
    gsap.set(plates,{autoAlpha:0,x:(i:number)=>(i?1:-1)*Math.min(innerWidth*.65,850),y:(i:number)=>i?130:-60,rotation:(i:number)=>i?155:-155,scale:.82})
    gsap.set(host.querySelectorAll('.ss-chicken-kicker,.ss-chicken-copy h2,.ss-chicken-description'),{opacity:0,y:12})
    gsap.set(host.querySelectorAll('.ss-chicken-facts'),{opacity:0,y:32})
    tl.to(plates,{autoAlpha:1,x:0,y:0,rotation:0,scale:1,duration:2.8,stagger:.25,ease:'power2.out'},0)
    tl.fromTo(host.querySelector('.ss-chicken-bg'),{y:-45,scale:1.14},{y:45,scale:1.06,duration:4.2},0)
    host.querySelectorAll<HTMLElement>('.ss-chicken-copy').forEach((copy,i)=>{
     tl.to(copy.querySelectorAll('.ss-chicken-kicker,h2,.ss-chicken-description'),{opacity:1,y:0,duration:.95,stagger:.12,ease:'power2.out'},.35+i*.48)
    })
    tl.to(host.querySelectorAll('.ss-chicken-facts'),{opacity:1,y:0,duration:.7,stagger:.3},2.25)
    const trigger=ScrollTrigger.create({animation:tl,trigger:host.parentElement,start:desktop?'top top':'top 85%',end:desktop?'bottom bottom':'bottom 90%',scrub:.65,invalidateOnRefresh:true})
    // Restore the actual scroll position immediately after mount or a resize.
    tl.progress(trigger.progress)
   })
   ScrollTrigger.refresh()
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

 },{scope:ref,dependencies:[motion,lang],revertOnUpdate:true})
 return <section ref={ref} className="ss-chicken-showcase" id="ss-signatures" aria-label={lang==='en'?'Two signature chicken dishes':lang==='ca'?'Dues especialitats de pollastre':'Dos especialidades de pollo'}>
  <img className="ss-chicken-bg" src={asset('pro-chicken-background.webp')} alt="" width="1536" height="1024" loading="lazy"/>
  <div className="ss-chicken-brand" aria-hidden="true"><img src={asset('smokers-loader-logo.png')} width="1680" height="386" alt=""/><p>{lang==='es'?'Fuego lento. Sabor intenso.':lang==='ca'?'Foc lent. Sabor intens.':'Slow fire. Bold flavour.'}</p><span/></div>
  <div className="ss-chicken-composition">{copy[lang].map((dish,i)=><article className={'ss-chicken-dish ss-chicken-dish-'+i} key={i}>
   <img className="ss-chicken-plate" src={asset(i?'pro-chicken-herb.webp':'pro-chicken-spiced.webp')} alt={dish[1]+' '+dish[2]} width="1024" height="1024" loading="lazy" decoding="async"/>
   <div className="ss-chicken-copy"><p className="ss-chicken-kicker">{dish[0]}</p><h2>{dish[1]} <em>{dish[2]}</em></h2><p className="ss-chicken-description">{dish[3]}</p><ul className="ss-chicken-facts">{dish.slice(4).map((fact,j)=><li key={fact}><Icon kind={i*3+j}/><span>{fact}</span></li>)}</ul></div>
  </article>)}</div>
 </section>
}
