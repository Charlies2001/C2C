import { test, expect } from '@playwright/test';

test.describe('landing page smoke', () => {
  test('loads and shows the hero CTA linking to /problems', async ({ page }) => {
    await page.goto('/');
    // Hero CTA "开始练习" → /problems (the primary user action on landing).
    const cta = page.locator('a[href="/problems"]').first();
    await expect(cta).toBeVisible();

    // GitHub source link is exposed on landing — used by the open-source pitch.
    const githubLink = page.locator('a[href*="github.com"]').first();
    await expect(githubLink).toBeVisible();
  });

  test('navbar exposes a 登录 link for guests', async ({ page }) => {
    await page.goto('/');
    const loginLink = page.getByRole('link', { name: '登录' });
    await expect(loginLink).toBeVisible();
  });

  test('footer links to privacy + terms are reachable without login', async ({ page }) => {
    await page.goto('/');
    // Footer link → privacy page
    await page.getByRole('link', { name: '隐私政策' }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page.getByRole('heading', { name: '隐私政策' })).toBeVisible();

    // Cross-link inside privacy → terms
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: '服务条款' })).toBeVisible();
  });
});
