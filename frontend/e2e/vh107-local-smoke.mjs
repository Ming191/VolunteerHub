import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const API='http://localhost:8080', WEB='http://localhost:5173';
const browser=await chromium.launch({channel:'msedge',headless:true});
const ctx=await browser.newContext({viewport:{width:1280,height:800}});
const page=await ctx.newPage();
const email='vh107-smoke-'+Date.now()+'@example.invalid', password='LocalE2ETest2026!';
const check=(res,expected,name)=>assert.equal(res.status(),expected,name+': '+res.status());
try {
 const reg=await ctx.request.post(API+'/api/auth/register',{data:{username:'VH107 Organizer',email,password,gender:'OTHER',role:'EVENT_ORGANIZER'}});
 check(reg,201,'organizer register');
 const login=await ctx.request.post(API+'/api/auth/login',{headers:{Origin:WEB,'X-VH-Session':'1'},data:{email,password}});
 check(login,200,'login');
 const token=(await login.json()).accessToken;
 const authorization={Authorization:'Bearer '+token};
 const date=(days)=>new Date(Date.now()+days*86400000).toISOString().slice(0,19);
 const eventBody={title:'VH107 temporary browser upload event',description:'E2E temporary event',location:'Local test',eventDateTime:date(15),endDateTime:date(16),maxParticipants:3};
 const event=await ctx.request.post(API+'/api/events',{headers:authorization,multipart:{request:{name:'request.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(eventBody))}}});
 assert.equal(event.status(),201,'event create: '+(await event.text()).slice(0,300));
 const eventId=(await event.json()).id;
 const response=await ctx.request.post(API+'/api/events/'+eventId+'/posts/signed-url',{headers:authorization,data:{contentType:'image/png',fileName:'browser.png',sizeBytes:1000}});
 assert.equal(response.status(),200,'signed URL: '+(await response.text()).slice(0,300));
 const body=await response.json();
 await page.goto(WEB+'/signin',{waitUntil:'domcontentloaded'});
 const image=await page.evaluate(async()=>{
   const c=document.createElement('canvas');c.width=2;c.height=2;
   c.getContext('2d').fillRect(0,0,2,2);
   return Array.from(new Uint8Array(await new Promise((resolve)=>c.toBlob(async b=>resolve(await b.arrayBuffer()),'image/png'))));
 });
 const upload=async(url,bytes)=>page.evaluate(async({url,bytes})=>{
    const response=await fetch(url,{method:'PUT',headers:{'Content-Type':'image/png','If-None-Match':'*'},body:new Uint8Array(bytes)});
    return {status:response.status,allow:response.headers.get('access-control-allow-origin')};
 },{url,bytes});
 const first=await upload(body.signedUrl,image);
 assert.ok(first.status>=200&&first.status<300,'browser signed PUT '+JSON.stringify(first));
 const replay=await upload(body.signedUrl,image);
 assert.ok([409,412].includes(replay.status),'browser replay status '+JSON.stringify(replay));
 const post=await ctx.request.post(API+'/api/events/'+eventId+'/posts',{headers:authorization,data:{content:'Uploaded from Edge',imageUrls:[body.publicUrl]}});
 assert.equal(post.status(),201,'create post with image: '+(await post.text()).slice(0,300));
 const imageRead=await ctx.request.get(body.publicUrl);
 assert.equal(imageRead.status(),200,'read image');
 assert.ok((await imageRead.body()).length>0);
 const large=await ctx.request.post(API+'/api/events/'+eventId+'/posts/signed-url',{headers:authorization,data:{contentType:'image/png',fileName:'too-big.png',sizeBytes:1000}});
 assert.equal(large.status(),200,'second signed URL');
 const oversized=await upload((await large.json()).signedUrl,new Uint8Array(10485761));
 assert.equal(oversized.status,413,'nginx oversized PUT rejection');
 console.log('VH107_EDGE_E2E_PASS '+JSON.stringify({register:201,login:200,event:eventId,signedPut:first.status,replay:replay.status,post:201,read:200,oversized:413}));
} finally {await ctx.close();await browser.close();}
