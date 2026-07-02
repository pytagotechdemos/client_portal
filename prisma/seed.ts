import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Deleting existing data...');

  // Delete in correct order (child → parent)
  await prisma.comment.deleteMany();
  await prisma.deliverableVersion.deleteMany();
  await prisma.deliverable.deleteMany();
  await prisma.brief.deleteMany();
  await prisma.changeRequest.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.projectAccess.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agencyClient.deleteMany();
  await prisma.agencySettings.deleteMany();

  console.log('✅ All data deleted');

  console.log('📝 Creating dummy data...');

  // 1. Agency Settings
  const settings = await prisma.agencySettings.create({
    data: {
      agencyName: 'Pytagotech',
      contactEmail: 'hello@pytagotech.com',
      primaryColor: '#7C3AED',
      duitkuMerchantCode: process.env.DUITKU_MERCHANT_CODE || 'DS32448',
      duitkuApiKey: process.env.DUITKU_API_KEY || 'demo-key',
      duitkuEnv: 'sandbox',
    },
  });
  console.log('   ✅ Agency Settings');

  // 2. Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Pytagotech',
      email: 'admin@pytagotech.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('   ✅ Admin User: admin@pytagotech.com / admin123');

  // 3. Clients & Projects
  const clientsData = [
    {
      name: 'Toko Elektronik Jaya',
      contactName: 'Budi Santoso',
      contactEmail: 'budi@elektronik Jaya.com',
      phone: '081234567890',
      companyName: 'PT Elektronik Jaya Indonesia',
    },
    {
      name: 'Kafe Minum Enak',
      contactName: 'Siti Nurhaliza',
      contactEmail: 'siti@minumenak.id',
      phone: '081234567891',
      companyName: 'Kafe Minum Enak',
    },
    {
      name: 'Butik Fashion House',
      contactName: 'Rina Wijaya',
      contactEmail: 'rina@fashionhouse.co.id',
      phone: '081234567892',
      companyName: 'Fashion House Indonesia',
    },
  ];

  const projectsData = [
    {
      name: 'Website E-commerce Toko Elektronik',
      description: 'Website e-commerce untuk penjualan produk elektronik',
      status: 'ACTIVE' as const,
      clientIndex: 0,
    },
    {
      name: 'Brand Identity Kafe Minum Enak',
      description: 'Logo, packaging, dan materi promosi',
      status: 'ACTIVE' as const,
      clientIndex: 1,
    },
    {
      name: 'Social Media Campaign',
      description: 'Instagram & TikTok content strategy',
      status: 'ON_HOLD' as const,
      clientIndex: 1,
    },
    {
      name: 'E-commerce Fashion House',
      description: 'Website dan mobile app untuk butik fashion',
      status: 'COMPLETED' as const,
      clientIndex: 2,
    },
    {
      name: 'Company Profile Video',
      description: 'Video company profile 3 menit',
      status: 'ACTIVE' as const,
      clientIndex: 2,
    },
  ];

  const deliverablesData = [
    // Project 1 deliverables
    { name: 'Logo Design', type: 'DESIGN', status: 'APPROVED', projectIndex: 0 },
    { name: 'Homepage Design', type: 'DESIGN', status: 'APPROVED', projectIndex: 0 },
    { name: 'Product Page Design', type: 'DESIGN', status: 'REVIEW', projectIndex: 0 },
    { name: 'Website Development', type: 'DOCUMENT', status: 'IN_PROGRESS', projectIndex: 0 },
    { name: 'Payment Integration', type: 'DOCUMENT', status: 'NOT_STARTED', projectIndex: 0 },
    // Project 2 deliverables
    { name: 'Logo Utama', type: 'DESIGN', status: 'APPROVED', projectIndex: 1 },
    { name: 'Logo Variasi', type: 'DESIGN', status: 'APPROVED', projectIndex: 1 },
    { name: 'Packaging Design', type: 'DESIGN', status: 'REVIEW', projectIndex: 1 },
    { name: 'Menu Design', type: 'DESIGN', status: 'NOT_STARTED', projectIndex: 1 },
    // Project 3 deliverables
    { name: 'Social Media Kit', type: 'DOCUMENT', status: 'REVISION_REQUESTED', projectIndex: 2 },
    // Project 4 deliverables
    { name: 'Website Design', type: 'DESIGN', status: 'APPROVED', projectIndex: 3 },
    { name: 'Website Development', type: 'DOCUMENT', status: 'APPROVED', projectIndex: 3 },
    { name: 'Mobile App UI', type: 'DESIGN', status: 'APPROVED', projectIndex: 3 },
    // Project 5 deliverables
    { name: 'Storyboard', type: 'DOCUMENT', status: 'APPROVED', projectIndex: 4 },
    { name: 'Video Production', type: 'VIDEO', status: 'IN_PROGRESS', projectIndex: 4 },
    { name: 'Voice Over', type: 'COPY', status: 'NOT_STARTED', projectIndex: 4 },
  ];

  const briefsData = [
    { title: 'Referensi E-commerce', category: 'Visual Brief', projectIndex: 0 },
    { title: 'Brand Guidelines Toko Elektronik', category: 'Brand Guideline', projectIndex: 0 },
    { title: 'Kafe Vibes & Moodboard', category: 'Visual Brief', projectIndex: 1 },
    { title: 'Contoh Packaging Minuman', category: 'Visual Reference', projectIndex: 1 },
    { title: 'Fashion Reference Photos', category: 'Visual Brief', projectIndex: 3 },
    { title: 'Video Reference', category: 'Other', projectIndex: 4 },
  ];

  const changeRequestsData = [
    {
      description: 'Tambahkan fitur chat dengan customer support di website',
      status: 'PENDING' as const,
      requestedBy: 'Budi Santoso',
      projectIndex: 0
    },
    {
      description: 'Tambahkan warna merah ke logo utama',
      status: 'ACCEPTED' as const,
      requestedBy: 'Siti Nurhaliza',
      responseNote: 'Baik, akan kami tambahkan di versi berikutnya',
      projectIndex: 1
    },
    {
      description: 'Tambahkan 5 posting per minggu bukan 3',
      status: 'REJECTED' as const,
      requestedBy: 'Siti Nurhaliza',
      responseNote: 'Budget tidak mencakup 5 posting per minggu',
      projectIndex: 2
    },
  ];

  const invoicesData = [
    { projectIndex: 0, status: 'PAID' as const, amount: 5000000 },
    { projectIndex: 0, status: 'SENT' as const, amount: 7500000 },
    { projectIndex: 1, status: 'PAID' as const, amount: 3000000 },
    { projectIndex: 3, status: 'PAID' as const, amount: 12000000 },
    { projectIndex: 4, status: 'SENT' as const, amount: 4500000 },
    { projectIndex: 4, status: 'OVERDUE' as const, amount: 2500000 },
  ];

  const commentsData = [
    { authorName: 'Admin Pytagotech', authorRole: 'ADMIN', content: 'Logo sudah selesai, mohon di-review ya!', projectIndex: 0 },
    { authorName: 'Budi Santoso', authorRole: 'CLIENT', content: 'Bagus! Warna biru-nya sesuai keinginan kami.', projectIndex: 0 },
    { authorName: 'Admin Pytagotech', authorRole: 'ADMIN', content: 'Terima kasih. Homepage sedang dalam proses.', projectIndex: 0 },
    { authorName: 'Siti Nurhaliza', authorRole: 'CLIENT', content: 'Packaging-nya什么时候 bisa selesai?', projectIndex: 1 },
    { authorName: 'Admin Pytagotech', authorRole: 'ADMIN', content: 'Target selesai minggu depan. Akan kami update!', projectIndex: 1 },
  ];

  // Create clients
  console.log('   📦 Creating Clients...');
  const clients = [];
  for (const clientData of clientsData) {
    const client = await prisma.agencyClient.create({
      data: clientData,
    });
    clients.push(client);
    console.log(`      ✅ Client: ${client.name}`);
  }

  // Create client users
  console.log('   👤 Creating Client Users...');
  const clientUsers = [];
  for (let i = 0; i < clients.length; i++) {
    const clientPassword = await bcrypt.hash('client123', 10);
    const user = await prisma.user.create({
      data: {
        name: clientsData[i].contactName,
        email: clientsData[i].contactEmail,
        passwordHash: clientPassword,
        role: 'CLIENT',
        clientId: clients[i].id,
      },
    });
    clientUsers.push(user);
    console.log(`      ✅ User: ${user.email} / client123`);
  }

  // Create projects
  console.log('   📁 Creating Projects...');
  const projects = [];
  for (let i = 0; i < projectsData.length; i++) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 3));

    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + Math.floor(Math.random() * 3) + 1);

    const project = await prisma.project.create({
      data: {
        name: projectsData[i].name,
        description: projectsData[i].description,
        status: projectsData[i].status,
        startDate,
        deadline,
        clientId: clients[projectsData[i].clientIndex].id,
      },
    });
    projects.push(project);

    // Create project access for client
    await prisma.projectAccess.create({
      data: {
        userId: clientUsers[projectsData[i].clientIndex].id,
        projectId: project.id,
      },
    });

    console.log(`      ✅ Project: ${project.name} (${project.status})`);
  }

  // Create deliverables
  console.log('   📋 Creating Deliverables...');
  const deliverables = [];
  for (let i = 0; i < deliverablesData.length; i++) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 14);

    const deliverable = await prisma.deliverable.create({
      data: {
        name: deliverablesData[i].name,
        type: deliverablesData[i].type as any,
        status: deliverablesData[i].status as any,
        currentVersion: deliverablesData[i].status === 'NOT_STARTED' ? 0 : 1,
        deadline,
        assignedTo: deliverablesData[i].status === 'IN_PROGRESS' ? 'Admin Pytagotech' : null,
        projectId: projects[deliverablesData[i].projectIndex].id,
      },
    });
    deliverables.push(deliverable);
    console.log(`      ✅ Deliverable: ${deliverable.name} (${deliverable.status})`);
  }

  // Create deliverable versions
  console.log('   📄 Creating Deliverable Versions...');
  for (let i = 0; i < deliverables.length; i++) {
    if (deliverablesData[i].status !== 'NOT_STARTED') {
      await prisma.deliverableVersion.create({
        data: {
          deliverableId: deliverables[i].id,
          version: 1,
          fileUrl: 'https://example.com/sample.pdf',
          linkUrl: 'https://figma.com/sample',
          pmNotes: 'Silakan di-review dan berikan feedback.',
          uploadedBy: 'Admin Pytagotech',
          clientAction: deliverablesData[i].status === 'APPROVED' ? 'APPROVED' : null,
          clientFeedback: deliverablesData[i].status === 'APPROVED' ? 'Bagus! Approved.' : null,
          clientFeedbackAt: deliverablesData[i].status === 'APPROVED' ? new Date() : null,
        },
      });
    }
  }

  // Create briefs
  console.log('   📁 Creating Briefs...');
  for (let i = 0; i < briefsData.length; i++) {
    await prisma.brief.create({
      data: {
        title: briefsData[i].title,
        category: briefsData[i].category,
        fileUrl: 'https://example.com/brief.pdf',
        uploadedBy: i % 2 === 0 ? 'Admin Pytagotech' : clientsData[projectsData[briefsData[i].projectIndex].clientIndex].contactName,
        projectId: projects[briefsData[i].projectIndex].id,
      },
    });
    console.log(`      ✅ Brief: ${briefsData[i].title}`);
  }

  // Create change requests
  console.log('   🔄 Creating Change Requests...');
  for (let i = 0; i < changeRequestsData.length; i++) {
    await prisma.changeRequest.create({
      data: {
        description: changeRequestsData[i].description,
        status: changeRequestsData[i].status as any,
        requestedBy: changeRequestsData[i].requestedBy,
        responseNote: changeRequestsData[i].responseNote || null,
        respondedAt: changeRequestsData[i].responseNote ? new Date() : null,
        respondedBy: changeRequestsData[i].responseNote ? 'Admin Pytagotech' : null,
        projectId: projects[changeRequestsData[i].projectIndex].id,
      },
    });
    console.log(`      ✅ Change Request: ${changeRequestsData[i].description.substring(0, 30)}...`);
  }

  // Create invoices
  console.log('   💰 Creating Invoices...');
  for (let i = 0; i < invoicesData.length; i++) {
    const issueDate = new Date();
    issueDate.setMonth(issueDate.getMonth() - Math.floor(Math.random() * 2));

    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 14);

    await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${String(1000 + i).padStart(4, '0')}`,
        projectId: projects[invoicesData[i].projectIndex].id,
        issueDate,
        dueDate,
        items: JSON.stringify([
          { name: 'Professional Services', price: invoicesData[i].amount * 0.8 },
          { name: 'Additional Revisions', price: invoicesData[i].amount * 0.2 },
        ]),
        totalAmount: invoicesData[i].amount,
        status: invoicesData[i].status as any,
        sentAt: issueDate,
        paidAt: invoicesData[i].status === 'PAID' ? new Date() : null,
      },
    });
    console.log(`      ✅ Invoice: INV-${1000 + i} (${invoicesData[i].status}) - Rp ${invoicesData[i].amount.toLocaleString()}`);
  }

  // Create comments
  console.log('   💬 Creating Comments...');
  for (let i = 0; i < commentsData.length; i++) {
    await prisma.comment.create({
      data: {
        authorName: commentsData[i].authorName,
        authorRole: commentsData[i].authorRole,
        content: commentsData[i].content,
        projectId: projects[commentsData[i].projectIndex].id,
      },
    });
  }
  console.log(`      ✅ ${commentsData.length} comments created`);

  console.log('\n🎉 Dummy data seeded successfully!\n');

  console.log('📊 SUMMARY:');
  console.log(`   Clients: ${clients.length}`);
  console.log(`   Projects: ${projects.length}`);
  console.log(`   Deliverables: ${deliverables.length}`);
  console.log(`   Invoices: ${invoicesData.length}`);
  console.log(`   Change Requests: ${changeRequestsData.length}`);
  console.log(`   Briefs: ${briefsData.length}`);
  console.log(`   Comments: ${commentsData.length}`);

  console.log('\n🔑 LOGIN CREDENTIALS:');
  console.log('   Admin: admin@pytagotech.com / admin123');
  console.log('   Client 1: budi@elektronik Jaya.com / client123');
  console.log('   Client 2: siti@minumenak.id / client123');
  console.log('   Client 3: rina@fashionhouse.co.id / client123');

  console.log('\n🌐 Live URL: https://07-client-portal.vercel.app');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
