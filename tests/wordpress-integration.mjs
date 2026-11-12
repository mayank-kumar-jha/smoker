import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
export async function testWordPress(server){
 console.log('WP QA starting');
 const base=server.serverUrl,php=code=>server.playground.run({code:'<?php require "/wordpress/wp-load.php"; '+code});
 // Test mail is intercepted inside this disposable local WordPress instance. No external messages.
 await server.playground.mkdir('/wordpress/wp-content/mu-plugins');
 await server.playground.writeFile('/wordpress/wp-content/mu-plugins/smokers-test-mail.php','<?php add_filter("pre_wp_mail",function($result,$atts){update_option("smokers_test_mail",$atts);return !get_option("smokers_test_fail_mail");},10,2);');
 const browser=await chromium.launch({channel:process.env.CI?undefined:'chrome',headless:true}),page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 const admin=async(tab,q,lang='en')=>{await page.goto(`${base}/wp-admin/admin.php?page=smokers-content&tab=${tab}&lang=${lang}&q=${encodeURIComponent(q)}`);await page.waitForSelector('.smokers-fields')};
 const save=async()=>{await Promise.all([page.waitForURL(/saved=1/),page.locator('#submit').click()])};
 const checks=[];const push=checks.push.bind(checks);checks.push=(...values)=>{console.log('WP CHECK',...values);return push(...values)};
 try{
  const source='Chicken marinated for 12 hours, smoked over hardwood and slow-cooked in our Badalona workshop.';
  await admin('text',source);const field=page.locator('.smokers-field textarea').first(),original=source;await field.fill('WordPress editing verified <script>alert(1)</script>');await save();
  await page.goto(base+'/en/at-home/');assert.equal(await page.locator('.ss-flat-description').innerText(),'WordPress editing verified');
  const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(base+'/en/at-home/');assert.match(await nojs.locator('.ss-flat-description').innerText(),/WordPress editing verified/);await nojs.close();
  await admin('text',source);await page.locator('.smokers-field textarea').first().fill(original);await save();checks.push('Admin text save, server-rendered output, no-JS content and HTML escaping');
  const dish='Pork cheek marinated 12 hours, smoked 4 hours over wood and slow-cooked until it falls apart. No knife needed.';
  await admin('text',dish);const dishField=page.locator('.smokers-field textarea').filter({hasText:/.*/}).first();const oldDish=await dishField.inputValue();await dishField.fill('Edited dish content remains after React hydration.');await save();
  await page.goto(base+'/en/at-home/');await page.locator('.dsh-card').scrollIntoViewIfNeeded();await page.waitForTimeout(400);assert.equal(await page.locator('.dsh-body[aria-hidden=false] .dsh-desc').innerText(),'Edited dish content remains after React hydration.');
  await page.locator('.dsh-arrow').last().click();await page.locator('.dsh-arrow').first().click();assert.equal(await page.locator('.dsh-body[aria-hidden=false] .dsh-desc').innerText(),'Edited dish content remains after React hydration.');
  await admin('text',dish);await page.locator('.smokers-field textarea').first().fill(oldDish);await save();checks.push('Edited dish text survives hydration and swiping');
  await admin('media','orbit-v2-01_pork_cheek.webp');await page.locator('.smokers-media-pick').click();
  const upload=page.getByRole('tab',{name:'Upload files',exact:true});if(await upload.count())await upload.click();
  await page.locator('.media-modal input[type=file]').first().setInputFiles('site/assets/apple-touch-icon.png');
  await page.locator('.media-button-select').click({timeout:30000});await save();
  await page.goto(base+'/en/at-home/');await page.waitForTimeout(300);assert.match(await page.locator('.dsh-orbit').first().locator('img').getAttribute('src'),/\/uploads\//);
  await admin('media','orbit-v2-01_pork_cheek.webp');await page.locator('.smokers-media-reset').click();await save();checks.push('Media Library upload, replacement and restore');
  const post=await php('$id=wp_insert_post(["post_type"=>"post","post_status"=>"publish","post_title"=>"Phase one blog verification","post_content"=>"<p>Native WordPress article content.</p>"]);update_post_meta($id,"_smokers_language","en");echo json_encode(["id"=>$id,"url"=>get_permalink($id)]);');
  const blog=JSON.parse(post.text);await page.goto(base+'/en/blog/');await page.getByRole('link',{name:'Phase one blog verification'}).click();assert.match(await page.locator('#ss-main').innerText(),/Native WordPress article content/);await php(`wp_delete_post(${blog.id},true);`);checks.push('Native blog listing and article navigation');
  await page.goto(base+'/en/contact/');await page.locator('[name=name]').fill('Local QA');await page.locator('[name=email]').fill('qa@example.invalid');await page.locator('[name=message]').fill('Local test message; delivery is intercepted.');await page.locator('[name=privacy]').check();await page.locator('#ss-enquiry-form [type=submit]').click();await page.waitForFunction(()=>document.querySelector('.ss-wp-mail-status')?.textContent.includes('submitted'));
  const mail=await php('echo json_encode(get_option("smokers_test_mail"));');assert.match(mail.text,/Local test message/);checks.push('Server-side form submission with intercepted delivery');
  const invalid=await page.evaluate(async()=>{const r=await fetch(window.SMOKERS_WP.ajax,{method:'POST',body:new URLSearchParams({action:'smokers_contact',nonce:'invalid'})});return r.status});assert.equal(invalid,403);checks.push('Invalid form nonce rejected');
  await php('update_option("smokers_test_fail_mail",true);');await page.locator('#ss-enquiry-form [type=submit]').click();await page.waitForFunction(()=>document.querySelector('.ss-wp-mail-status')?.textContent.includes('Unable'));await php('delete_option("smokers_test_fail_mail");');assert.equal(await page.locator('[name=message]').inputValue(),'Local test message; delivery is intercepted.');checks.push('Mail failures retain the message and show a retry error');
  const seed=await php('echo json_encode(smokers_create_pages());');assert.equal(JSON.parse(seed.text).created,0);checks.push('Repeated installation does not duplicate pages');
  for(const width of [320,390,430,768,1440]){await page.setViewportSize({width,height:900});for(const route of ['/en/at-home/','/en/professionals/','/en/contact/','/en/blog/']){await page.goto(base+route);await page.evaluate(()=>window.SMOKERS_PRO_INTRO_CANCEL?.());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Overflow ${width} ${route}`)}}checks.push('Phone, tablet and desktop layouts on WordPress');
  assert.deepEqual(errors,[]);checks.push('No browser runtime errors');
  fs.writeFileSync('output/phase1/wordpress-tests.json',JSON.stringify({passed:true,checks},null,2));console.log('WORDPRESS PASS',checks);
 }finally{await browser.close()}
}
