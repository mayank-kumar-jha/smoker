// Translate content before React renders it. Never mutate React-owned DOM afterwards.
import {jsx as reactJsx, jsxs as reactJsxs, Fragment} from 'react/jsx-runtime'
export {Fragment}
export * from 'react/jsx-runtime'
function content(input: unknown) {
  const props=(input || {}) as Record<string, unknown>
  if(typeof window==='undefined'||!window.SMOKERS_CMS)return props
  const next={...props}
  const text=(value: unknown): unknown => typeof value==='string'?window.SMOKERS_CMS!.text(value):Array.isArray(value)?value.map(text):value
  if('children' in next)next.children=text(next.children)
  for(const key of ['alt','title','aria-label','placeholder'])if(typeof next[key]==='string')next[key]=text(next[key])
  for(const key of ['src','poster','href'])if(typeof next[key]==='string')next[key]=window.SMOKERS_CMS.url(next[key] as string)
  if(typeof next.src==='string'){const image=window.SMOKERS_CMS.image?.(next.src);if(image)Object.assign(next,{...image,sizes:next.sizes||image.sizes})}
  return next
}
export const jsx: typeof reactJsx=(type,props,key)=>reactJsx(type,content(props),key)
export const jsxs: typeof reactJsxs=(type,props,key)=>reactJsxs(type,content(props),key)
declare global {interface Window {SMOKERS_CMS?:{text:(value:string)=>string;url:(value:string)=>string;html:(value:string)=>string;image?:(value:string)=>Record<string,unknown>|undefined}}}
