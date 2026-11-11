const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto'),os=require('node:os');
const root=path.resolve(process.env.SMOKERS_OUTPUT||'output/full-site');
const lan=process.argv.includes('--lan');
const privateIPv4=ip=>/^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(ip);
const lanAddress=lan?Object.values(os.networkInterfaces()).flat().find(i=>i.family==='IPv4'&&!i.internal&&privateIPv4(i.address))?.address:null;
if(lan&&!lanAddress)throw Error('No local Wi-Fi or Ethernet IPv4 address found. Connect to your local network first.');
const port=Number(process.env.PORT||(lan?4174:4173)),publicHost=process.env.SMOKERS_PUBLIC==='1';
if(lan&&publicHost)throw Error('Choose either the local-network preview or public hosting, not both.');
const host=lan?lanAddress:publicHost?'0.0.0.0':'127.0.0.1';
const info=JSON.parse(fs.readFileSync(root+'/build-info.json','utf8'));
const staging=info.environment!=='production';
if(publicHost&&staging&&(!process.env.STAGING_USER||!process.env.STAGING_PASSWORD))throw Error('Public staging requires STAGING_USER and STAGING_PASSWORD.');
const redirects=JSON.parse(fs.readFileSync(root+'/redirects.json','utf8'));
const types={'.mp4':'video/mp4','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8','.json':'application/json; charset=utf-8'};
const csp="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self' mailto:";
function authorized(req){const supplied=Buffer.from(req.headers.authorization||''),expected=Buffer.from('Basic '+Buffer.from(process.env.STAGING_USER+':'+process.env.STAGING_PASSWORD).toString('base64'));return supplied.length===expected.length&&crypto.timingSafeEqual(supplied,expected)}
const server=http.createServer((req,res)=>{
 // LAN preview is explicitly requested and only serves local-network clients.
 if(lan&&!privateIPv4(req.socket.remoteAddress||'')){res.writeHead(403);res.end('Local-network preview only');return}
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('Content-Security-Policy',csp);
 if(staging)res.setHeader('X-Robots-Tag','noindex, follow');
 if(publicHost&&staging&&!authorized(req)){res.writeHead(401,{'WWW-Authenticate':'Basic realm="Smokers staging"'});res.end('Authentication required');return}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return}
 let parsed,name;try{parsed=new URL(req.url,'http://localhost');name=decodeURIComponent(parsed.pathname)}catch{res.writeHead(400);res.end();return}
 if(name.includes('\0')||name.includes('\\')){res.writeHead(400);res.end();return}
 let canonical=name.replace(/\/{2,}/g,'/').toLowerCase().replace(/\/index\.html$/,'/');
 const withSlash=canonical.endsWith('/')?canonical:canonical+'/';
 const mapped=redirects[canonical]||redirects[withSlash];
 const redirectHash=mapped?new URL(mapped,'http://localhost').hash:'';
 canonical=mapped?new URL(mapped,'http://localhost').pathname:canonical;
 const resolve=p=>path.resolve(root,'.'+p);
 let file=resolve(canonical);
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end();return}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory()){canonical=canonical.endsWith('/')?canonical:canonical+'/';file=path.join(file,'index.html')}
 const canonicalHost=publicHost&&!staging&&process.env.ENFORCE_CANONICAL_HOST==='1';
 const correctHost=(!canonicalHost)||(req.headers.host===new URL(info.origin).host&&req.headers['x-forwarded-proto']==='https');
 if(name!==canonical||!correctHost){res.writeHead(301,{Location:(canonicalHost?info.origin:'')+canonical+parsed.search+redirectHash});res.end();return}
 let status=200;if(!fs.existsSync(file)||!fs.statSync(file).isFile()){status=404;file=root+'/404.html';res.setHeader('X-Robots-Tag','noindex, follow')}
 if(canonical==='/404.html')status=404;
 if(/\/(?:gracias|gracies|thank-you)\/$/.test(canonical))res.setHeader('X-Robots-Tag','noindex, follow');
 const type=types[path.extname(file)]||'application/octet-stream';
 let body=fs.readFileSync(file);res.setHeader('Content-Type',type);res.setHeader('Cache-Control',canonical.startsWith('/assets/')?'public, max-age=3600':'no-cache');
 if(/text|json|xml|svg/.test(type)&&/\bgzip\b/.test(req.headers['accept-encoding']||'')){body=zlib.gzipSync(body);res.setHeader('Content-Encoding','gzip');res.setHeader('Vary','Accept-Encoding')}
 res.setHeader('Content-Length',body.length);res.writeHead(status);res.end(req.method==='HEAD'?undefined:body);
});
server.listen(port,host,()=>console.log(`Smokers ${lan?'local-network':staging?'staging':'production'} preview: http://${lan?host:'127.0.0.1'}:${port}/en/at-home/`));
