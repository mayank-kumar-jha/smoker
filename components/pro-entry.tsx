import {createRoot,hydrateRoot,type Root} from 'react-dom/client'
import ProChickenShowcase,{type Locale} from './ui/pro-chicken-showcase'
import {mountProChapters} from './pro-chapter-motion'
let mounted:{host:HTMLElement;root:Root}|undefined
let chapterHost:Element|null=null,chapterMotion:boolean|undefined,cleanupChapters:(()=>void)|undefined
window.SMOKERS_MOUNT_PRO=(scope,motion=true)=>{
 const currentChapter=scope.querySelector('.ss-catalogue')
 if(currentChapter!==chapterHost||motion!==chapterMotion){cleanupChapters?.();cleanupChapters=mountProChapters(scope,motion);chapterHost=currentChapter;chapterMotion=motion}
 const host=scope.querySelector<HTMLElement>('.ss-pro-showcase-mount')
 if(!host){mounted?.root.unmount();mounted=undefined;return}
 const content=<ProChickenShowcase lang={(scope.lang||'es') as Locale} motion={motion} assets={window.SMOKERS_ASSETS} proDishes={(window as any).SMOKERS_WP?.proDishes}/>
 if(mounted?.host===host){mounted.root.render(content);return}
 mounted?.root.unmount()
 const hydrate=host.hasChildNodes()&&!window.SMOKERS_STANDALONE
 const root=hydrate?hydrateRoot(host,content):createRoot(host)
 if(!hydrate)root.render(content)
 mounted={host,root}
}
declare global{interface Window{SMOKERS_MOUNT_PRO:(scope:HTMLElement,motion?:boolean)=>void}}
