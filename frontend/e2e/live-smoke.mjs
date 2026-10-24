import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const WEB=process.env.E2E_WEB_URL ?? 'http://localhost:5173';
const API=process.env.E2E_API_URL ?? 'http://localhost:8080';
const PASS='LocalE2ETest2026!';
const email='volunteer-e2e-'+Date.now().toString(36)+'@example.invalid';
const browser=await chromium.launch(process.platform==='win32' ? {channel:'msedge',headless:true} : {headless:true});
const context=await browser.newContext({viewport:{width:1365,height:900}});
const page=await context.newPage();
const results=[];
let browserAccessToken='';
const sessionHeaders={Origin:WEB,'X-VH-Session':'1'};
const refreshCookie=async()=> (await context.cookies(API+'/api/auth/refresh')).find(cookie=>cookie.name==='vh_refresh');
async function run(name,fn){
 try{await fn();results.push({name,result:'PASS'});console.log('PASS '+name)}
 catch(error){results.push({name,result:'FAIL',reason:error.message});console.error('FAIL '+name+' '+error.message);console.error('PAGE_URL '+page.url());console.error('PAGE_TEXT '+(await page.locator('body').innerText().catch(()=>'')).slice(0,650));}
}
try {
 await run('backend health and OpenAPI accessible', async()=>{
   const r=await context.request.get(API+'/v3/api-docs');assert.equal(r.status(),200);
   const s=await r.json();assert.ok(s.paths['/api/auth/register']);
 });
 await run('public ADMIN registration denied by real backend',async()=>{
   const r=await context.request.post(API+'/api/auth/register',{data:{username:'Unauthorized Admin',email:'e2e-admin-blocked-'+Date.now()+'@example.invalid',gender:'OTHER',password:PASS,role:'ADMIN'}});
   assert.equal(r.status(),400,'Admin creation must be rejected');
 });
 await run('signup page has no ADMIN role option',async()=>{
   await page.goto(WEB+'/signup',{waitUntil:'domcontentloaded'});
   const signup=page.locator('form').last();
   await signup.getByRole('combobox').nth(1).click();
   assert.equal(await page.getByRole('option',{name:'Admin',exact:true}).count(),0);
   await page.keyboard.press('Escape');
 });
 await run('volunteer signup via browser and real PostgreSQL/RabbitMQ',async()=>{
   await page.goto(WEB+'/signup',{waitUntil:'domcontentloaded'});
   const form=page.locator('form').last();
   await form.locator('[name=username]').fill('E2E Volunteer');
   await form.locator('[name=email]').fill(email);
   await form.locator('[name=password]').fill(PASS);
   await form.locator('[name=confirmPassword]').fill(PASS);
   await form.getByRole('combobox').nth(0).click();
   await page.getByRole('option',{name:'Other',exact:true}).click();
   await form.getByRole('combobox').nth(1).click();
   await page.getByRole('option',{name:'Volunteer',exact:true}).click();
   const resp=page.waitForResponse(x=>x.url().includes('/api/auth/register') && x.request().method()==='POST',{timeout:25000});
   await form.getByRole('button',{name:'Create Account'}).click();
   const registration=await resp;
   const body=await registration.text();
   assert.equal(registration.status(),201,'registration response: '+body.slice(0,200));
   assert.ok(JSON.parse(body).userId>0);
 });
 await run('login via browser and real backend session',async()=>{
   await page.goto(WEB+'/signin',{waitUntil:'domcontentloaded'});
   const login=page.locator('form').first();
   await login.locator('[name=email]').fill(email);
   await login.locator('[name=password]').fill(PASS);
   const resp=page.waitForResponse(x=>x.url().includes('/api/auth/login') && x.request().method()==='POST',{timeout:25000});
   await login.getByRole('button',{name:'Sign In',exact:true}).click();
   const response=await resp;
   assert.equal(response.status(),200,'login HTTP status');
   const user=await response.json();
   assert.equal(user.role,'VOLUNTEER');
   assert.ok(user.accessToken);
   assert.equal(user.refreshToken,undefined,'refresh token must not be in JSON');
   browserAccessToken=user.accessToken;
   const cookie=await refreshCookie();
   assert.ok(cookie?.httpOnly,'refresh token must be HttpOnly');
   assert.equal(await page.evaluate(()=>localStorage.getItem('refreshToken')),null);
   assert.equal(await page.evaluate(()=>localStorage.getItem('accessToken')),null);
   await page.waitForURL(url=>url.pathname.startsWith('/dashboard'),{timeout:12000});
 });
 await run('volunteer denied admin endpoint by real backend',async()=>{
   const r=await context.request.get(API+'/api/admin/users',{headers:{Authorization:'Bearer '+browserAccessToken}});
   assert.equal(r.status(),403,'Volunteer must be forbidden from accessing admin users API');
 });
 await run('refresh rotates token and rejects replay',async()=>{
   const previous=(await refreshCookie())?.value;
   assert.ok(previous,'browser refresh cookie expected');
   const response=await context.request.post(API+'/api/auth/refresh',{headers:sessionHeaders,data:{}});
   assert.equal(response.status(),200,'refresh HTTP status');
   const fresh=await response.json();
   assert.ok(fresh.accessToken);
   assert.equal(fresh.refreshToken,undefined);
   assert.notEqual((await refreshCookie())?.value,previous,'refresh cookie must rotate');
   const replay=await context.request.post(API+'/api/auth/refresh',{
     headers:{...sessionHeaders,Cookie:`vh_refresh=${previous}`},data:{}});
   assert.equal(replay.status(),401,'rotated refresh token must be invalid');
   // Replay kills that token family. Start a fresh session for the browser logout case.
   const renewed=await context.request.post(API+'/api/auth/login',{
     headers:sessionHeaders,data:{email,password:PASS}});
   assert.equal(renewed.status(),200);
 });
 await run('browser logout revokes refresh token',async()=>{
   const token=(await refreshCookie())?.value;
   assert.ok(token);
   await page.locator('header button').last().click();
   const logoutResponse=page.waitForResponse(x=>x.url().includes('/api/auth/logout') && x.request().method()==='POST',{timeout:12000});
   await page.getByRole('menuitem',{name:'Log Out'}).click();
   assert.equal((await logoutResponse).status(),200);
   await page.waitForURL(url=>url.pathname.startsWith('/signin'),{timeout:12000});
   assert.equal(await page.evaluate(()=>localStorage.getItem('accessToken')),null);
   const revoked=await context.request.post(API+'/api/auth/refresh',{
     headers:{...sessionHeaders,Cookie:`vh_refresh=${token}`},data:{}});
   assert.equal(revoked.status(),401,'logout refresh token must be revoked');
 });
} finally {
 await context.close(); await browser.close();
}
console.log('E2E_RESULTS '+JSON.stringify(results));
if(results.some(x=>x.result==='FAIL'))process.exitCode=1;
