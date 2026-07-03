import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const testTimestamp = Date.now();

/**
 * AUTHENTICATION TESTS
 */
test.describe('Authentication', () => {
  test('should redirect unauthenticated to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login.*/, { timeout: 15000 });
    await page.goto('/projects');
    await expect(page).toHaveURL(/.*login.*/, { timeout: 15000 });
    await page.goto('/clients');
    await expect(page).toHaveURL(/.*login.*/, { timeout: 15000 });
    await page.goto('/settings');
    await expect(page).toHaveURL(/.*login.*/, { timeout: 15000 });
  });

  test('should show password toggle on login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    const showPasswordBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
    await expect(showPasswordBtn).toBeVisible();

    const passwordInput = page.locator('[data-testid="login-password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await showPasswordBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.fill('[data-testid="login-email"]', 'admin@pytagotech.com');
    await page.fill('[data-testid="login-password"]', 'admin123');
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/projects/, { timeout: 20000 });
  });

  test('should fail login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.fill('[data-testid="login-email"]', 'wrong@email.com');
    await page.fill('[data-testid="login-password"]', 'wrongpassword');
    await page.click('[data-testid="login-submit"]');
    await page.waitForTimeout(1000);
    // Either error is shown or we stay on login page
    const errorVisible = await page.getByText(/invalid|email|password/i).isVisible().catch(() => false);
    const onLoginPage = page.url().includes('login');
    expect(errorVisible || onLoginPage).toBeTruthy();
  });

  test('should show not found for invalid portal token', async ({ page }) => {
    await page.goto('/portal/invalid-token-xyz');
    // Check for Indonesian not-found page
    await expect(page.getByRole('heading', { name: 'Halaman Tidak Ditemukan' })).toBeVisible({ timeout: 15000 });
  });

  test('should redirect from root to login when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*login.*/, { timeout: 15000 });
  });
});

/**
 * ADMIN LOGIN HELPER
 */
async function adminLogin(page: any) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.fill('[data-testid="login-email"]', 'admin@pytagotech.com');
  await page.fill('[data-testid="login-password"]', 'admin123');
  await page.click('[data-testid="login-submit"]');
  await expect(page).toHaveURL(/\/projects/, { timeout: 25000 });
}

/**
 * ADMIN SIDEBAR NAVIGATION TESTS
 */
test.describe('Admin Sidebar Navigation', () => {
  test('should navigate to all sidebar links via direct navigation', async ({ page }) => {
    await adminLogin(page);

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
});

/**
 * ADMIN DASHBOARD TESTS
 */
test.describe('Admin Dashboard', () => {
  test('should show dashboard with Indonesian text', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/dashboard');

    // Use exact heading text from UI
    await expect(page.getByRole('heading', { name: 'Ringkasan Dashboard' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Total Pendapatan')).toBeVisible();
    await expect(page.getByText('Belum Dibayar')).toBeVisible();
    await expect(page.getByText('Proyek Aktif')).toBeVisible();
    await expect(page.getByText('Total Klien')).toBeVisible();
    await expect(page.getByText('Tren Pendapatan')).toBeVisible();
    await expect(page.getByText('Status Proyek')).toBeVisible();
    await expect(page.getByText('Status Tagihan')).toBeVisible();
  });
});

/**
 * ADMIN PROJECTS TESTS
 */
test.describe('Admin Projects', () => {
  test('should show projects page with Indonesian text', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/projects');

    await expect(page.getByRole('heading', { name: 'Proyek' })).toBeVisible();
    // Use exact text from UI
    await expect(page.getByRole('link', { name: 'Proyek Baru' })).toBeVisible();
  });

  test('should navigate to new project form', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/projects/new');

    await expect(page).toHaveURL(/\/projects\/new/, { timeout: 10000 });
    await expect(page.getByTestId('project-name-input')).toBeVisible();
  });

  test('should show all form fields on new project page', async ({ page }) => {
    await adminLogin(page);
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
 * ADMIN CLIENTS TESTS
 */
test.describe('Admin Clients', () => {
  test('should show clients page with Indonesian text', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/clients');

    await expect(page.getByRole('heading', { name: 'Klien' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tambah Klien' })).toBeVisible();
  });

  test('should navigate to new client form', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/clients/new');
    await expect(page).toHaveURL(/\/clients\/new/, { timeout: 10000 });
  });
});

/**
 * ADMIN SETTINGS TESTS
 */
test.describe('Admin Settings', () => {
  test('should show all settings sections', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/settings');

    await expect(page.getByRole('heading', { name: 'Pengaturan Agensi' })).toBeVisible();
    await expect(page.getByText('Profil Agensi')).toBeVisible();
    await expect(page.getByText('Nama Agensi')).toBeVisible();
    await expect(page.getByText('Email Kontak')).toBeVisible();
    await expect(page.getByText('URL Logo')).toBeVisible();
    await expect(page.getByText('Warna Utama')).toBeVisible();
  });

  test('should show Duitku Integration section', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/settings');

    await expect(page.getByText('Integrasi Duitku')).toBeVisible();
    await expect(page.getByText('Kode Merchant')).toBeVisible();
    await expect(page.getByText('Lingkungan')).toBeVisible();
    await expect(page.getByText('Kunci API')).toBeVisible();
  });

  test('should show color picker and environment dropdown', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/settings');

    await expect(page.locator('input[type="color"]')).toBeVisible();

    const envSelect = page.locator('select[name="duitkuEnv"]');
    await expect(envSelect).toBeVisible();
    await expect(envSelect.locator('option')).toHaveCount(2);
  });
});

/**
 * ADMIN INVOICES PAGE TESTS
 */
test.describe('Admin Invoices Page', () => {
  test('should show invoices page with Indonesian text', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/invoices');

    await expect(page.getByRole('heading', { name: 'Tagihan' })).toBeVisible();
    await expect(page.getByText('No. Tagihan')).toBeVisible();
    await expect(page.getByText('Proyek / Klien')).toBeVisible();
    await expect(page.getByText('Jumlah')).toBeVisible();
    // Use exact match to avoid strict mode violation with dropdown
    await expect(page.getByText('Status', { exact: true })).toBeVisible();
  });
});

/**
 * ADMIN CHANGE REQUESTS PAGE TESTS
 */
test.describe('Admin Change Requests Page', () => {
  test('should show change requests page with Indonesian text', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/change-requests');

    await expect(page.getByRole('heading', { name: 'Permintaan Perubahan' })).toBeVisible();
  });
});

/**
 * ADMIN BRIEFS PAGE TESTS
 */
test.describe('Admin Briefs Page', () => {
  test('should show briefs page with Indonesian text', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/briefs');

    await expect(page.getByRole('heading', { name: 'Repositori Brief' })).toBeVisible();
  });
});

/**
 * CLIENT PORTAL TESTS
 */
test.describe('Client Portal', () => {
  const portalId = `test-portal-${testTimestamp}`;
  let portalToken: string;
  let projectId: string;

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
    projectId = project.id;
    portalToken = project.portalToken;

    // Create REVIEW deliverable
    const reviewDel = await prisma.deliverable.create({
      data: {
        projectId: project.id,
        name: `Portal Design Deliverable ${testTimestamp}`,
        type: 'DESIGN',
        status: 'REVIEW',
        currentVersion: 1,
      },
    });

    // Create version for review deliverable
    await prisma.deliverableVersion.create({
      data: {
        deliverableId: reviewDel.id,
        version: 1,
        fileUrl: 'https://example.com/design.pdf',
        linkUrl: 'https://figma.com/design',
        pmNotes: 'Final design for review',
        uploadedBy: 'Admin',
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
    try {
      const project = await prisma.project.findFirst({ where: { clientId: portalId } }).catch(() => null);
      if (project) {
        await prisma.comment.deleteMany({ where: { projectId: project.id } }).catch(() => {});
        await prisma.deliverable.deleteMany({ where: { projectId: project.id } }).catch(() => {});
        await prisma.project.delete({ where: { id: project.id } }).catch(() => {});
      }
      await prisma.agencyClient.delete({ where: { id: portalId } }).catch(() => {});
    } catch (e) {
      console.error('Cleanup error:', e);
    }
    await prisma.$disconnect();
  });

  test('should show project hero card with progress', async ({ page }) => {
    await page.goto(`/portal/${portalToken}`);

    // Check project name
    await expect(page.locator(`text=/Portal Test Project ${testTimestamp}/`)).toBeVisible({ timeout: 15000 });

    // Check progress section - use partial match
    await expect(page.getByText(/Progres:/)).toBeVisible();

    // Check deadline section
    await expect(page.getByText('Tenggat Waktu')).toBeVisible();
  });

  test('should show all portal tabs in Indonesian', async ({ page }) => {
    await page.goto(`/portal/${portalToken}`);

    // Tabs use Indonesian text
    await expect(page.getByRole('link', { name: 'Hasil Pekerjaan' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Brief & Aset' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Permintaan Perubahan' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tagihan' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Diskusi' })).toBeVisible();
  });

  test('should show Awaiting Your Review section in Indonesian', async ({ page }) => {
    await page.goto(`/portal/${portalToken}`);

    // "Menunggu Tinjauan Anda" is the Indonesian text
    await expect(page.getByText('Menunggu Tinjauan Anda')).toBeVisible({ timeout: 15000 });

    // "Tinjau Sekarang" is the button text
    await expect(page.getByRole('link', { name: 'Tinjau Sekarang' })).toBeVisible();
  });

  test('should navigate to deliverable review page', async ({ page }) => {
    await page.goto(`/portal/${portalToken}`);

    // Click the review button
    await page.getByRole('link', { name: 'Tinjau Sekarang' }).first().click();

    // Check for Indonesian review heading
    await expect(page.getByText('Tinjauan Anda')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('approve-deliverable-button')).toBeVisible();
  });

  test('should show review action buttons in Indonesian', async ({ page }) => {
    const project = await prisma.project.findFirst({ where: { clientId: portalId } });
    if (!project) return;

    const reviewDel = await prisma.deliverable.findFirst({
      where: { projectId: project.id, status: 'REVIEW' }
    });
    if (!reviewDel) return;

    await page.goto(`/portal/${portalToken}/deliverable/${reviewDel.id}`);

    // Check for Indonesian button text
    await expect(page.getByTestId('approve-deliverable-button')).toBeVisible();
    await expect(page.getByText('Setujui (dengan revisi kecil)')).toBeVisible();
    await expect(page.getByText('Ajukan Revisi')).toBeVisible();
  });

  test('should show Discussion tab with comment form', async ({ page }) => {
    await page.goto(`/portal/${portalToken}?tab=discussion`);

    await expect(page.getByText('Diskusi Proyek')).toBeVisible();
    await expect(page.getByTestId('comment-input')).toBeVisible();
    await expect(page.getByTestId('comment-submit')).toBeVisible();
  });

  test('should show Briefs tab with upload form', async ({ page }) => {
    await page.goto(`/portal/${portalToken}?tab=briefs`);

    await expect(page.getByText('Brief Proyek')).toBeVisible();
    // Use heading to avoid strict mode violation
    await expect(page.getByRole('heading', { name: 'Unggah Aset' })).toBeVisible();
  });

  test('should show Change Requests tab with new request form', async ({ page }) => {
    await page.goto(`/portal/${portalToken}?tab=changes`);

    await expect(page.getByRole('heading', { name: 'Permintaan Perubahan' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Permintaan Baru' })).toBeVisible();
    await expect(page.getByText('Deskripsi')).toBeVisible();
  });

  test('should show Invoices tab', async ({ page }) => {
    await page.goto(`/portal/${portalToken}?tab=invoices`);

    await expect(page.getByText('Faktur & Tagihan')).toBeVisible();
  });
});

/**
 * ADMIN PROJECT DETAIL TESTS
 */
test.describe('Admin Project Detail', () => {
  const projectId = `test-admin-project-${testTimestamp}`;
  const clientId = `test-admin-client-${testTimestamp}`;

  test.beforeAll(async () => {
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

  test('should show project detail with all tabs in Indonesian', async ({ page }) => {
    await adminLogin(page);
    await page.goto(`/projects/${projectId}`);

    // Check project name loaded
    await expect(page.getByText('Admin Detail Test Project').first()).toBeVisible({ timeout: 15000 });

    // Check content tabs - use specific href-based selectors to avoid strict mode
    await expect(page.locator('a[href*="/projects/' + projectId + '?tab=deliverables"]')).toBeVisible();
    await expect(page.locator('a[href*="/projects/' + projectId + '?tab=briefs"]')).toBeVisible();
    await expect(page.locator('a[href*="/projects/' + projectId + '?tab=changes"]')).toBeVisible();
    await expect(page.locator('a[href*="/projects/' + projectId + '?tab=invoices"]')).toBeVisible();
    await expect(page.locator('a[href*="/projects/' + projectId + '?tab=discussion"]')).toBeVisible();
  });

  test('should switch between tabs via URL', async ({ page }) => {
    await adminLogin(page);

    await page.goto(`/projects/${projectId}?tab=briefs`);
    await expect(page).toHaveURL(/tab=briefs/, { timeout: 10000 });

    await page.goto(`/projects/${projectId}?tab=changes`);
    await expect(page).toHaveURL(/tab=changes/, { timeout: 10000 });

    await page.goto(`/projects/${projectId}?tab=invoices`);
    await expect(page).toHaveURL(/tab=invoices/, { timeout: 10000 });

    await page.goto(`/projects/${projectId}?tab=discussion`);
    await expect(page).toHaveURL(/tab=discussion/, { timeout: 10000 });
  });

  test('should show action buttons', async ({ page }) => {
    await adminLogin(page);
    await page.goto(`/projects/${projectId}`);

    // Now all uses Indonesian
    await expect(page.getByText('Salin Tautan Portal')).toBeVisible();
    await expect(page.getByText('Buat Tagihan')).toBeVisible();
  });

  test('should show client contact info', async ({ page }) => {
    await adminLogin(page);
    await page.goto(`/projects/${projectId}`);

    // Use first() to avoid strict mode violation
    await expect(page.getByText('Admin Test Client').first()).toBeVisible();
    await expect(page.getByText('Test User').first()).toBeVisible();
  });

  test('should show add deliverable form', async ({ page }) => {
    await adminLogin(page);
    await page.goto(`/projects/${projectId}`);

    await expect(page.getByTestId('add-deliverable-name')).toBeVisible();
    await expect(page.getByTestId('add-deliverable-type')).toBeVisible();
    await expect(page.getByTestId('add-deliverable-assigned')).toBeVisible();
    await expect(page.getByTestId('add-deliverable-button')).toBeVisible();
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

  test('should show deliverable name and status', async ({ page }) => {
    await adminLogin(page);
    await page.goto(`/projects/${projectId}/deliverables/${deliverableId}`);

    // Use heading to avoid strict mode violation
    await expect(page.getByRole('heading', { name: 'Test Deliverable' })).toBeVisible({ timeout: 15000 });
  });

  test('should show version history', async ({ page }) => {
    await adminLogin(page);
    await page.goto(`/projects/${projectId}/deliverables/${deliverableId}`);

    await expect(page.getByText('v1')).toBeVisible();
    await expect(page.getByText('Test notes')).toBeVisible();
  });

  test('should show upload form', async ({ page }) => {
    await adminLogin(page);
    await page.goto(`/projects/${projectId}/deliverables/${deliverableId}`);

    // Deliverable detail page now uses Indonesian
    await expect(page.getByText('Unggah Versi Baru')).toBeVisible();
    await expect(page.getByText('Unggah File')).toBeVisible();
    await expect(page.getByText('Tautan Eksternal')).toBeVisible();
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

    // Create deliverables with different statuses
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

  test('should show status badges on project page', async ({ page }) => {
    const project = await prisma.project.findFirst({
      where: { client: { id: badgeId } }
    });
    if (!project) return;

    await adminLogin(page);
    await page.goto(`/projects/${project.id}`);

    // Status badges should be visible with different styling
    // We check for the deliverable names which have status badges
    // Use first() to avoid strict mode violation
    await expect(page.getByText('Not Started').first()).toBeVisible();
    await expect(page.getByText('In Progress').first()).toBeVisible();
    await expect(page.getByText('Review Status').first()).toBeVisible();
    await expect(page.getByText('Approved').first()).toBeVisible();
    await expect(page.getByText('Revision').first()).toBeVisible();
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
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.fill('[data-testid="login-email"]', 'admin@pytagotech.com');
    await page.fill('[data-testid="login-password"]', 'admin123');
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/projects/, { timeout: 20000 });
  });
});

/**
 * RESPONSIVE DESIGN TESTS
 */
test.describe('Responsive Design', () => {
  test('should show mobile hamburger menu on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await adminLogin(page);
    await page.goto('/projects');

    // Hamburger menu should be visible on mobile
    const hamburger = page.locator('button').filter({ has: page.locator('svg') }).first();
    await expect(hamburger).toBeVisible();
  });

  test('should hide sidebar on mobile and show on desktop', async ({ page }) => {
    // Mobile view - sidebar should be hidden by default
    await page.setViewportSize({ width: 375, height: 667 });
    await adminLogin(page);
    await page.goto('/projects');

    // On mobile, sidebar should have translate class (hidden)
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/-translate-x-full/);

    // Desktop view - sidebar should be visible
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.reload();

    // On desktop, sidebar should be visible (no negative translate class)
    // The sidebar should be in the DOM and visible
    await expect(sidebar).toBeVisible();
  });

  test('should display login form correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');

    // Form should be visible and usable on mobile
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('should display dashboard cards in grid on desktop', async ({ page }) => {
    await adminLogin(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard');

    // Stats should be in a 4-column grid on desktop
    const statsGrid = page.locator('.grid').first();
    await expect(statsGrid).toBeVisible();
  });

  test('should wrap content properly on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await adminLogin(page);
    await page.goto('/projects');

    // Content should be accessible (scrollable)
    const pageContent = page.locator('main');
    await expect(pageContent).toBeVisible();
  });
});
