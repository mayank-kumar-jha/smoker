from pathlib import Path
import json, subprocess
import imageio_ffmpeg

root=Path(__file__).resolve().parents[1]
raw=Path((root/'output/video/raw-video-path.txt').read_text().strip())
details=json.loads((root/'output/video/walkthrough-chapters.json').read_text())
out=root/'output/video/Smokers_Website_Preview.mp4'
metadata=[';FFMETADATA1','title=Smokers Website Preview','comment=Preview recording. The real website has smoother motion and transitions.']
chapters=details['chapters']
for i,chapter in enumerate(chapters):
    end=chapters[i+1]['seconds'] if i+1<len(chapters) else details['durationSeconds']
    metadata.extend(['[CHAPTER]','TIMEBASE=1/1000',f"START={round(chapter['seconds']*1000)}",f'END={round(end*1000)}',f"title={chapter['name']}"])
meta=root/'output/video/chapters.ffmetadata';meta.write_text('\n'.join(metadata)+'\n',encoding='utf-8')
subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-hide_banner','-loglevel','warning','-i',str(raw),'-i',str(meta),'-map_metadata','1','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart','-threads','4','-an',str(out)],check=True)
print(out)
print(f'Size: {out.stat().st_size/1024/1024:.1f} MB')
