"use client"
import { useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
gsap.registerPlugin(SplitText, ScrollTrigger, useGSAP)

// Shared by the standalone component and the professional section's single timeline.
export function blockReveal(host: HTMLElement, timeline: gsap.core.Timeline, at = 0, color = 'var(--orange)', duration = .55, stagger = .08) {
 const split = SplitText.create(host, {type:'lines', linesClass:'ss-block-line', aria:'auto'})
 split.lines.forEach((line, index) => {
  const wrapper = document.createElement('div')
  wrapper.className = 'ss-block-clip'
  line.parentNode!.insertBefore(wrapper, line)
  wrapper.appendChild(line)
  const block = document.createElement('span')
  block.className = 'ss-block-wipe'
  block.setAttribute('aria-hidden','true')
  block.style.background = color
  wrapper.appendChild(block)
  gsap.set(line,{opacity:0})
  gsap.set(block,{scaleX:0,transformOrigin:'left center'})
  const start = at + index * stagger
  timeline.to(block,{scaleX:1,duration,ease:'power3.inOut'},start)
   .set(line,{opacity:1},start+duration)
   .set(block,{transformOrigin:'right center'},start+duration)
   .to(block,{scaleX:0,duration,ease:'power3.inOut'},start+duration)
 })
 return () => split.revert()
}

type Props = {children:ReactNode; animateOnScroll?:boolean; delay?:number; blockColor?:string; stagger?:number; duration?:number; managed?:boolean}
export default function TextBlockAnimation({children,animateOnScroll=true,delay=0,blockColor='var(--orange)',stagger=.08,duration=.55,managed=false}:Props) {
 const ref=useRef<HTMLDivElement>(null)
 useGSAP(()=>{
  if(managed || !ref.current || matchMedia('(prefers-reduced-motion: reduce)').matches)return
  let dispose: (()=>void)|undefined
  let cancelled=false
  const ctx=gsap.context(()=>{},ref)
  document.fonts.ready.then(()=>{if(cancelled)return;ctx.add(()=>{
   const tl=gsap.timeline({delay,scrollTrigger:animateOnScroll?{trigger:ref.current,start:'top 85%',once:true}:undefined})
   dispose=blockReveal(ref.current!,tl,0,blockColor,duration,stagger)
  })})
  return ()=>{cancelled=true;ctx.revert();dispose?.()}
 },{scope:ref,dependencies:[managed,animateOnScroll,delay,blockColor,stagger,duration],revertOnUpdate:true})
 return <div className="ss-text-block" data-block-reveal={managed?'':undefined} ref={ref}>{children}</div>
}
