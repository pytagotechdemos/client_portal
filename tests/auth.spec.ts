import { test, expect } from '@playwright/test';

test.describe('Authentication and Security Boundaries', () => {
  test('should redirect unauthenticated user to login when accessing protected routes', async ({ page }) => {
    // Attempt to access projects
    await page.goto('/projects');
    await expect(page).toHaveURL(/.*\/login.*/, { timeout: 15000 });

    // Attempt to access clients
    await page.goto('/clients');
    await expect(page).toHaveURL(/.*\/login.*/, { timeout: 15000 });

    // Attempt to access settings
    await page.goto('/settings');
    await expect(page).toHaveURL(/.*\/login.*/, { timeout: 15000 });
  });

  test('should fail login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    // Wait for page to load and potentially redirect
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await expect(page.getByTestId('login-email')).toBeVisible({ timeout: 20000 });
    await page.getByTestId('login-email').fill('wrong@email.com');
    await page.getByTestId('login-password').fill('wrongpassword');
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/.*login.*|.*signin.*|.*error.*/i, { timeout: 15000 });
  });

  test('should show not found for invalid client portal access', async ({ page }) => {
    await page.goto('/portal/invalid-token-12345');
    // Should show not found page
    await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible({ timeout: 15000 });
  });
});
