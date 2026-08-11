/* Temporary end-to-end smoke test for the anonymous /scan page.
 * Drives the real UI: loads /scan, fills the form with a sample resume
 * + job description, submits, waits for AI results, verifies the
 * conversion CTA, and checks the console for errors.
 */
const { chromium } = require('C:/Users/kesha/AppData/Roaming/npm/node_modules/omniroute/node_modules/playwright');

const BASE = 'http://localhost:5173';
const SAMPLE_PDF = 'C:/Projects/resume-screener/backend/uploads/a5f1a77a-1078-4d14-9f50-a94961b2838c_sample_resume_1.pdf';
const JD = 'Senior Full Stack Engineer with React, Python, FastAPI, PostgreSQL, AWS experience';

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/kesha/AppData/Local/ms-playwright/chromium-1208/chrome-win64/chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

  // 1. Load the landing page and check the hero CTA points at /scan
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const heroCta = page.locator('button:has-text("Try a free scan")');
  await heroCta.waitFor({ timeout: 15000 });
  console.log('PASS  hero CTA "Try a free scan" present');
  await heroCta.click();
  await page.waitForURL('**/scan', { timeout: 10000 });
  console.log('PASS  hero CTA navigates to /scan');

  // 2. Form fields present
  await page.locator('input[placeholder*="Senior Full Stack Engineer"]').waitFor({ timeout: 10000 });
  await page.locator('textarea[placeholder*="complete job description"]').waitFor();
  console.log('PASS  scan form rendered (job title + job description)');

  // 3. Fill the form and submit
  await page.locator('input[placeholder*="Senior Full Stack Engineer"]').fill('Senior Full Stack Engineer');
  await page.locator('textarea[placeholder*="complete job description"]').fill(JD);
  await page.setInputFiles('input[type="file"]', SAMPLE_PDF);
  // confirm the chosen file name shows in the drop zone
  await page.locator('text=sample_resume_1.pdf').first().waitFor({ timeout: 5000 });
  console.log('PASS  resume file selected and displayed');
  await page.locator('button:has-text("Run Free Scan")').click();

  // 4. Loading animation then results
  await page.locator('text=Analyzing with AI').waitFor({ timeout: 5000 });
  console.log('PASS  loading animation shown');
  await page.locator('text=Overall Match Score').waitFor({ timeout: 30000 });
  console.log('PASS  AI results rendered');

  // 5. Conversion CTA present
  const signupCta = page.locator('button:has-text("Create Free Account")');
  await signupCta.waitFor({ timeout: 5000 });
  console.log('PASS  conversion CTA "Create Free Account" present');

  // 6. Nav still offers Sign in
  await page.locator('button:has-text("Sign in")').first().waitFor({ timeout: 5000 });
  console.log('PASS  nav "Sign in" present');

  // Screenshot the results for the record
  await page.screenshot({ path: 'C:/Projects/resume-screener/frontend/scan-e2e-results.png', fullPage: true });

  // 7. Conversion CTA navigates to /login
  await signupCta.click();
  await page.waitForURL('**/login', { timeout: 10000 });
  console.log('PASS  conversion CTA navigates to /login');

  // 8. Back on the landing page, check the remaining CTAs point at /scan
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });

  const navTryItFree = page.getByRole('button', { name: /try it free/i });
  await navTryItFree.waitFor({ timeout: 10000 });
  console.log('PASS  SiteNav "Try it free" present');

  const resultsCta = page.getByRole('button', { name: /try a reading/i });
  await resultsCta.waitFor({ timeout: 10000 });
  console.log('PASS  Results chapter "Try a reading" present');

  const beginCta = page.getByRole('button', { name: /begin.*free/i });
  await beginCta.waitFor({ timeout: 10000 });
  console.log('PASS  Begin chapter "Begin — it\'s free" present');
  await beginCta.click();
  await page.waitForURL('**/scan', { timeout: 10000 });
  console.log('PASS  Begin chapter CTA navigates to /scan');

  if (consoleErrors.length) {
    console.log('CONSOLE ERRORS:');
    consoleErrors.forEach((e) => console.log('  - ' + e));
    process.exitCode = 1;
  } else {
    console.log('PASS  no console errors');
  }

  await browser.close();
  console.log('DONE');
})().catch((err) => {
  console.error('FAIL', err.message);
  process.exit(1);
});
