import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Use timestamp-based IDs to avoid conflicts in parallel tests
const testTimestamp = Date.now();

/**
 * AUTHENTICATION TESTS
 */
test.describe('Authentication', () => {
  test('should redirect unauthenticated to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login.*/, { timeout: 10000 });
    await page.goto('/projects');
    await expect(page).toHaveURL(/.*login.*/, { timeout: 10000 });
    await page.goto('/clients');
    await expect(page).toHaveURL(/.*login.*/, { timeout: 10000 });
    await page.goto('/settings');
    await expect(page).toHaveURL(/.*login.*/, { timeout: 10000 });
  });

  test('should show password toggle on login', async ({ page }) => {
    await page.goto('/login');
    const showPasswordBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
    await expect(showPasswordBtn).toBeVisible();
    const passwordInput = page.locator('[data-testid="login-password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await showPasswordBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.fill('[data-testid="login-email"]', 'admin@studiovolta.com');
    await page.fill('[data-testid="login-password"]', 'admin123');
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/projects/, { timeout: 15000 });
  });

  test('should fail login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.fill('[data-testid="login-email"]', 'wrong@email.com');
    await page.fill('[data-testid="login-password"]', 'wrongpassword');
    await page.click('[data-testid="login-submit"]');
    await expect(page.getByText('Invalid email or password')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/.*login.*/, { timeout: 10000 });
  });

  test('should show not found for invalid portal token', async ({ page }) => {
    await page.goto('/portal/invalid-token-xyz');
    await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible({ timeout: 10000 });
  });
});

/**
 * ADMIN SIDEBAR NAVIGATION TESTS
 */
test.describe('Admin Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.fill('[data-testid="login-email"]', 'admin@studiovolta.com');
    await page.fill('[data-testid="login-password"]', 'admin123');
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/projects/, { timeout: 15000 });
  });

  test('should navigate to all sidebar links via direct navigation', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
    await page.goto('/projects');
    await expect(page).toHaveURL(/projects/, { timeout: 10000 });
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

  test('should show active nav item styling', async ({ page }) => {
    await page.goto('/projects');
    const projectsNav = page.locator('aside nav a[href="/projects"]');
    await expect(projectsNav).toBeVisible();
    await expect(projectsNav).toHaveClass(/bg-surface-hover/);
  });
});

/**
 * ADMIN PROJECTS TESTS
 */
test.describe('Admin Projects', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.fill('[data-testid="login-email"]', 'admin@studiovolta.com');
    await page.fill('[data-testid="login-password"]', 'admin123');
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/projects/, { timeout: 15000 });
  });

  test('should show New Project button', async ({ page }) => {
    await expect(page.getByText('+ New Project')).toBeVisible();
  });

  test('should navigate to new project form', async ({ page }) => {
    await page.goto('/projects/new');
    await expect(page).toHaveURL(/\/projects\/new/, { timeout: 10000 });
    await expect(page.getByTestId('project-name-input')).toBeVisible();
    await expect(page.getByTestId('project-submit')).toBeVisible();
  });

  test('should show all form fields on new project page', async ({ page }) => {
    await page.goto('/projects/new');
    await expect(page.getByTestId('project-name-input')).toBeVisible();
    await expect(page.getByTestId('project-desc-input')).toBeVisible();
    await expect(page.getByTestId('project-start-input')).toBeVisible();
    await expect(page.getByTestId('project-end-input')).toBeVisible();
    await expect(page.getByTestId('project-client-name')).toBeVisible();
    await expect(page.getByTestId('project-contact-name')).toBeVisible();
    await expect(page.getByTestId('project-contact-email')).toBeVisible();
    await expect(page.getByTestId('project-client-password')).toBeVisible();
  });
});

/**
 * ADMIN PROJECT DETAIL TESTS
 */
test.describe('Admin Project Detail', () => {
  const projectId = `test-admin-project-${testTimestamp}`;
  const clientId = `test-admin-client-${testTimestamp}`;

  test.beforeAll(async () => {
    // Create test data
    const client = await prisma.agencyClient.create({
      data: {
        id: clientId,
        name: 'Admin Test Client',
        contactName: 'Test User',
        contactEmail: `admin-test-${testTimestamp}@test.com`,
      },
    });

    await prisma.project.create({
      data: {
        id: projectId,
        name: 'Admin Detail Test Project',
        description: 'Testing project detail page',
        clientId: client.id,
        startDate: new Date(),
      },
    });
  });

  test.afterAll(async () => {
    await prisma.project.deleteMany({ where: { id: { startsWith: 'test-admin-project' } } }).catch(() => {});
    await prisma.agencyClient.deleteMany({ where: { id: { startsWith: 'test-admin-client' } } }).catch(() => {});
    await prisma.$disconnect();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.fill('[data-testid="login-email"]', 'admin@studiovolta.com');
    await page.fill('[data-testid="login-password"]', 'admin123');
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/projects/, { timeout: 15000 });
    await page.goto(`/projects/${projectId}`);
    await expect(page.getByText('Admin Detail Test Project')).toBeVisible({ timeout: 10000 });
  });

  test('should show all tabs', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Deliverables' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Briefs' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Change Requests' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Invoices' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Discussion' })).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    await page.goto(`/projects/${projectId}?tab=briefs`);
    await expect(page).toHaveURL(/tab=briefs/, { timeout: 10000 });

    await page.goto(`/projects/${projectId}?tab=changes`);
    await expect(page).toHaveURL(/tab=changes/, { timeout: 10000 });

    await page.goto(`/projects/${projectId}?tab=invoices`);
    await expect(page).toHaveURL(/tab=invoices/, { timeout: 10000 });

    await page.goto(`/projects/${projectId}?tab=discussion`);
    await expect(page).toHaveURL(/tab=discussion/, { timeout: 10000 });

    await page.goto(`/projects/${projectId}?tab=deliverables`);
    await expect(page).toHaveURL(/tab=deliverables/, { timeout: 10000 });
  });

  test('should add deliverable', async ({ page }) => {
    await page.fill('[data-testid="add-deliverable-name"]', `New Deliverable ${Date.now()}`);
    await page.selectOption('[data-testid="add-deliverable-type"]', 'DESIGN');
    await page.click('[data-testid="add-deliverable-button"]');
    await expect(page.locator('text=/New Deliverable/')).toBeVisible({ timeout: 10000 });
  });

  test('should show action buttons', async ({ page }) => {
    await expect(page.getByText('Copy Portal Link')).toBeVisible();
    await expect(page.getByText('Generate Invoice')).toBeVisible();
  });

  test('should show client contact info', async ({ page }) => {
    await expect(page.getByText('Admin Test Client')).toBeVisible();
    await expect(page.getByText('Test User')).toBeVisible();
  });
});

/**
 * ADMIN DELIVERABLE DETAIL TESTS
 */
test.describe('Admin Deliverable Detail', () => {
  const deliverableId = `test-deliverable-${testTimestamp}`;
  const projectId = `test-del-project-${testTimestamp}`;
  const clientId = `test-del-client-${testTimestamp}`;

  test.beforeAll(async () => {
    const client = await prisma.agencyClient.create({
      data: {
        id: clientId,
        name: 'Deliverable Test Client',
        contactName: 'Test User',
        contactEmail: `deliverable-test-${testTimestamp}@test.com`,
      },
    });

    const project = await prisma.project.create({
      data: {
        id: projectId,
        name: 'Deliverable Detail Test Project',
        clientId: client.id,
        startDate: new Date(),
      },
    });

    const deliverable = await prisma.deliverable.create({
      data: {
        id: deliverableId,
        projectId: project.id,
        name: 'Test Deliverable',
        type: 'DESIGN',
        status: 'REVIEW',
        currentVersion: 1,
      },
    });

    await prisma.deliverableVersion.create({
      data: {
        deliverableId: deliverable.id,
        version: 1,
        fileUrl: 'https://example.com/test.pdf',
        pmNotes: 'Test notes',
        uploadedBy: 'Admin',
      },
    });
  });

  test.afterAll(async () => {
    await prisma.deliverable.deleteMany({ where: { id: { startsWith: 'test-deliverable' } } }).catch(() => {});
    await prisma.project.deleteMany({ where: { id: { startsWith: 'test-del-project' } } }).catch(() => {});
    await prisma.agencyClient.deleteMany({ where: { id: { startsWith: 'test-del-client' } } }).catch(() => {});
    await prisma.$disconnect();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.fill('[data-testid="login-email"]', 'admin@studiovolta.com');
    await page.fill('[data-testid="login-password"]', 'admin123');
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/projects/, { timeout: 15000 });
    await page.goto(`/projects/${projectId}/deliverables/${deliverableId}`);
    await expect(page.getByText('Test Deliverable')).toBeVisible({ timeout: 10000 });
  });

  test('should show deliverable name and status', async ({ page }) => {
    await expect(page.getByText('Test Deliverable')).toBeVisible();
    await expect(page.locator('text=/REVIEW/i')).toBeVisible();
  });

  test('should show version history', async ({ page }) => {
    await expect(page.getByText('Version 1')).toBeVisible();
    await expect(page.getByText('Test notes')).toBeVisible();
  });

  test('should show upload form', async ({ page }) => {
    await expect(page.getByText('Upload New Version')).toBeVisible();
    await expect(page.getByText('File Upload')).toBeVisible();
    await expect(page.getByText('External Link')).toBeVisible();
    await expect(page.getByText('Notes for Client')).toBeVisible();
  });
});

/**
 * ADMIN CLIENTS TESTS
 */
test.describe('Admin Clients', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.fill('[data-testid="login-email"]', 'admin@studiovolta.com');
    await page.fill('[data-testid="login-password"]', 'admin123');
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/projects/, { timeout: 15000 });
    await page.goto('/clients');
  });

  test('should show Add New Client button', async ({ page }) => {
    await expect(page.getByText('Add New Client')).toBeVisible();
  });

  test('should navigate to new client form', async ({ page }) => {
    await page.goto('/clients/new');
    await expect(page).toHaveURL(/\/clients\/new/, { timeout: 10000 });
  });
});

/**
 * ADMIN SETTINGS TESTS
 */
test.describe('Admin Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.fill('[data-testid="login-email"]', 'admin@studiovolta.com');
    await page.fill('[data-testid="login-password"]', 'admin123');
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/projects/, { timeout: 15000 });
    await page.goto('/settings');
  });

  test('should show all settings sections', async ({ page }) => {
    await expect(page.getByText('Agency Profile')).toBeVisible();
    await expect(page.getByText('Agency Name')).toBeVisible();
    await expect(page.getByText('Contact Email')).toBeVisible();
    await expect(page.getByText('Logo URL')).toBeVisible();
    await expect(page.getByText('Primary Color')).toBeVisible();
  });

  test('should show Duitku Integration section', async ({ page }) => {
    await expect(page.getByText('Duitku Integration')).toBeVisible();
    await expect(page.getByText('Merchant Code')).toBeVisible();
    await expect(page.getByText('Environment')).toBeVisible();
    await expect(page.getByText('API Key')).toBeVisible();
  });

  test('should show color picker', async ({ page }) => {
    await expect(page.locator('input[type="color"]')).toBeVisible();
  });

  test('should have environment dropdown', async ({ page }) => {
    const envSelect = page.locator('select[name="duitkuEnv"]');
    await expect(envSelect).toBeVisible();
    await expect(envSelect.locator('option')).toHaveCount(2);
  });
});

/**
 * ADMIN INVOICES PAGE TESTS
 */
test.describe('Admin Invoices Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.fill('[data-testid="login-email"]', 'admin@studiovolta.com');
    await page.fill('[data-testid="login-password"]', 'admin123');
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/projects/, { timeout: 15000 });
    await page.goto('/invoices');
  });

  test('should show invoices page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Invoices' })).toBeVisible();
  });

  test('should show table headers', async ({ page }) => {
    await expect(page.getByText('Invoice #')).toBeVisible();
    await expect(page.getByText('Project / Client')).toBeVisible();
    await expect(page.getByText('Amount')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();
  });
});

/**
 * ADMIN CHANGE REQUESTS PAGE TESTS
 */
test.describe('Admin Change Requests Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.fill('[data-testid="login-email"]', 'admin@studiovolta.com');
    await page.fill('[data-testid="login-password"]', 'admin123');
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/projects/, { timeout: 15000 });
    await page.goto('/change-requests');
  });

  test('should show change requests page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Change Requests' })).toBeVisible();
  });
});

/**
 * ADMIN BRIEFS PAGE TESTS
 */
test.describe('Admin Briefs Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.fill('[data-testid="login-email"]', 'admin@studiovolta.com');
    await page.fill('[data-testid="login-password"]', 'admin123');
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/projects/, { timeout: 15000 });
    await page.goto('/briefs');
  });

  test('should show briefs page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Brief Repository' })).toBeVisible();
  });
});

/**
 * ADMIN DASHBOARD TESTS
 */
test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.fill('[data-testid="login-email"]', 'admin@studiovolta.com');
    await page.fill('[data-testid="login-password"]', 'admin123');
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/projects/, { timeout: 15000 });
    await page.goto('/dashboard');
  });

  test('should show dashboard overview', async ({ page }) => {
    await expect(page.getByText('Dashboard Overview')).toBeVisible();
  });

  test('should show stat cards', async ({ page }) => {
    await expect(page.getByText('Total Revenue')).toBeVisible();
    await expect(page.getByText('Outstanding Invoices')).toBeVisible();
    await expect(page.getByText('Active Projects')).toBeVisible();
    await expect(page.getByText('Total Clients')).toBeVisible();
  });

  test('should show charts', async ({ page }) => {
    await expect(page.getByText('Revenue Trend')).toBeVisible();
    await expect(page.getByText('Project Status')).toBeVisible();
    await expect(page.getByText('Invoice Status')).toBeVisible();
  });
});

/**
 * CLIENT PORTAL TESTS
 */
test.describe('Client Portal', () => {
  const portalId = `test-portal-${testTimestamp}`;
  let portalToken: string;

  test.beforeAll(async () => {
    const client = await prisma.agencyClient.create({
      data: {
        id: portalId,
        name: `Portal Test Client ${testTimestamp}`,
        contactName: 'Portal Tester',
        contactEmail: `portal-test-${testTimestamp}@test.com`,
      },
    });

    const project = await prisma.project.create({
      data: {
        name: `Portal Test Project ${testTimestamp}`,
        description: 'Testing client portal',
        clientId: client.id,
        startDate: new Date(),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    portalToken = project.portalToken;

    // Create REVIEW deliverable
    await prisma.deliverable.create({
      data: {
        projectId: project.id,
        name: `Portal Design Deliverable ${testTimestamp}`,
        type: 'DESIGN',
        status: 'REVIEW',
        currentVersion: 1,
        versions: {
          create: {
            version: 1,
            fileUrl: 'https://example.com/design.pdf',
            linkUrl: 'https://figma.com/design',
            pmNotes: 'Final design for review',
            uploadedBy: 'Admin',
          },
        },
      },
    });

    // Create APPROVED deliverable
    await prisma.deliverable.create({
      data: {
        projectId: project.id,
        name: `Portal Document Deliverable ${testTimestamp}`,
        type: 'DOCUMENT',
        status: 'APPROVED',
        currentVersion: 1,
      },
    });
  });

  test.afterAll(async () => {
    // Delete related data first
    const project = await prisma.project.findFirst({ where: { clientId: portalId } }).catch(() => null);
    if (project) {
      await prisma.comment.deleteMany({ where: { projectId: project.id } }).catch(() => {});
      await prisma.deliverable.deleteMany({ where: { projectId: project.id } }).catch(() => {});
      await prisma.project.delete({ where: { id: project.id } }).catch(() => {});
    }
    await prisma.agencyClient.delete({ where: { id: portalId } }).catch(() => {});
    await prisma.$disconnect();
  });

  test('should show project hero card', async ({ page }) => {
    await page.goto(`/portal/${portalToken}`);
    await expect(page.locator('text=/Portal Test Project/')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Progress:')).toBeVisible();
    await expect(page.getByText('Deadline:')).toBeVisible();
  });

  test('should show all tabs', async ({ page }) => {
    await page.goto(`/portal/${portalToken}`);
    await expect(page.getByRole('link', { name: 'Deliverables' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Briefs & Assets' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Change Requests' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Invoices' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Discussion' })).toBeVisible();
  });

  test('should show Awaiting Your Review section', async ({ page }) => {
    await page.goto(`/portal/${portalToken}`);
    await expect(page.getByText('Awaiting Your Review')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Review Now')).toBeVisible();
  });

  test('should navigate to deliverable review page', async ({ page }) => {
    await page.goto(`/portal/${portalToken}`);
    await page.getByRole('link', { name: 'Review Now' }).first().click();
    await expect(page.getByText('Your Review')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('approve-deliverable-button')).toBeVisible();
  });

  test('should show review action buttons', async ({ page }) => {
    const project = await prisma.project.findFirst({ where: { clientId: portalId } });
    if (!project) return;
    const reviewDel = await prisma.deliverable.findFirst({
      where: { projectId: project.id, status: 'REVIEW' }
    });
    if (!reviewDel) return;

    await page.goto(`/portal/${portalToken}/deliverable/${reviewDel.id}`);
    await expect(page.getByTestId('approve-deliverable-button')).toBeVisible();
    await expect(page.getByText('Approve (with minor tweaks)')).toBeVisible();
    await expect(page.getByText('Submit Revision Request')).toBeVisible();
  });
});

/**
 * STATUS BADGE TESTS
 */
test.describe('Status Badges', () => {
  const badgeId = `test-badge-${testTimestamp}`;

  test.beforeAll(async () => {
    const client = await prisma.agencyClient.create({
      data: {
        id: badgeId,
        name: `Badge Test Client ${testTimestamp}`,
        contactName: 'Test',
        contactEmail: `badge-test-${testTimestamp}@test.com`,
      },
    });

    const project = await prisma.project.create({
      data: {
        name: `Badge Test Project ${testTimestamp}`,
        clientId: client.id,
        startDate: new Date(),
      },
    });

    await prisma.deliverable.create({
      data: { projectId: project.id, name: 'Not Started', type: 'DOCUMENT', status: 'NOT_STARTED' },
    });
    await prisma.deliverable.create({
      data: { projectId: project.id, name: 'In Progress', type: 'DOCUMENT', status: 'IN_PROGRESS' },
    });
    await prisma.deliverable.create({
      data: { projectId: project.id, name: 'Review Status', type: 'DOCUMENT', status: 'REVIEW' },
    });
    await prisma.deliverable.create({
      data: { projectId: project.id, name: 'Approved', type: 'DOCUMENT', status: 'APPROVED' },
    });
    await prisma.deliverable.create({
      data: { projectId: project.id, name: 'Revision', type: 'DOCUMENT', status: 'REVISION_REQUESTED' },
    });
  });

  test.afterAll(async () => {
    const badgeProject = await prisma.project.findFirst({ where: { clientId: badgeId } }).catch(() => null);
    if (badgeProject) {
      await prisma.deliverable.deleteMany({ where: { projectId: badgeProject.id } }).catch(() => {});
      await prisma.project.delete({ where: { id: badgeProject.id } }).catch(() => {});
    }
    await prisma.agencyClient.delete({ where: { id: badgeId } }).catch(() => {});
  });

  test('should show correct status badges', async ({ page }) => {
    const project = await prisma.project.findFirst({
      where: { client: { id: badgeId } }
    });
    if (!project) return;

    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.fill('[data-testid="login-email"]', 'admin@studiovolta.com');
    await page.fill('[data-testid="login-password"]', 'admin123');
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/projects/, { timeout: 15000 });
    await page.goto(`/projects/${project.id}`);

    await expect(page.getByText('NOT_STARTED')).toBeVisible();
    await expect(page.getByText('IN_PROGRESS')).toBeVisible();
    await expect(page.getByText('REVIEW')).toBeVisible();
    await expect(page.getByText('APPROVED')).toBeVisible();
    await expect(page.getByText('REVISION_REQUESTED')).toBeVisible();
  });
});

/**
 * API TESTS
 */
test.describe('API Endpoints', () => {
  const apiId = `test-api-${testTimestamp}`;

  test.beforeAll(async () => {
    const client = await prisma.agencyClient.create({
      data: {
        id: apiId,
        name: `API Test Client ${testTimestamp}`,
        contactName: 'Test',
        contactEmail: `api-test-${testTimestamp}@test.com`,
      },
    });

    const project = await prisma.project.create({
      data: {
        name: `API Test Project ${testTimestamp}`,
        clientId: client.id,
        startDate: new Date(),
      },
    });

    await prisma.comment.create({
      data: {
        projectId: project.id,
        authorName: 'Test Author',
        authorRole: 'ADMIN',
        content: 'API test comment',
      },
    });
  });

  test.afterAll(async () => {
    const apiProject = await prisma.project.findFirst({ where: { clientId: apiId } }).catch(() => null);
    if (apiProject) {
      await prisma.comment.deleteMany({ where: { projectId: apiProject.id } }).catch(() => {});
      await prisma.project.delete({ where: { id: apiProject.id } }).catch(() => {});
    }
    await prisma.agencyClient.delete({ where: { id: apiId } }).catch(() => {});
  });

  test('should return comments for project', async ({ request }) => {
    const project = await prisma.project.findFirst({
      where: { client: { id: apiId } }
    });
    if (!project) return;

    const response = await request.get(`/api/comments?projectId=${project.id}`);
    expect(response.ok()).toBeTruthy();
    const comments = await response.json();
    expect(Array.isArray(comments)).toBeTruthy();
    expect(comments.length).toBeGreaterThan(0);
  });

  test('should require projectId for comments API', async ({ request }) => {
    const response = await request.get('/api/comments');
    expect(response.status()).toBe(400);
  });
});

/**
 * REDIRECTION TESTS
 */
test.describe('Redirection', () => {
  test('should redirect to projects after successful login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.fill('[data-testid="login-email"]', 'admin@studiovolta.com');
    await page.fill('[data-testid="login-password"]', 'admin123');
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/projects/, { timeout: 15000 });
  });

  test('should redirect from root to login when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*login.*/, { timeout: 10000 });
  });
});
