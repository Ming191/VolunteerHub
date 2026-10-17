import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const WEB = process.env.E2E_WEB_URL || 'http://localhost:5173';
const API = process.env.E2E_API_URL || 'http://127.0.0.1:18080';
const PG_CONTAINER = process.env.E2E_PG_CONTAINER;
const PG_DB = process.env.E2E_PG_DB;
const PG_USER = process.env.E2E_PG_USER;
if (process.env.E2E_DISPOSABLE_DB !== 'yes' || !PG_CONTAINER?.startsWith('vh220-e2e-') || !PG_DB?.includes('e2e') || !PG_USER) {
  throw new Error('Refusing database fixture writes: use an explicit disposable vh220-e2e-* container and e2e DB');
}
const emailSuffix = Date.now().toString(36);
const password = 'Disposable-E2E!'+randomBytes(16).toString('hex');
const records = [];
async function stage(name, fn) {
  try { const value=await fn(); records.push({name,status:'PASS'}); console.log('PASS '+name);return value; }
  catch(e){records.push({name,status:'FAIL',reason:e.message}); console.error('FAIL '+name+' '+e.stack); if(otherBrowser){console.error('DEBUG_PAGE_URL',otherBrowser.page.url());console.error('DEBUG_PAGE_TEXT',(await otherBrowser.page.locator('body').innerText().catch(()=>'' )).slice(0,1800));} throw e;}
}
const sql = query => execFileSync('docker',['exec',PG_CONTAINER,'psql','-U',PG_USER,'-d',PG_DB,'-At','-v','ON_ERROR_STOP=1','-c',query],{encoding:'utf8'}).trim();
const edge = process.platform==='win32' ? {channel:'msedge',headless:true} : {headless:true};
const browser = await chromium.launch(edge);
const apiContext = await browser.newContext();
const api = apiContext.request;
let owner,bystander,ownerToken,bystanderToken,eventId,postId;
async function request(method,url,options={}) {return api[method](API+url,options);}
const bearer = token=>({Authorization:'Bearer '+token});
async function createUser(name,email) {
  const reg = await request('post','/api/auth/register',{
    data:{username:name,email,password,gender:'OTHER',role:'VOLUNTEER'}
  });
  assert.equal(reg.status(),201,'register: '+(await reg.text()).slice(0,600));
  const login = await request('post','/api/auth/login',{data:{email,password}});
  assert.equal(login.status(),200,'login: '+(await login.text()).slice(0,600));
  const data=await login.json();
  assert.ok(data.userId>0);
  assert.ok(data.accessToken);
  return {...data,email,name};
}
async function viewerPage(user) {
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  await context.addInitScript((auth)=>{
    localStorage.setItem('accessToken',auth.accessToken);
    localStorage.setItem('refreshToken',auth.refreshToken);
    localStorage.setItem('user', JSON.stringify({
      userId:auth.userId,email:auth.email,name:auth.name,role:auth.role,isEmailVerified:auth.isEmailVerified
    }));
  },user);
  const page=await context.newPage();
  return {context,page};
}
let ownerBrowser,otherBrowser;
try {
 await stage('real Spring Boot and React Vite reachable',async()=>{
   const openapi=await request('get','/v3/api-docs');
   assert.equal(openapi.status(),200);
   const web=await api.get(WEB+'/');
   assert.equal(web.status(),200);
 });
 await stage('two actual user accounts created and authenticated',async()=>{
   owner=await createUser('Locked Profile Owner','vh220-owner-'+emailSuffix+'@example.invalid');
   bystander=await createUser('External Viewer','vh220-viewer-'+emailSuffix+'@example.invalid');
   ownerToken=owner.accessToken;
   bystanderToken=bystander.accessToken;
 });
 await stage('seed isolated published discussion with post and comment',async()=>{
   const fixtureBio='E2E_PROFILE_DETAIL_MUST_LOCK';
   const avatar='https://example.invalid/e2e-avatar.png';
   sql(`UPDATE users SET bio='${fixtureBio}',profile_picture_url='${avatar}' WHERE id=${owner.userId};`);
   eventId=Number(sql(`INSERT INTO events(creator_id,title,description,location,event_date_time,end_date_time,status,created_at,updated_at,version,waitlist_enabled)
      VALUES (${owner.userId},'VH220 E2E public event','fixture only','test',NOW()+interval '60 day',NOW()+interval '60 day 2 hour','PUBLISHED',NOW(),NOW(),0,true) RETURNING id;`).split('\n').find(x=>/^\d+$/.test(x)));
   assert.ok(eventId>0,'event inserted');
   postId=Number(sql(`INSERT INTO posts(author_id,event_id,content,created_at,updated_at,version)
      VALUES(${owner.userId},${eventId},'E2E_PUBLIC_POST_STILL_VISIBLE',NOW(),NOW(),0) RETURNING id;`).split('\n').find(x=>/^\d+$/.test(x)));
   assert.ok(postId>0,'post inserted');
   sql(`INSERT INTO comments(author_id,post_id,content,created_at)
     VALUES(${owner.userId},${postId},'E2E_PUBLIC_COMMENT_STILL_VISIBLE',NOW());`);
 });
 await stage('public profile initially visible to a different authenticated user',async()=>{
   const r=await request('get',`/api/users/${owner.userId}`,{headers:bearer(bystanderToken)});
   assert.equal(r.status(),200,await r.text());
   const profile=await r.json();
   assert.equal(profile.isPrivate,false);
   assert.equal(profile.bio,'E2E_PROFILE_DETAIL_MUST_LOCK');
 });
 otherBrowser=await viewerPage(bystander);
 await stage('real browser shows public profile and its timeline before lock',async()=>{
   const {page}=otherBrowser;
   await page.goto(WEB+'/profile/'+owner.userId,{waitUntil:'domcontentloaded'});
   await page.getByRole('heading',{name:'Locked Profile Owner'}).waitFor({timeout:20000});
   await page.getByText('E2E_PROFILE_DETAIL_MUST_LOCK').waitFor({timeout:15000});
   await page.getByText('E2E_PUBLIC_POST_STILL_VISIBLE').waitFor({timeout:15000});
 });
 await stage('owner locks profile with authorized settings API',async()=>{
   const r=await request('put','/api/me/settings',{
     headers:bearer(ownerToken),data:{profileVisibility:'PRIVATE'}
   });
   assert.equal(r.status(),200,await r.text());
   const response=await r.json();
   assert.equal(response.profileVisibility,'PRIVATE');
 });
 await stage('backend rechecks permission: profile bio hidden but avatar and name remain',async()=>{
   const r=await request('get',`/api/users/${owner.userId}`,{headers:bearer(bystanderToken)});
   assert.equal(r.status(),200,await r.text());
   const p=await r.json();
   assert.equal(p.isPrivate,true);
   assert.equal(p.bio,null);
   assert.equal(p.name,'Locked Profile Owner');
   assert.equal(p.profilePictureUrl,'https://example.invalid/e2e-avatar.png');
 });
 await stage('real browser displays locked profile without timeline or private details',async()=>{
   const {page}=otherBrowser;
   await page.reload({waitUntil:'domcontentloaded'});
   await page.getByText('This profile is locked').waitFor({timeout:18000});
   assert.equal(await page.getByText('E2E_PROFILE_DETAIL_MUST_LOCK').count(),0);
   assert.equal(await page.getByText('E2E_PUBLIC_POST_STILL_VISIBLE').count(),0);
   await page.getByRole('heading',{name:'Locked Profile Owner'}).waitFor();
 });
 await stage('profile timeline API denies other user, owner still allowed',async()=>{
   const banned=await request('get',`/api/posts/user/${owner.userId}`,{headers:bearer(bystanderToken)});
   assert.equal(banned.status(),403,await banned.text());
   const allowed=await request('get',`/api/posts/user/${owner.userId}`,{headers:bearer(ownerToken)});
   assert.equal(allowed.status(),200,await allowed.text());
   const items=(await allowed.json()).content;
   assert.ok(items.some(x=>x.content==='E2E_PUBLIC_POST_STILL_VISIBLE'));
 });
 await stage('public event discussion still exposes post with author name/avatar',async()=>{
   const r=await request('get',`/api/events/${eventId}/posts`,{headers:bearer(bystanderToken)});
   assert.equal(r.status(),200,await r.text());
   const data=await r.json();
   const post=data.content.find(x=>x.id===postId);
   assert.ok(post,'public event discussion post should remain discoverable');
   assert.equal(post.author.name,'Locked Profile Owner');
   assert.equal(post.author.profilePictureUrl,'https://example.invalid/e2e-avatar.png');
   assert.equal(post.author.bio,null);
 });
 await stage('public comment remains visible with public name/avatar, not bio',async()=>{
   const r=await request('get',`/api/posts/${postId}/comments`,{headers:bearer(bystanderToken)});
   assert.equal(r.status(),200,await r.text());
   const comment=(await r.json()).content.find(x=>x.content==='E2E_PUBLIC_COMMENT_STILL_VISIBLE');
   assert.ok(comment,'comment should remain visible');
   assert.equal(comment.author.name,'Locked Profile Owner');
   assert.equal(comment.author.profilePictureUrl,'https://example.invalid/e2e-avatar.png');
   assert.equal(comment.author.bio,null);
 });
 ownerBrowser=await viewerPage(owner);
 await stage('owner opens their own locked profile and still sees bio and timeline in browser',async()=>{
   const {page}=ownerBrowser;
   await page.goto(WEB+'/profile/'+owner.userId,{waitUntil:'domcontentloaded'});
   await page.getByRole('heading',{name:'Locked Profile Owner'}).waitFor({timeout:20000});
   await page.getByText('E2E_PROFILE_DETAIL_MUST_LOCK').waitFor({timeout:15000});
   await page.getByText('E2E_PUBLIC_POST_STILL_VISIBLE').waitFor({timeout:15000});
 });
} finally {
 await ownerBrowser?.context.close();
 await otherBrowser?.context.close();
 await apiContext.close();
 await browser.close();
 console.log('VH220_REAL_E2E_RESULTS '+JSON.stringify(records));
}
