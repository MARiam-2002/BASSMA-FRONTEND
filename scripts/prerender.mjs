import { readFile, writeFile } from 'node:fs/promises';
import { render, seo } from '../dist-ssr/entry-server.js';
const organizationId = `${seo.url}#organization`;
const services = ['تصميم الهوية البصرية وتجربة المستخدم', 'تطوير المواقع', 'تطوير تطبيقات الجوال'];
const graph = {
  '@context': 'https://schema.org',
  '@graph': [
    {'@type':'Organization','@id':organizationId,name:'بصمة',alternateName:['Basma','Bassma'],url:seo.url,description:seo.description,
      logo:{'@type':'ImageObject',url:`${seo.url}basma-logo-512.png`,width:512,height:512},
      email:'bassma1company@gmail.com',telephone:'+201021288238',
      areaServed:[{'@type':'Country',name:'Egypt'},{'@type':'Country',name:'Saudi Arabia'}],
      contactPoint:{'@type':'ContactPoint',telephone:'+201021288238',email:'bassma1company@gmail.com',contactType:'customer service',availableLanguage:['Arabic']}},
    {'@type':'WebSite','@id':`${seo.url}#website`,url:seo.url,name:'بصمة | Basma',inLanguage:'ar',publisher:{'@id':organizationId}},
    {'@type':'WebPage','@id':`${seo.url}#webpage`,url:seo.url,name:seo.title,description:seo.description,inLanguage:'ar',isPartOf:{'@id':`${seo.url}#website`},about:{'@id':organizationId},primaryImageOfPage:{'@type':'ImageObject',url:seo.image,width:1200,height:630}},
    ...services.map((name,i)=>({'@type':'Service','@id':`${seo.url}#service-${i+1}`,name,provider:{'@id':organizationId},areaServed:['Egypt','Saudi Arabia'],url:`${seo.url}#services`}))
  ]
};
let html = await readFile('dist/index.html','utf8');
if (!html.includes('<div id="root"></div>')) throw new Error('Missing prerender root');
html = html.replace('<div id="root"></div>', `<div id="root">${render()}</div>`);
const structured = JSON.stringify(graph).replace(/</g,'\u003c');
html = html.replace('</head>', `<script type="application/ld+json">${structured}</script></head>`);
await writeFile('dist/index.html', html);
console.log('Prerendered Arabic company content and structured data; API content still loads in the browser.');
