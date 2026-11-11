import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
export function mountProChapters(scope:HTMLElement,motion:boolean){
 if(scope.dataset.mode!=='profesional'||!motion||matchMedia('(prefers-reduced-motion: reduce)').matches)return ()=>{}
 const timelines:gsap.core.Timeline[]=[]
 const ctx=gsap.context(()=>{
  for(const selector of ['.ss-catalogue','.ss-faq']){
   const section=scope.querySelector<HTMLElement>(selector);if(!section)continue
   const targets=selector==='.ss-catalogue'?section.querySelectorAll('.ss-catalogue-copy>.ss-eyebrow,.ss-catalogue-copy>h2,.ss-catalogue-copy>.ss-lead,.ss-catalogue-steps li,.ss-catalogue-form'):section.querySelectorAll('.ss-eyebrow,h2,.ss-faq-photo,.ss-faq-answers')
   const tl=gsap.timeline({scrollTrigger:{trigger:section,start:'top 78%',toggleActions:'play none none reverse'},defaults:{ease:'power3.out'}})
   tl.fromTo(targets,{opacity:0,y:55,x:(i:number)=>i===targets.length-1?55:0},{opacity:1,y:0,x:0,duration:1.25,stagger:.1},0)
   timelines.push(tl)
  }
 },scope)
 const focus=(event:FocusEvent)=>{const el=event.target as HTMLElement;const section=el.closest('.ss-catalogue,.ss-faq');if(section)timelines.forEach(tl=>{if(tl.scrollTrigger?.trigger===section)tl.progress(1)})}
 scope.addEventListener('focusin',focus)
 return ()=>{scope.removeEventListener('focusin',focus);ctx.revert()}
}
