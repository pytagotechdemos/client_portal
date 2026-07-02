import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Client Portal Flow', () => {
  let portalToken: string;
  let testProjectId: string;
  const testClientId = `test-portal-client-${Date.now()}`;

  test.beforeAll(async () => {
    // Clean up any existing test data
    await prisma.comment.deleteMany({ where: { project: { client: { contactEmail: { startsWith: 'portal-test' } } } } }).catch(() => {});
    await prisma.deliverable.deleteMany({ where: { project: { client: { contactEmail: { startsWith: 'portal-test' } } } } }).catch(() => {});
    await prisma.project.deleteMany({ where: { client: { contactEmail: { startsWith: 'portal-test' } } } }).catch(() => {});
    await prisma.agencyClient.deleteMany({ where: { contactEmail: { startsWith: 'portal-test' } } }).catch(() => {});

    // Create fresh test data
    const client = await prisma.agencyClient.create({
      data: {
        name: 'Portal Test Client',
        contactName: 'Portal Tester',
        contactEmail: `portal-test-${Date.now()}@test.com`,
      },
    });

    const project = await prisma.project.create({
      data: {
        name: 'Client Portal Test Project',
        description: 'Testing client portal flow',
        clientId: client.id,
        startDate: new Date(),
      },
    });

    // Create a deliverable for testing
    await prisma.deliverable.create({
      data: {
        projectId: project.id,
        name: 'Client Test Deliverable',
        type: 'DESIGN',
        status: 'REVIEW',
        currentVersion: 1,
      },
    });

    await prisma.deliverable.create({
      data: {
        projectId: project.id,
        name: 'Approved Test Deliverable',
        type: 'DOCUMENT',
        status: 'APPROVED',
        currentVersion: 1,
      },
    });

    // Create version for REVIEW deliverable
    const reviewDel = await prisma.deliverable.findFirst({
      where: { projectId: project.id, status: 'REVIEW' }
    });
    if (reviewDel) {
      await prisma.deliverableVersion.create({
        data: {
          deliverableId: reviewDel.id,
          version: 1,
          fileUrl: 'https://example.com/test-file.png',
          uploadedBy: 'Admin',
        },
      });
    }

    testProjectId = project.id;
    portalToken = project.portalToken;
  });

  test.afterAll(async () => {
    // Cleanup
    await prisma.comment.deleteMany({ where: { project: { id: testProjectId } } }).catch(() => {});
    await prisma.deliverable.deleteMany({ where: { projectId: testProjectId } }).catch(() => {});
    await prisma.project.delete({ where: { id: testProjectId } }).catch(() => {});
    await prisma.agencyClient.deleteMany({ where: { id: testClientId } }).catch(() => {});
    await prisma.$disconnect();
  });

  test('should view project details and deliverables', async ({ page }) => {
    await page.goto(`/portal/${portalToken}`);

    // Check if project name is visible
    await expect(page.getByText('Client Portal Test Project')).toBeVisible({ timeout: 15000 });

    // Check if deliverable is visible
    await expect(page.getByText('Client Test Deliverable')).toBeVisible({ timeout: 15000 });
  });

  test('should show Awaiting Your Review section', async ({ page }) => {
    await page.goto(`/portal/${portalToken}`);

    // Check for REVIEW section
    await expect(page.getByText('Awaiting Your Review')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Client Test Deliverable')).toBeVisible();
  });

  test('should navigate to deliverable review page', async ({ page }) => {
    await page.goto(`/portal/${portalToken}`);

    // Click Review Now
    await page.getByRole('link', { name: 'Review Now' }).first().click();

    // Verify we are on the deliverable review page
    await expect(page.getByText('Client Test Deliverable')).toBeVisible({ timeout: 15000 });
  });

  test('should show review action buttons', async ({ page }) => {
    const reviewDel = await prisma.deliverable.findFirst({
      where: { projectId: testProjectId, status: 'REVIEW' }
    });
    if (!reviewDel) return;

    await page.goto(`/portal/${portalToken}/deliverable/${reviewDel.id}`);

    // Check for review buttons
    await expect(page.getByTestId('approve-deliverable-button')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Approve (with minor tweaks)')).toBeVisible();
    await expect(page.getByText('Submit Revision Request')).toBeVisible();
  });

  test('should show tabs on portal page', async ({ page }) => {
    await page.goto(`/portal/${portalToken}`);

    await expect(page.getByRole('link', { name: 'Deliverables' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Briefs & Assets' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Change Requests' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Invoices' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Discussion' })).toBeVisible();
  });
});
