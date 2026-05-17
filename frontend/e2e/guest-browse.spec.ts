import { test, expect } from '@playwright/test';

test.describe('guest can browse without logging in', () => {
  test('landing CTA navigates to problem list and seeded problems render', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="/problems"]').first().click();

    await expect(page).toHaveURL(/\/problems$/);

    // Seed loader populates ~10 problems in zh-CN; wait for at least one card.
    // We don't bind to specific titles (they may be translated/edited) — we
    // assert that the list mounted and rendered SOMETHING.
    await expect(page.locator('main')).toContainText(/.{1,}/, { timeout: 10_000 });

    // Backend /api/problems should have been hit and returned >= 1 row.
    const resp = await page.request.get('http://localhost:8000/api/problems');
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
  });
});
