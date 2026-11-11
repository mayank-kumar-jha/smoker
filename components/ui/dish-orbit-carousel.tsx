"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { menuCopy, type MenuLanguage } from './menu-locales'
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)




/* Supplied orbit layout and GSAP swaps; arrow navigation with a whole-scene scroll entrance. */
export type Dish = {
  /** The thin first title line, e.g. "Char grill". */
  href?: string
  title: string
  /** The heavy second title line, e.g. "Ribeye". */
  subtitle: string
  /** Plate photo, ideally a top-down cut-out (transparent PNG/WebP), square. */
  image: string
  /** Compensates for transparent padding without altering the supplied PNG. */
  imageScale?: number
  alt?: string
  /** Small line above the title. Defaults to "#n Most loved dish". */
  eyebrow?: string
  /** Two-line label under the thumbnail. Defaults to title + subtitle. */
  label?: string
  rating?: number
  brand: string
  /** Kitchen or restaurant, under the chef's name. */
  category?: string
  description: string
  ingredients?: string[]
  ingredientsNote?: string
  /** Badge and band colour: hex or rgb(), so the band can morph between dishes. */
  accent: string
}

export type DishOrbitCarouselProps = {
  dishes: Dish[]
  language?: MenuLanguage
  initialIndex?: number
  selectedIndex?: number
  /** Root height. A definite length: percentages collapse on a host page. */
  height?: string
  /** Optional photo behind the display, e.g. a kitchen wall. Washed by the theme background. */
  backdrop?: string
  /** Scroll on forever: past the last dish comes the first again, and up from the first, the last. */
  loop?: boolean
  /** Embedded display face (Outfit, OFL). Pass null to use the host's font. */
  fontSrc?: string | null
  onPlay?: (dish: Dish, index: number) => void
  onOrder?: (dish: Dish, index: number) => void
  onChange?: (index: number) => void
  className?: string
}

// #region carousel
export function wrapIndex(i: number, n: number): number {
  if (n <= 0) return 0
  return ((Math.round(i) % n) + n) % n
}

/** Which way to swing when jumping from one dish to another: the shorter way round. */
export function stepDirection(from: number, to: number, n: number): 1 | -1 {
  if (n <= 0) return 1
  const fwd = (((to - from) % n) + n) % n
  return fwd <= n - fwd ? 1 : -1
}

/** Scroll stretches in the section: one per dish change, plus one back round to the first when looping. */
export function scrollSteps(n: number, loop: boolean): number {
  return Math.max(0, loop ? n : n - 1)
}

/** The scroll stretch for dish `i` nearest the current one (when looping, dish 0 is also the last stretch). */
export function segmentFor(i: number, current: number, n: number, loop: boolean): number {
  return loop && i === 0 && current > n / 2 ? n : i
}

/** First thumbnail shown in the strip window, keeping the current one in view. */
export function stripStart(index: number, n: number, visible: number): number {
  if (n <= visible) return 0
  return Math.max(0, Math.min(index - 1, n - visible))
}

/** Title font size so a line of `chars` characters fits `width` px at `em` average glyph width. */
export function fitSize(chars: number, max: number, width: number, em: number): number {
  return Math.min(max, width / (Math.max(1, chars) * em))
}
/**
 * The pastel band: a thick stroke along the plates' orbit circle, tapering at
 * both ends. Angles in degrees, screen space (0 = right, 90 = straight down).
 */
export function arcPath(a0: number, a1: number, cx: number, cy: number, r: number, w: number, steps = 48): string {
  const outer: string[] = []
  const inner: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = ((a0 + (a1 - a0) * t) * Math.PI) / 180
    const h = (w / 2) * Math.pow(Math.sin(Math.PI * t), 0.45)
    const c = Math.cos(a)
    const s = Math.sin(a)
    outer.push((cx + c * (r + h)).toFixed(1) + " " + (cy + s * (r + h)).toFixed(1))
    inner.push((cx + c * (r - h)).toFixed(1) + " " + (cy + s * (r - h)).toFixed(1))
  }
  return "M" + outer.join("L") + "L" + inner.reverse().join("L") + "Z"
}

/** Where the band rests for each dish, as [start, end] angles along the orbit. Measured off the reference. */
export const ARC_REST = [[50, 98], [46, 124], [60, 126], [40, 100]]
export function arcRest(index: number): number[] {
  return ARC_REST[((index % ARC_REST.length) + ARC_REST.length) % ARC_REST.length]
}

/** The band mid-swap: it stretches to trail between the outgoing and incoming plate. */
export const ARC_SWEEP = [38, 146]
// #endregion

// The plates' orbit: its pivot sits above the canvas (the .dsh-orbit transform-origin).
const ORBIT_X = 299
const ORBIT_Y = -450
const ORBIT_R = 650
const SWING = 120 // degrees the plate travels round the orbit's pivot
const ITEM = 118 // thumbnail pitch in canvas px
const VISIBLE = 4

const FONT = "dsh-face"

const CSS =
  ".dsh-trk{position:relative;width:100%}" +
  ".dsh-root{position:sticky;top:0;overflow:hidden;width:100%;background:var(--color-background);color:var(--color-foreground);" +
  "font-family:" + FONT + ",ui-sans-serif,system-ui,sans-serif;container-type:inline-size;-webkit-tap-highlight-color:transparent}" +
  ".dsh-root *{box-sizing:border-box}" +
  ".dsh-bd{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;pointer-events:none}" +
  ".dsh-wash{position:absolute;inset:0;background:color-mix(in oklab,var(--color-background) 38%,transparent);pointer-events:none}" +
  // multiply by the background: a no-op on a light theme, lights-off on a dark one
  ".dsh-dim{position:absolute;inset:0;background:var(--color-background);mix-blend-mode:multiply;opacity:.72;pointer-events:none}" +
  ".dsh-root:focus-visible{outline:2px solid var(--color-primary);outline-offset:-4px}" +
  ".dsh-canvas{position:absolute;left:50%;top:50%;width:960px;height:520px;transform:translate(-50%,-50%) scale(var(--dsh-s,1));transform-origin:50% 50%}" +
  ".dsh-arc{position:absolute;left:0;top:0;width:960px;height:520px;overflow:visible;pointer-events:none}" +
  ".dsh-btn{appearance:none;border:0;background:none;color:inherit;font:inherit;padding:0;margin:0;cursor:pointer}" +
  ".dsh-btn:focus-visible{outline:2px solid var(--color-primary);outline-offset:3px;border-radius:10px}" +
  ".dsh-ico{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}" +
  ".dsh-top{position:absolute;left:800px;top:52px;display:flex;gap:14px}" +
  ".dsh-top .dsh-btn{width:36px;height:36px;display:grid;place-items:center;border-radius:10px}" +
  ".dsh-pager{position:absolute;left:76px;top:172px;display:flex;flex-direction:column;align-items:center;gap:7px}" +
  ".dsh-dot{width:14px;height:10px;display:grid;place-items:center}" +
  ".dsh-dot i{display:block;width:3px;height:3px;border-radius:3px;background:var(--color-foreground);opacity:.45;transition:height .45s cubic-bezier(.3,.7,.2,1),opacity .3s}" +
  ".dsh-dot[aria-current] i{height:22px;opacity:.9}" +
  ".dsh-dot[aria-current]{height:26px}" +
  ".dsh-dot{transition:height .45s cubic-bezier(.3,.7,.2,1)}" +
  ".dsh-plates{position:absolute;left:130px;top:82px;width:245px;height:245px;touch-action:pan-y}" +
  ".dsh-orbit{position:absolute;inset:0;transform-origin:69% -217%;visibility:hidden;will-change:transform}" +
  ".dsh-orbit>img{display:block;width:245px;height:245px;max-width:none;object-fit:contain;user-select:none;-webkit-user-drag:none;" +
  "filter:drop-shadow(0 10px 13px rgba(53,32,18,.18)) drop-shadow(0 2px 2px rgba(53,32,18,.16))}" +
  ".dsh-head{position:absolute;left:388px;top:96px;width:330px;height:150px}" +
  ".dsh-hd{position:absolute;inset:0;visibility:hidden}" +
  ".dsh-eye{font-size:12.5px;font-weight:600;letter-spacing:.01em;margin:0 0 4px 2px}" +
  ".dsh-t1,.dsh-t2{display:block;white-space:nowrap;line-height:1;text-transform:uppercase;margin:0}" +
  ".dsh-t1{font-weight:200;letter-spacing:-.015em;margin-top:6px}" +
  ".dsh-t2{font-weight:800;letter-spacing:-.025em;margin-top:6px;color:color-mix(in oklab,var(--color-foreground) 86%,transparent)}" +
  ".dsh-acts{position:absolute;left:396px;top:280px;display:flex;gap:44px;font-size:12.5px;font-weight:500}" +
  ".dsh-acts .dsh-btn{display:flex;align-items:center;gap:9px;padding:4px 0}" +
  ".dsh-acts .dsh-ico{width:13px;height:13px}" +
  ".dsh-acts .dsh-fill{fill:currentColor;stroke:none}" +
  ".dsh-card{position:absolute;left:722px;top:137px;width:223px;padding:18px 20px 20px;border-radius:20px;" +
  "background:color-mix(in oklab,var(--color-background) 72%,transparent);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);" +
  "box-shadow:0 1px 0 color-mix(in oklab,var(--color-foreground) 6%,transparent) inset,0 18px 40px -24px rgba(0,0,0,.25)}" +
  ".dsh-tabs{display:flex;justify-content:space-between;padding:0 6px 0 20px;font-size:12px;margin-bottom:20px}" +
  ".dsh-tab{color:var(--color-muted-foreground);font-weight:500;padding:3px 0}" +
  ".dsh-tab[aria-selected=true]{color:var(--color-foreground);font-weight:600}" +
  ".dsh-bodies{display:grid}" +
  ".dsh-body{grid-area:1/1;visibility:hidden}" +
  ".dsh-rate{position:relative;height:62px;margin:0 0 14px 6px}" +
  ".dsh-badge{position:absolute;left:0;top:0;width:46px;height:62px;border-radius:10px}" +
  ".dsh-badge svg{position:absolute;left:17px;bottom:9px;width:12px;height:12px;fill:var(--color-foreground);opacity:.8}" +
  ".dsh-num{position:absolute;left:10px;top:4px;font-size:36px;font-weight:700;letter-spacing:-.04em;line-height:1}" +
  ".dsh-chef{font-size:19px;font-weight:600;letter-spacing:-.01em;margin:0}" +
  ".dsh-kit{font-size:10.5px;color:var(--color-muted-foreground);margin:3px 0 12px}" +
  ".dsh-desc{font-size:12.5px;line-height:1.38;margin:0;min-height:52px}" +
  ".dsh-ing{display:flex;flex-wrap:wrap;gap:5px;margin:0;padding:0;list-style:none;min-height:52px}" +
  ".dsh-ing li{font-size:11px;padding:4px 9px;border-radius:99px;background:color-mix(in oklab,var(--color-foreground) 7%,transparent)}" +
  ".dsh-react{display:flex;gap:12px;margin-top:20px}" +
  ".dsh-like{display:flex;align-items:center;gap:8px;height:34px;padding:0 14px 0 10px;border-radius:99px;font-size:10.5px;" +
  "background:color-mix(in oklab,var(--color-foreground) 6%,transparent);transition:background .25s}" +
  ".dsh-meh{width:34px;height:34px;display:grid;place-items:center;border-radius:99px;background:color-mix(in oklab,var(--color-foreground) 6%,transparent)}" +
  ".dsh-react .dsh-ico{width:16px;height:16px}" +
  ".dsh-react [aria-pressed=true] .dsh-ico{fill:currentColor}" +
  ".dsh-strip{position:absolute;left:130px;top:362px;width:550px;height:122px;display:flex;align-items:center}" +
  ".dsh-arrow{width:36px;height:36px;display:grid;place-items:center;flex:none}" +
  ".dsh-arrow svg{width:12px;height:16px;fill:currentColor}" +
  ".dsh-win{position:relative;width:" + ITEM * VISIBLE + "px;height:122px;overflow:hidden;flex:none;margin:0 2px;" +
  "-webkit-mask-image:linear-gradient(90deg,#000 88%,transparent);mask-image:linear-gradient(90deg,#000 88%,transparent)}" +
  ".dsh-track{position:absolute;left:0;top:0;display:flex;transition:transform .6s cubic-bezier(.65,0,.35,1)}" +
  ".dsh-th{width:" + ITEM + "px;height:122px;display:flex;justify-content:center;padding-top:3px}" +
  ".dsh-th .dsh-btn{width:80px;height:116px;border-radius:14px;display:flex;flex-direction:column;align-items:center;gap:7px;padding-top:9px;transition:background .45s}" +
  ".dsh-th .dsh-btn[aria-current]{background:color-mix(in oklab,var(--color-background) 62%,transparent);box-shadow:0 10px 24px -16px rgba(0,0,0,.3)}" +
  ".dsh-th img{width:56px;height:56px;max-width:none;object-fit:contain;filter:drop-shadow(0 4px 6px rgba(0,0,0,.18));transition:transform .45s}" +
  ".dsh-th .dsh-btn[aria-current] img{transform:scale(1.06)}" +
  ".dsh-th span{font-size:10px;line-height:1.25;text-align:center;font-weight:500;color:color-mix(in oklab,var(--color-foreground) 78%,transparent);max-width:78px}" +
  ".dsh-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}" +
  "@container (max-width:639px){" +
  ".dsh-canvas{position:relative;left:auto;top:auto;width:100%;height:auto;transform:none;display:flex;flex-direction:column;align-items:center;padding:14px 16px 18px}" +
  ".dsh-arc{width:200%;height:auto;left:-60%;top:-30px}" +
  ".dsh-top{position:relative;left:auto;top:auto;align-self:flex-end}" +
  ".dsh-pager{left:14px;top:150px}" +
  ".dsh-plates{position:relative;left:auto;top:auto;width:min(52vw,32svh);height:min(52vw,32svh);margin-top:0}" +
  ".dsh-orbit>img{width:100%;height:100%}" +
  ".dsh-head{position:relative;left:auto;top:auto;width:100%;height:132px;margin-top:10px}" +
  ".dsh-hd{text-align:center;transform:scale(.78);transform-origin:50% 0}" +
  ".dsh-acts{position:relative;left:auto;top:auto;margin-top:4px}" +
  ".dsh-card{position:relative;left:auto;top:auto;width:100%;max-width:420px;margin-top:12px}" +
  // phone: the pinned stage has to fit one screen; the pager, swipes and scroll cover the strip
  ".dsh-strip{display:none}" +
  "}" +
  "@media (prefers-reduced-motion:reduce){.dsh-track,.dsh-dot,.dsh-dot i,.dsh-th .dsh-btn,.dsh-th img,.dsh-like{transition:none}}"

const HIDE_1 = "inset(0% 0% 0% 100%)" // thin line: wipes in from the right
const HIDE_2 = "inset(0% 100% 0% 0%)" // heavy line: wipes in from the left
const SHOW = "inset(0% 0% 0% 0%)"

const Icon = {
  search: <svg className="dsh-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>,
  menu: <svg className="dsh-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16M4 12h16M4 17.5h16" /></svg>,
  play: <svg className="dsh-ico dsh-fill" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5v17l14-8.5z" /></svg>,
  order: <svg className="dsh-ico dsh-fill" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5 3 15h18zM3 18h18v2.5H3z" /></svg>,
  up: <svg className="dsh-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10v10H3.5V10zM7 10l4-7c1.6 0 2.6 1.2 2.2 2.8L12.6 9H19a2 2 0 0 1 2 2.3l-1.3 7A2 2 0 0 1 17.7 20H7" /></svg>,
  down: <svg className="dsh-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M17 14V4h3.5v10zM17 14l-4 7c-1.6 0-2.6-1.2-2.2-2.8l.6-3.2H5a2 2 0 0 1-2-2.3l1.3-7A2 2 0 0 1 6.3 4H17" /></svg>,
}

export function DishOrbitCarousel({
  dishes,
  language = "en",
  initialIndex = 0,
  selectedIndex,
  height = "90svh",
  backdrop,
  loop = true,
  fontSrc = null,
  onPlay,
  onOrder,
  onChange,
  className,
}: DishOrbitCarouselProps) {
  const n = dishes.length
  const copy = menuCopy[language]
  // Seed prerendered visibility once; GSAP owns it throughout dish transitions.
  const firstIndex = useRef(wrapIndex(initialIndex,n)).current
  const [index, setIndex] = useState(firstIndex)
  const [tab, setTab] = useState("overview")
  const [swipeHint, setSwipeHint] = useState(false)



  const trackRef = useRef(null as HTMLDivElement | null)
  const rootRef = useRef(null as HTMLDivElement | null)


  const indexRef = useRef(wrapIndex(initialIndex,n))
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const orbits = useRef([] as (HTMLDivElement | null)[])
  const heads = useRef([] as (HTMLDivElement | null)[])
  const bodies = useRef([] as (HTMLDivElement | null)[])
  const arcRef = useRef(null as SVGPathElement | null)
  const arc = useRef({ a0: 0, a1: 0 })
  const shown = useRef(-1)
  const dirRef = useRef(1 as 1 | -1)
  const tlRef = useRef(null as gsap.core.Timeline | null)
  const reducedRef = useRef(false)
  const swipe = useRef(null as { x: number; y: number } | null)

  useEffect(() => {
    const plate = rootRef.current?.querySelector('.dsh-plates')
    if (!plate || !matchMedia('(max-width: 639px)').matches) return
    let timer: ReturnType<typeof setTimeout>
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .6)) return
      setSwipeHint(true)
      timer = setTimeout(() => setSwipeHint(false), 1000)
      observer.disconnect()
    }, { threshold: .6 })
    observer.observe(plate)
    return () => { observer.disconnect(); clearTimeout(timer) }
  }, [])

  // Fit the 960 x 520 design canvas to the root. Measured on resize only.
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const fit = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      el.style.setProperty("--dsh-s", String(Math.min(w / 960, h / 520, 1.6)))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const on = () => (reducedRef.current = mq.matches)
    on()
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])

  // The swap. Every dish is in the DOM; GSAP only moves the outgoing and incoming ones.
  useLayoutEffect(() => {
    const from = shown.current
    const to = index
    const parts = (i: number) => {
      const head = heads.current[i]
      return {
        orbit: orbits.current[i],
        head,
        eye: head && head.querySelector(".dsh-eye"),
        t1: head && head.querySelector(".dsh-t1"),
        t2: head && head.querySelector(".dsh-t2"),
        body: bodies.current[i],
      }
    }
    // Writes the band's path only; no layout is read.
    const drawArc = () => arcRef.current?.setAttribute("d", arcPath(arc.current.a0, arc.current.a1, ORBIT_X, ORBIT_Y, ORBIT_R, 118))
    const rest = arcRest(to)
    const tint = dishes[to] ? dishes[to].accent : "transparent"
    if (tlRef.current) tlRef.current.progress(1).kill()
    const b = parts(to)
    if (from === -1 || from === to || reducedRef.current) {
      for (let i = 0; i < n; i++) if (i !== to) {
        const p = parts(i)
        gsap.set([p.orbit, p.head, p.body], { autoAlpha: 0 })
      }
      gsap.set([b.orbit, b.head, b.body, b.eye], { autoAlpha: 1, rotation: 0, y: 0 })
      gsap.set(b.t1, { clipPath: SHOW })
      gsap.set(b.t2, { clipPath: SHOW })
      arc.current.a0 = rest[0]
      arc.current.a1 = rest[1]
      drawArc()
      if (arcRef.current) gsap.set(arcRef.current, { fill: tint })
      shown.current = to
      return
    }
    const a = parts(from)
    const d = dirRef.current
    const tl = gsap.timeline({ onComplete: () => { tlRef.current = null } })
    tlRef.current = tl
    // 120 degrees places the entire plate above the clipped section before reveal.
    // Both directions start/end off-screen, including narrow phone layouts.
    tl.to(a.orbit, { rotation: SWING * d, duration: 0.62, ease: "power2.in" }, 0)
      .set(a.orbit, { autoAlpha: 0, rotation: 0 }, 0.62)
      .fromTo(b.orbit, { autoAlpha: 1, rotation: -SWING * d }, { rotation: 0, duration: 0.95, ease: "power3.out" }, 0.3)
    // title: thin line clips away to the right, heavy line to the left, then the next wipes in
    tl.to(a.t1, { clipPath: HIDE_1, duration: 0.42, ease: "power2.in" }, 0)
      .to(a.t2, { clipPath: HIDE_2, duration: 0.42, ease: "power2.in" }, 0.06)
      .to(a.eye, { autoAlpha: 0, duration: 0.25 }, 0)
      .set(a.head, { autoAlpha: 0 }, 0.5)
      .set(b.head, { autoAlpha: 1 }, 0.5)
      .fromTo(b.eye, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.55)
      .fromTo(b.t1, { clipPath: HIDE_1 }, { clipPath: SHOW, duration: 0.7, ease: "power3.out" }, 0.55)
      .fromTo(b.t2, { clipPath: HIDE_2 }, { clipPath: SHOW, duration: 0.7, ease: "power3.out" }, 0.62)
    // card: cross-fade, the incoming rows rise in turn
    tl.to(a.body, { autoAlpha: 0, y: -6, duration: 0.3, ease: "power1.in" }, 0.05)
      .set(b.body, { autoAlpha: 1, y: 0 }, 0.4)
    if (b.body) tl.fromTo(b.body.children, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" }, 0.4)
    // the band stretches along the orbit with the plates, then settles into the next dish's span, morphing colour
    tl.to(arc.current, { a0: ARC_SWEEP[0], a1: ARC_SWEEP[1], duration: 0.6, ease: "power2.inOut", onUpdate: drawArc }, 0)
      .to(arc.current, { a0: rest[0], a1: rest[1], duration: 0.85, ease: "power3.out", onUpdate: drawArc }, 0.6)
    if (arcRef.current) tl.to(arcRef.current, { fill: tint, duration: 1.1, ease: "power1.inOut" }, 0.1)
    shown.current = to
  }, [index, n, dishes])

  useEffect(() => () => { tlRef.current?.kill() }, [])

  const select = (next: number, dir: 1 | -1) => {
    if (next === indexRef.current) return
    dirRef.current = dir
    indexRef.current = next
    setIndex(next)
    onChangeRef.current?.(next)
  }

  useEffect(() => {
    if(selectedIndex===undefined)return
    const next=wrapIndex(selectedIndex,n)
    dirRef.current=stepDirection(indexRef.current,next,n)
    indexRef.current=next;setIndex(next)
  },[selectedIndex,n])

  // Arrows change dishes independently of page scrolling.
  const go = (to: number, dir?: 1 | -1) => {
    if (n < 2 || tlRef.current?.isActive()) return
    const next = wrapIndex(to, n)
    if (next !== indexRef.current) select(next, dir ?? stepDirection(indexRef.current, next, n))
  }
  const step = (d: 1 | -1) => go(indexRef.current + d, d)
  // Use custom properties so GSAP never absorbs the CSS layout translate offset.
  // The entrance, fixed menu offset and dish orbit each keep their own transform.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const plate = root.querySelector('.dsh-plates')
      const text = root.querySelectorAll('.dsh-head, .dsh-acts')
      const card = root.querySelector('.dsh-card')
      const entrance = gsap.timeline({
        defaults: { duration: .95, ease: 'power2.out' },
        scrollTrigger: { trigger: root, start: 'top 72%', once: true },
      })
      entrance.fromTo(plate, { '--dsh-enter-x': '-28px', autoAlpha: 0 }, { '--dsh-enter-x': '0px', autoAlpha: 1 }, 0)
        .fromTo(text, { '--dsh-enter-y': '18px', autoAlpha: 0 }, { '--dsh-enter-y': '0px', autoAlpha: 1, stagger: .06 }, .08)
        .fromTo(card, { '--dsh-enter-x': '28px', autoAlpha: 0 }, { '--dsh-enter-x': '0px', autoAlpha: 1 }, .14)
      // Keyboard navigation should never land on a concealed control.
      const reveal = () => { entrance.progress(1); entrance.scrollTrigger?.kill() }
      root.addEventListener('focusin', reveal)
      return () => root.removeEventListener('focusin', reveal)
    })
    return () => media.revert()
  }, [])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); step(1) }
    else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1) }
  }
  const onPointerDown = (e: React.PointerEvent) => {
    if (!matchMedia('(max-width: 639px)').matches || !e.isPrimary || e.button !== 0) return
    // Preserve normal taps on links, tabs and buttons within the swipe area.
    if ((e.target as Element).closest('a,button,input,textarea,select')) return
    swipe.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const dx = e.clientX - s.x
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.4) step(dx < 0 ? 1 : -1)
  }

  const start = stripStart(index, n, VISIBLE)
  const dish = dishes[index]

  return (
    <div ref={trackRef} className={"dsh-trk" + (className ? " " + className : "")} style={{ height }}>
    <div
      ref={rootRef}
      className="dsh-root"
      style={{ height }}
      role="region"
      aria-roledescription="carousel"
      aria-label={copy.dishes}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <style>
        {(fontSrc ? "@font-face{font-family:" + FONT + ";src:url(" + fontSrc + ") format('woff2');font-weight:100 900;font-display:swap}" : "") + CSS}
      </style>
      {backdrop ? <img className="dsh-bd" src={backdrop} alt="" width={1200} height={900} /> : null}
      {backdrop ? <div className="dsh-dim" /> : null}
      {backdrop ? <div className="dsh-wash" /> : null}

      <div className="dsh-scene"><div className="dsh-canvas" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { swipe.current = null }} onLostPointerCapture={() => { swipe.current = null }}>
        <svg className="dsh-arc" viewBox="0 0 960 520" aria-hidden="true">
          <path ref={arcRef} style={{ opacity: 0.34 }} />
        </svg>

        <div className="dsh-pager" role="tablist" aria-label={copy.choose}>
          {dishes.map((d, i) => (
            <button key={i} type="button" role="tab" className="dsh-btn dsh-dot" aria-selected={i === index}
              aria-current={i === index ? "true" : undefined} aria-label={d.title + " " + d.subtitle} tabIndex={i===index?0:-1} onClick={()=>go(i)}>
              <i />
            </button>
          ))}
        </div>

        <div className="dsh-plates">
          {swipeHint && <p className="dsh-swipe-hint" role="status"><span aria-hidden="true">↔</span> {{en:'Swipe to explore more flavours',es:'Desliza para descubrir más sabores',ca:'Llisca per descobrir més sabors'}[language]}</p>}
          {dishes.map((d, i) => (
            <div key={i} ref={(el) => { orbits.current[i] = el }} className="dsh-orbit" style={{visibility:i===firstIndex?"visible":"hidden"}} aria-hidden={i !== index}>
              <img decoding="async" src={d.image} style={{ scale: d.imageScale ?? 1 }} alt={d.alt ?? d.title + " " + d.subtitle} width={245} height={245} draggable={false} />
            </div>
          ))}
        </div>

        <div className="dsh-head" aria-live="polite">
          {dishes.map((d, i) => (
            <div key={i} ref={(el) => { heads.current[i] = el }} className="dsh-hd" style={{visibility:i===firstIndex?"visible":"hidden"}} aria-hidden={i !== index}>
              <p className="dsh-eye">{d.eyebrow ?? "#" + (i + 1) + " Most loved dish"}</p>
              <h2 style={{ margin: 0, font: "inherit" }}>
                <span className="dsh-t1" data-long-title={d.title.length > 12 ? true : undefined} style={{ fontSize: fitSize(d.title.length, 48, 320, 0.82) + "px" }}>{d.title}</span>
                <span className="dsh-t2" style={{ fontSize: fitSize(d.subtitle.length, 56, 320, 0.86) + "px" }}>{d.subtitle}</span>
              </h2>
            </div>
          ))}
        </div>

        <div className="dsh-acts">
          <button type="button" className="dsh-btn" onClick={() => setTab(tab === "overview" ? "ingredients" : "overview")}>{Icon.play}{copy.details}</button>
          <a className="dsh-btn dsh-reheat-link" href="#ss-regenerar"><svg className="dsh-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3v3m4-3v3m4-3v3M5 10h14v10H5zM8 14h8" /></svg>{copy.reheat}</a>
        </div>

        <div className="dsh-card">
          <div className="dsh-tabs" role="tablist" aria-label={copy.details}>
            {["overview", "ingredients"].map((t) => (
              <button key={t} type="button" role="tab" className="dsh-btn dsh-tab" aria-selected={tab === t} onClick={() => setTab(t)}>
                {t === "overview" ? copy.overview : copy.ingredients}
              </button>
            ))}
          </div>
          <div className="dsh-bodies">
            {dishes.map((d, i) => (
              <div key={i} ref={(el) => { bodies.current[i] = el }} className="dsh-body" style={{visibility:i===firstIndex?"visible":"hidden"}} aria-hidden={i !== index}>
                <div className="dsh-rate">
                  <div className="dsh-badge" style={{ background: d.accent }}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 5 6 7 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 0 4 2 4 3 5 2-3 1-6 0-10z" /></svg>
                  </div>
                  <span className="dsh-num" aria-label={copy.dishes + " " + (i + 1) + " / " + n}>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <p className="dsh-chef">{d.brand}</p>
                <p className="dsh-kit">{d.category ?? " "}</p>
                {tab === "overview" ? (
                  <p className="dsh-desc">{d.description}</p>
                ) : (
                  d.ingredients?.length ? <ul className="dsh-ing">{d.ingredients.map((x) => <li key={x}>{x}</li>)}</ul> : <p className="dsh-desc">{d.ingredientsNote}</p>
                )}
                {d.href&&<a className="dsh-dish-link" href={d.href} tabIndex={i===index?0:-1}>{copy.link} ↗</a>}
                <div className="dsh-react"><button type="button" className="dsh-btn dsh-like" tabIndex={i === index ? 0 : -1} onClick={() => onOrder?.(d, i)}>{copy.order} <span aria-hidden="true">→</span></button></div>
              </div>
            ))}
          </div>
        </div>

        <div className="dsh-strip">
          <button type="button" className="dsh-btn dsh-arrow" aria-label={copy.previous} onClick={() => step(-1)}>
            <svg viewBox="0 0 12 16" aria-hidden="true"><path d="M11 0v16L0 8z" /></svg>
          </button>
          <div className="dsh-win">
            <div className="dsh-track" style={{ transform: "translateX(" + -start * ITEM + "px)" }}>
              {dishes.map((d, i) => (
                <div key={i} className="dsh-th">
                  <a className="dsh-btn" href={d.href} aria-current={i === index ? "true" : undefined} onClick={e=>{if(!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey&&e.button===0){e.preventDefault();go(i)}}}>
                    <img decoding="async" src={d.image} style={{ scale: d.imageScale ?? 1 }} alt="" width={56} height={56} draggable={false} />
                    <span>{d.label ?? d.title + " " + d.subtitle}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
          <button type="button" className="dsh-btn dsh-arrow" aria-label={copy.next} onClick={() => step(1)}>
            <svg viewBox="0 0 12 16" aria-hidden="true"><path d="M1 0v16l11-8z" /></svg>
          </button>
        </div>

      </div>
      </div><p className="dsh-sr" aria-live="polite">{dish ? copy.dishes + " " + (index + 1) + " / " + n + ": " + dish.title + " " + dish.subtitle : ""}</p>
    </div>
    </div>
  )
}

export default DishOrbitCarousel
