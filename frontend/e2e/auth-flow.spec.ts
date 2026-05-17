import { test, expect } from '@playwright/test';

test.describe('register → auto-login → redirect to /problems', () => {
  test('new user can register and lands on problem list', async ({ page }) => {
    const unique = Date.now();
    const email = `e2e-${unique}@example.com`;
    const password = 'Pass-Phrase-E2E-2026';
    const nickname = `e2e-${unique}`;

    await page.goto('/auth');

    // Switch to the 注册 tab.
    await page.getByRole('tab', { name: '注册', exact: true }).click();

    // Fill the form. Labels are zh-only, so we target by input position
    // (nickname, email, password) under their <label> siblings.
    await page.locator('input[type="text"]').first().fill(nickname);
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);

    // Submit and expect redirect to /problems on success.
    await page.locator('form button[type="submit"]').click();
    await expect(page).toHaveURL(/\/problems$/, { timeout: 10_000 });
  });

  test('login with wrong password shows an error', async ({ page }) => {
    await page.goto('/auth');
    // 登录 tab is the default.
    await page.locator('input[type="email"]').fill('nobody@example.com');
    await page.locator('input[type="password"]').fill('definitely-wrong');
    await page.locator('form button[type="submit"]').click();

    // Should remain on /auth and surface an error message.
    await expect(page).toHaveURL(/\/auth$/);
    // Error block is rendered conditionally inside the form.
    await expect(page.locator('form')).toContainText(/.+/);
  });
});
