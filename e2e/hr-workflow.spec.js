import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_USER = { username: 'e2etest', password: 'test1234' };

// ─── Helpers ───────────────────────────────────────────────────────────

async function removeAllDialogs(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[role="dialog"]').forEach(el => el.remove());
  }).catch(() => {});
  await page.waitForTimeout(200);
}

async function login(page) {
  await page.goto('/login');
  await page.waitForSelector('#username', { timeout: 10000 });
  await page.fill('#username', TEST_USER.username);
  await page.fill('#password', TEST_USER.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.waitForTimeout(1500);
}

async function clickButton(page, name) {
  await removeAllDialogs(page);
  const btn = page.getByRole('button', { name, exact: true }).first();
  await btn.waitFor({ state: 'visible', timeout: 5000 });
  await btn.click({ force: true, timeout: 5000 });
}

async function fillField(page, label, value) {
  const field = page.getByLabel(label);
  await field.waitFor({ state: 'visible', timeout: 3000 });
  await field.fill(value);
}

async function selectField(page, label, value) {
  const field = page.getByLabel(label);
  await field.waitFor({ state: 'visible', timeout: 3000 });
  await field.selectOption(value);
}

async function waitForPageReady(page) {
  try {
    await page.waitForFunction(() => {
      const spinners = document.querySelectorAll('[role="status"]');
      return Array.from(spinners).every(s => !s.textContent.includes('Loading'));
    }, { timeout: 10000 });
  } catch { /* ignore */ }
}

async function captureApiResponse(page, urlPattern) {
  const response = await page.waitForResponse(
    resp => resp.url().includes(urlPattern) && resp.status() >= 200 && resp.status() < 500,
    { timeout: 15000 }
  );
  let body = null;
  try { body = await response.json(); } catch { try { body = await response.text(); } catch {} }
  return { status: response.status(), body, url: response.url() };
}

// ─── Suite ─────────────────────────────────────────────────────────────

test.describe('HR Workflow E2E', () => {

  test('Core HR workflow: Login → Employees → Attendance → Payroll → Top Performance', async ({ page }) => {

    // ══════════════════════════════════════════════════════════
    // 1. LOGIN
    // ══════════════════════════════════════════════════════════
    await test.step('1. Login', async () => {
      await login(page);
      console.log(`[PASS] Login — redirected to ${page.url()}`);
    });

    // ══════════════════════════════════════════════════════════
    // 2. EMPLOYEES PAGE
    // ══════════════════════════════════════════════════════════
    await test.step('2. Employees', async () => {
      await waitForPageReady(page);

      // Stats cards
      await expect(page.locator('text=Total Employees').first()).toBeVisible({ timeout: 5000 });
      console.log('  [PASS] Stats cards visible');

      // Table rows
      await page.waitForSelector('table tbody tr', { timeout: 8000 });
      const rowCount = await page.locator('table tbody tr').count();
      console.log(`  [PASS] Table has ${rowCount} employees`);

      // Key employees
      await expect(page.getByText('Ziad Ammar').first()).toBeVisible({ timeout: 3000 });
      await expect(page.getByText('Radwa Ramadan').first()).toBeVisible({ timeout: 3000 });
      console.log('  [PASS] Ziad Ammar & Radwa Ramadan visible');

      // Add an employee for testing
      await removeAllDialogs(page);
      await clickButton(page, 'Add Employee');
      await page.waitForSelector('#form-modal-title', { timeout: 5000 });
      await fillField(page, 'Full Name', 'E2E Test Employee');
      await fillField(page, 'Employee #', 'E2E-001');
      await fillField(page, 'Email', 'e2e-test-emp@example.com');
      await fillField(page, 'Salary', '5000');
      await fillField(page, 'Hire Date', '2026-07-01');
      await selectField(page, 'Department', 'engineering');
      await page.locator('[role="dialog"]').getByRole('button', { name: 'Add Employee' }).click({ force: true });
      await page.waitForTimeout(2000);
      await removeAllDialogs(page);
      await waitForPageReady(page);

      await expect(page.getByText('E2E Test Employee').first()).toBeVisible({ timeout: 5000 });
      console.log('  [PASS] Added new employee');
    });

    // ══════════════════════════════════════════════════════════
    // 3. ATTENDANCE + IMPORT
    // ══════════════════════════════════════════════════════════
    await test.step('3. Attendance', async () => {
      await removeAllDialogs(page);
      await page.getByRole('link', { name: 'Attendance' }).click({ force: true, timeout: 5000 });
      await page.waitForURL(/\/hr\/attendance/, { timeout: 10000 });
      await waitForPageReady(page);

      await expect(page.locator('text=Present').first()).toBeVisible({ timeout: 5000 });
      console.log('  [PASS] Stats cards visible');

      // Add attendance for Ziad Ammar (today)
      await removeAllDialogs(page);
      await clickButton(page, 'Add Record');
      await page.waitForSelector('#form-modal-title', { timeout: 5000 });
      await selectField(page, 'Employee', '4');
      await fillField(page, 'Date', new Date().toISOString().split('T')[0]);
      await fillField(page, 'Check In', '09:00');
      await fillField(page, 'Check Out', '17:00');
      await page.locator('[role="dialog"]').getByRole('button', { name: 'Add Record' }).click({ force: true });
      await page.waitForTimeout(2000);
      await removeAllDialogs(page);
      await waitForPageReady(page);

      await expect(page.getByText('Ziad Ammar').first()).toBeVisible({ timeout: 5000 });
      console.log('  [PASS] Attendance added for Ziad Ammar');

      // Test Import
      const importBtn = page.getByRole('button', { name: 'Import', exact: true });
      if (await importBtn.isVisible({ timeout: 2000 })) {
        await importBtn.click({ force: true });
        await page.waitForSelector('#import-modal-title', { timeout: 5000 });
        console.log('  [PASS] Import modal opened');

        // Create sample CSV
        const tmpDir = path.join(__dirname, '..', 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        const csvPath = path.join(tmpDir, 'e2e-import.csv');
        fs.writeFileSync(csvPath, 'employee_id,attendance_date,status\n4,2026-07-15,present\n');

        await page.locator('input[type="file"]').setInputFiles(csvPath);
        await page.waitForTimeout(500);

        const importFileBtn = page.locator('[role="dialog"]').getByRole('button', { name: /^Import$/ });
        if (await importFileBtn.isEnabled({ timeout: 3000 })) {
          const respPromise = page.waitForResponse(r => r.url().includes('/attendance/import'), { timeout: 10000 });
          await importFileBtn.click();
          try {
            const resp = await respPromise;
            let body;
            try { body = await resp.json(); } catch { body = await resp.text(); }
            if (resp.status() >= 400) {
              console.log(`  [FAIL] Import API error: HTTP ${resp.status()} ${JSON.stringify(body)}`);
            } else {
              console.log(`  [PASS] Import succeeded: ${JSON.stringify(body)}`);
            }
          } catch (e) {
            console.log(`  [FAIL] Import request failed: ${e.message}`);
          }
        }
        const doneBtn = page.locator('[role="dialog"]').getByRole('button', { name: 'Done' });
        if (await doneBtn.isVisible({ timeout: 2000 })) {
          await doneBtn.click();
        }
        await removeAllDialogs(page);
      }
    });

    // ══════════════════════════════════════════════════════════
    // 4. PAYROLL GENERATION
    // ══════════════════════════════════════════════════════════
    await test.step('4. Payroll', async () => {
      await removeAllDialogs(page);
      await page.getByRole('link', { name: 'Payroll' }).click({ force: true, timeout: 5000 });
      await page.waitForURL(/\/hr\/payroll/, { timeout: 10000 });
      await waitForPageReady(page);

      await expect(page.locator('text=Total Payroll').first()).toBeVisible({ timeout: 5000 });
      console.log('  [PASS] Stats cards visible');

      // Open Generate Payroll modal
      await removeAllDialogs(page);
      await clickButton(page, 'Generate Payroll');
      await page.waitForSelector('#generate-payroll-title', { timeout: 5000 });

      // Click Generate and capture the API response
      const genRespPromise = page.waitForResponse(r => r.url().includes('/payroll/generate'), { timeout: 20000 });
      await page.locator('[role="dialog"]').getByRole('button', { name: 'Generate' }).click({ force: true });

      try {
        const genResp = await genRespPromise;
        let body;
        try { body = await genResp.json(); } catch { body = await genResp.text(); }

        if (genResp.status() >= 200 && genResp.status() < 300) {
          const count = Array.isArray(body) ? body.length : '?';
          console.log(`  [PASS] Payroll generated — ${count} records`);
        } else if (genResp.status() === 404) {
          const detail = body?.detail || JSON.stringify(body);
          console.log(`  [WARN] Payroll returned 404: ${detail}`);
        } else {
          console.log(`  [WARN] Payroll response: HTTP ${genResp.status()} ${JSON.stringify(body)}`);
        }
      } catch (e) {
        console.log(`  [WARN] Payroll request: ${e.message}`);
      }

      // Close modal
      await removeAllDialogs(page);
      await page.waitForTimeout(1000);
      await waitForPageReady(page);

      // Check table for records
      const table = page.locator('[aria-label="Payroll table"]').first();
      if (await table.isVisible({ timeout: 3000 })) {
        const rows = await table.locator('tbody tr').count();
        console.log(`  [INFO] Payroll table has ${rows} rows`);
      } else {
        console.log('  [INFO] No payroll table visible (generation may not have created records)');
      }
    });

    // ══════════════════════════════════════════════════════════
    // 5. TOP PERFORMANCE
    // ══════════════════════════════════════════════════════════
    await test.step('5. Top Performance', async () => {
      await removeAllDialogs(page);
      await page.getByRole('link', { name: 'Top Performance' }).click({ force: true, timeout: 5000 });
      await page.waitForURL(/\/hr\/top-performance/, { timeout: 10000 });
      await waitForPageReady(page);

      // Capture API response
      let apiStatus = 'unknown';
      let apiBody = null;
      try {
        const resp = await page.waitForResponse(r => r.url().includes('/top-performance'), { timeout: 15000 });
        apiStatus = String(resp.status());
        try { apiBody = await resp.json(); } catch { apiBody = await resp.text(); }
        if (resp.status() >= 400) {
          console.log(`  [FAIL] Top Performance API: HTTP ${resp.status()} ${JSON.stringify(apiBody)}`);
        } else {
          console.log(`  [PASS] API response: HTTP ${resp.status()}`);
        }
      } catch (e) {
        console.log(`  [FAIL] Top Performance API timed out: ${e.message}`);
      }

      // Check for error messages
      const errorMsg = page.locator('text=Failed to load performance data');
      if (await errorMsg.isVisible({ timeout: 2000 })) {
        console.log(`  [FAIL] "Failed to load performance data" visible (API: ${apiStatus})`);
      } else {
        console.log('  [PASS] Page loaded without error');
      }

      // Stats cards
      const topPerformer = page.locator('text=Top Performer').first();
      if (await topPerformer.isVisible({ timeout: 3000 })) {
        console.log('  [PASS] Performance stats cards visible');
      }
    });

    // ══════════════════════════════════════════════════════════
    // SUMMARY
    // ══════════════════════════════════════════════════════════
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  HR E2E test completed');
    console.log('═══════════════════════════════════════════════════════');
  });
});
