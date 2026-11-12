import {useLayoutEffect, useRef} from 'react'
import {gsap} from 'gsap'

/** Adapted from the supplied Stroke Draw Type: measured glyph outlines and a rising fill.
 * Uses the site's existing motion engine and leaves the real heading in the document. */
export function StrokeDrawType({text, host}:{text:string; host:HTMLElement}) {
 const ref=useRef<SVGSVGElement>(null)
 useLayoutEffect(()=>{
  let disposed=false; let timeline:gsap.core.Timeline|undefined; let resize:ResizeObserver|undefined
  const svg=ref.current!; const measure=svg.querySelector('text')!
  const reduced=matchMedia('(prefers-reduced-motion: reduce)')
  const ready=()=>document.dispatchEvent(new Event('ss:text-ready'))
  const stop=()=>{timeline?.kill();host.removeAttribute('data-drawing');host.removeAttribute('data-draw-state');ready()}
  const start=async()=>{
   await document.fonts.ready
   if(disposed||timeline)return
   if(reduced.matches||document.documentElement.dataset.ssTextFallback||document.querySelector('#smokers-site')?.getAttribute('data-motion')==='off'){ready();return}
   const box=measure.getBBox(),ns='http://www.w3.org/2000/svg'
   // Match the HTML font size and baseline, rather than fitting its font bounding box.
   // The font's ascenders/descenders include blank space that otherwise shrinks the SVG.
   const align=()=>{
    const marker=document.createElement('span')
    marker.style.cssText='display:inline-block;width:0;height:0;padding:0;margin:0'
    host.append(marker)
    const r=host.getBoundingClientRect(),baseline=marker.getBoundingClientRect().top-r.top
    marker.remove()
    const scale=parseFloat(getComputedStyle(host).fontSize)/100
    svg.setAttribute('viewBox',`0 ${-baseline/scale} ${r.width/scale} ${r.height/scale}`)
   }
   align();resize=new ResizeObserver(align);resize.observe(host)
   const strokes:SVGTextElement[]=[],fills:SVGRectElement[]=[]
   Array.from(text).forEach((ch,i)=>{
    if(!ch.trim())return
    const x=measure.getStartPositionOfChar(i).x
    const clip=document.createElementNS(ns,'clipPath'),rect=document.createElementNS(ns,'rect')
    clip.id=`eat-fill-${i}`; rect.setAttribute('x',String(box.x-100));rect.setAttribute('y',String(box.y+box.height+20));rect.setAttribute('width',String(box.width+200));rect.setAttribute('height',String(box.height+40));clip.append(rect);svg.append(clip);fills.push(rect)
    const letter=()=>{const el=document.createElementNS(ns,'text');el.setAttribute('x',String(x));el.setAttribute('y','0');el.textContent=ch;return el}
    const fill=letter();fill.setAttribute('fill','currentColor');fill.setAttribute('clip-path',`url(#${clip.id})`);svg.append(fill)
    const stroke=letter();stroke.setAttribute('fill','none');stroke.setAttribute('stroke','currentColor');stroke.setAttribute('stroke-width','1');stroke.style.strokeDasharray='650';stroke.style.strokeDashoffset='650';svg.append(stroke);strokes.push(stroke)
   })
   host.dataset.drawing='true';host.dataset.drawState='drawing'
   ready()
   timeline=gsap.timeline({onComplete:()=>{
    // Keep the same fully covering masks at rest; no completion-time visual swap.
    host.dataset.drawState='complete'
   }})
    .to(strokes,{strokeDashoffset:0,duration:1.35,stagger:.09,ease:'power2.inOut'})
    .to(fills,{attr:{y:box.y-20},duration:1.1,stagger:.09,ease:'sine.inOut'},.65)
    .to(strokes,{opacity:0,duration:.2},'>-.2')
  }
  if(!document.documentElement.hasAttribute('data-ss-loading'))void start()
  document.addEventListener('ss:intro-finished',start)
  reduced.addEventListener('change',stop)
  const scope=host.closest('#smokers-site')
  const toggle=()=>{if(scope?.getAttribute('data-motion')==='off')stop()}
  scope?.addEventListener('smokers:motion',toggle)
  return()=>{disposed=true;resize?.disconnect();stop();document.removeEventListener('ss:intro-finished',start);reduced.removeEventListener('change',stop);scope?.removeEventListener('smokers:motion',toggle)}
 },[text,host])
 return <svg ref={ref} aria-hidden="true" focusable="false"><text x="0" y="0" visibility="hidden">{text}</text></svg>
}

