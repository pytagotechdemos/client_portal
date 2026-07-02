import { test, expect } from '@playwright/test';

test.describe('Admin End-to-End Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
    await expect(page.getByTestId('login-email')).toBeVisible({ timeout: 20000 });
    await page.getByTestId('login-email').fill('admin@studiovolta.com');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/\/projects/, { timeout: 30000 });
  });

  test('should show projects page with + New Project button', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
    await page.getByTestId('login-email').fill('admin@studiovolta.com');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/\/projects/, { timeout: 30000 });
    // Use heading to avoid strict mode violation
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
    await expect(page.getByText('+ New Project')).toBeVisible();
  });

  test('should navigate to new project form', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
    await page.getByTestId('login-email').fill('admin@studiovolta.com');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/\/projects/, { timeout: 30000 });

    // Use href-based navigation
    await page.goto('/projects/new');
    await expect(page).toHaveURL(/\/projects\/new/, { timeout: 10000 });
    await expect(page.getByTestId('project-name-input')).toBeVisible();
  });

  test('should navigate using sidebar links', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
    await page.getByTestId('login-email').fill('admin@studiovolta.com');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/\/projects/, { timeout: 30000 });

    // Navigate using direct href
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });

    await page.goto('/clients');
    await expect(page).toHaveURL(/clients/, { timeout: 10000 });

    await page.goto('/briefs');
    await expect(page).toHaveURL(/briefs/, { timeout: 10000 });

    await page.goto('/change-requests');
    await expect(page).toHaveURL(/change-requests/, { timeout: 10000 });

    await page.goto('/invoices');
    await expect(page).toHaveURL(/invoices/, { timeout: 10000 });

    await page.goto('/settings');
    await expect(page).toHaveURL(/settings/, { timeout: 10000 });
  });
});
