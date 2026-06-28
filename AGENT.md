# AGENT.md — Client Visibility Portal
**Segmen 07 · Kreatif & Digital**

---

## 1. Stack

```
Framework:   Next.js 14 (App Router)
Database:    PostgreSQL via Supabase
ORM:         Prisma
Auth:        NextAuth.js (PM/admin + client — two credential sets)
Storage:     Supabase Storage (deliverables, briefs, signatures)
Email:       Resend (transactional email)
PDF:         React-PDF (untuk invoice — lebih clean dari jsPDF)
Styling:     Tailwind CSS v3 + class-variance-authority (cva)
Notif:       In-app (polling atau Supabase Realtime) + Email via Resend
Deploy:      Vercel + Supabase
```

---

## 2. Folder Structure

```
/app
  /(admin)                          → admin/PM panel (dark theme)
    /dashboard
    /projects
      /page.tsx                     → list semua project
      /new/page.tsx                 → buat project baru
      /[id]/page.tsx                → detail project (deliverables, brief, CR)
      /[id]/deliverables/[did]      → detail + upload versi deliverable
    /clients
    /briefs                         → global brief repository
    /change-requests                → semua CR (semua project)
    /invoices
      /[projectId]/new              → generate invoice

  /(client)                         → portal klien (light theme)
    /portal/[projectToken]
      /page.tsx                     → dashboard project klien
      /deliverable/[id]/page.tsx    → review + approve/revisi
      /brief/page.tsx               → upload brief baru

  /api
    /projects                       → CRUD project
    /deliverables                   → CRUD deliverable
    /deliverables/[id]/upload       → upload versi baru
    /deliverables/[id]/review       → POST approve/revisi dari klien
    /briefs                         → CRUD brief
    /change-requests                → CRUD CR
    /invoices                       → generate + manage invoice
    /notify                         → email notif via Resend
    /upload                         → Supabase Storage handler

/lib
  /invoice-pdf.tsx                  → React-PDF invoice component
  /email-templates.tsx              → email template components (Resend)
  /storage.ts                       → Supabase Storage helpers

/components
  /(admin)
    /ProjectCard.tsx
    /DeliverableRow.tsx
    /RevisionTimeline.tsx
    /ChangeRequestCard.tsx
    /InvoicePreview.tsx
  /(client)
    /DeliverableReview.tsx
    /FilePreview.tsx
    /RevisionForm.tsx
  /shared
    /StatusBadge.tsx                → reusable, support dark+light theme via props
    /NotificationPanel.tsx
    /BriefRepository.tsx
```

---

## 3. Prisma Schema

```prisma
model AgencyClient {
  id            String   @id @default(cuid())
  name          String
  contactName   String
  contactEmail  String
  phone         String?
  companyName   String?
  projects      Project[]
  accesses      ClientAccess[]
  createdAt     DateTime @default(now())
}

model Project {
  id            String        @id @default(cuid())
  clientId      String
  client        AgencyClient  @relation(fields: [clientId], references: [id])
  name          String
  description   String?
  startDate     DateTime
  deadline      DateTime?
  status        ProjectStatus @default(ACTIVE)
  scopeDocUrl   String?
  portalToken   String        @unique @default(cuid())
  deliverables  Deliverable[]
  briefs        Brief[]
  changeRequests ChangeRequest[]
  invoices      Invoice[]
  access        ClientAccess?
  createdAt     DateTime      @default(now())
}

enum ProjectStatus { ACTIVE ON_HOLD COMPLETED CANCELLED }

model Deliverable {
  id             String              @id @default(cuid())
  projectId      String
  project        Project             @relation(fields: [projectId], references: [id])
  name           String
  description    String?
  type           DeliverableType
  deadline       DateTime?
  assignedTo     String?
  status         DeliverableStatus   @default(NOT_STARTED)
  currentVersion Int                 @default(0)
  versions       DeliverableVersion[]
  createdAt      DateTime            @default(now())
}

enum DeliverableType { DOCUMENT DESIGN VIDEO COPY OTHER }
enum DeliverableStatus { NOT_STARTED IN_PROGRESS REVIEW APPROVED REVISION_REQUESTED }

model DeliverableVersion {
  id              String      @id @default(cuid())
  deliverableId   String
  deliverable     Deliverable @relation(fields: [deliverableId], references: [id])
  version         Int
  fileUrl         String?
  linkUrl         String?     // Figma, YouTube, Google Docs, dll
  pmNotes         String?     // notes dari PM untuk klien
  uploadedBy      String
  uploadedAt      DateTime    @default(now())
  clientFeedback  String?
  clientFeedbackAt DateTime?
  clientAction    ClientAction?
}

enum ClientAction { APPROVED REVISION_REQUESTED }

model Brief {
  id            String   @id @default(cuid())
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id])
  deliverableId String?  // link ke deliverable spesifik (opsional)
  title         String
  category      String   // visual_brief|copy_brief|brand_guideline|meeting_notes|other
  fileUrl       String
  uploadedBy    String   // userId atau "client"
  uploadedAt    DateTime @default(now())
}

model ChangeRequest {
  id            String     @id @default(cuid())
  projectId     String
  project       Project    @relation(fields: [projectId], references: [id])
  requestedBy   String     // "client" atau userId PM
  description   String
  status        CRStatus   @default(PENDING)
  responseNote  String?
  respondedAt   DateTime?
  respondedBy   String?
  createdAt     DateTime   @default(now())
}

enum CRStatus { PENDING ACCEPTED REJECTED DISCUSSED }

model ClientAccess {
  id            String        @id @default(cuid())
  clientId      String
  client        AgencyClient  @relation(fields: [clientId], references: [id])
  projectId     String        @unique
  project       Project       @relation(fields: [projectId], references: [id])
  email         String
  passwordHash  String
  lastLoginAt   DateTime?
}

model Invoice {
  id            String        @id @default(cuid())
  invoiceNumber String        @unique
  projectId     String
  project       Project       @relation(fields: [projectId], references: [id])
  issueDate     DateTime
  dueDate       DateTime
  items         Json          // [{deliverableId, description, amount}]
  totalAmount   Decimal
  notes         String?
  status        InvoiceStatus @default(DRAFT)
  pdfUrl        String?
  sentAt        DateTime?
  paidAt        DateTime?
  createdAt     DateTime      @default(now())
}

enum InvoiceStatus { DRAFT SENT PAID OVERDUE }
```

---

## 4. Auth: Dua Role Sistem

```typescript
// NextAuth providers:
// 1. Admin/PM: email + password dari tabel AgencyUser (internal)
// 2. Client: email + password dari tabel ClientAccess (per project)

// Session: { role: 'ADMIN' | 'CLIENT', userId, projectId? (untuk klien) }

// Middleware:
// /(admin)/* → role ADMIN
// /(client)/portal/[token]/* → role CLIENT, verifikasi token match projectId
```

---

## 5. File Preview Logic (Client Portal)

```typescript
// Komponen FilePreview.tsx — deteksi tipe dan render yang sesuai

type DeliverableVersion = {
  fileUrl: string | null;
  linkUrl: string | null;
};

export function FilePreview({ version }: { version: DeliverableVersion }) {
  if (version.linkUrl) {
    // Figma → embed
    if (version.linkUrl.includes('figma.com')) {
      return <iframe src={`https://www.figma.com/embed?embed_host=share&url=${version.linkUrl}`} />;
    }
    // YouTube → embed
    if (version.linkUrl.includes('youtube.com') || version.linkUrl.includes('youtu.be')) {
      return <YouTube videoId={extractYouTubeId(version.linkUrl)} />;
    }
    // Google Docs/Slides → iframe embed
    if (version.linkUrl.includes('docs.google.com')) {
      return <iframe src={version.linkUrl.replace('/edit', '/preview')} />;
    }
    // Default: buka di tab baru
    return <a href={version.linkUrl} target="_blank">Buka di tab baru →</a>;
  }
  
  if (version.fileUrl) {
    const ext = getExtension(version.fileUrl);
    if (ext === 'pdf') return <PDFViewer url={version.fileUrl} />;
    if (['jpg','jpeg','png','gif','webp'].includes(ext)) return <img src={version.fileUrl} />;
    // Other: download link
    return <a href={version.fileUrl} download>Download file</a>;
  }
  
  return <p>Tidak ada file tersedia</p>;
}
```

---

## 6. Invoice PDF (React-PDF)

```typescript
// /lib/invoice-pdf.tsx
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  header: { backgroundColor: '#7C3AED', padding: 24, flexDirection: 'row' },
  headerText: { color: '#FFFFFF', fontSize: 11 },
  // ... semua styles
});

export function InvoicePDF({ invoice, project, client, agencyInfo }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={agencyInfo.logoUrl} style={styles.logo} />
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
          </View>
        </View>
        
        {/* Billing info, items table, total, payment info */}
        {/* ... */}
      </Page>
    </Document>
  );
}

// API route: stream PDF sebagai response
// GET /api/invoices/[id]/pdf
import { renderToStream } from '@react-pdf/renderer';
const stream = await renderToStream(<InvoicePDF {...props} />);
```

---

## 7. Email Notifications (Resend)

```typescript
// /lib/email-templates.tsx
// Template dengan React Email (https://react.email)

// Template 1: Deliverable Ready for Review
export const DeliverableReviewEmail = ({ clientName, projectName, deliverableName, portalUrl }) => (
  <Html>
    <Preview>Deliverable "{deliverableName}" menunggu review Anda</Preview>
    <Body>
      <Heading>Halo {clientName},</Heading>
      <Text>Deliverable baru sudah siap untuk Anda review:</Text>
      <Text><strong>{deliverableName}</strong> — Project: {projectName}</Text>
      <Button href={portalUrl}>Review Sekarang →</Button>
    </Body>
  </Html>
);

// Template 2: Change Request (ke PM)
// Template 3: Revision Submitted (ke tim)
// Template 4: Invoice (ke klien)
```

---

## 8. Seed Data untuk Demo

```typescript
// Agensi fiktif: "Studio Volta Creative"
// Klien demo: "PT Nusantara Retail"

// Project 1: Brand Identity Refresh (sudah hampir selesai)
// Deliverables:
//   1. Logo Final      — APPROVED (v3, setelah 2x revisi)
//   2. Brand Guideline — APPROVED (v1)
//   3. Social Media Kit — REVIEW (menunggu klien)
//   4. Business Card   — IN_PROGRESS
// Change Request 1 aktif: "Bisa tambah desain untuk neon sign?"

// Project 2: Website Company Profile (baru mulai)
// 3 deliverable, semuanya NOT_STARTED

// Invoice draft untuk Project 1 (2 deliverable approved)
// Brief: 3 file tersimpan (visual brief, brand ref, meeting notes)
```

---

## 9. Development Sequence

```
Sprint 1 (hari 1-4):
  [ ] Setup + schema + auth (admin + client dual auth)
  [ ] Client CRUD + project CRUD
  [ ] Portal token generation

Sprint 2 (hari 5-9):
  [ ] Deliverable CRUD + status flow
  [ ] File upload ke Supabase Storage
  [ ] Upload versi baru deliverable

Sprint 3 (hari 10-14):
  [ ] Client portal: dashboard + deliverable list
  [ ] Review page: file preview + approve/revisi flow
  [ ] Revision history (timeline per deliverable)

Sprint 4 (hari 15-18):
  [ ] Brief repository (upload + search + tagging)
  [ ] Change Request detection + flow (PM terima/tolak)
  [ ] Email notifications via Resend

Sprint 5 (hari 19-22):
  [ ] Invoice generator (React-PDF)
  [ ] In-app notification panel
  [ ] Dark theme polish (admin panel)
  [ ] Seed demo data + demo walkthrough test

Sprint 6 (hari 23-24):
  [ ] Dashboard PM (project list, stats)
  [ ] Final polish + mobile responsiveness client portal
```

---

## 10. Testing Checklist

```
[ ] PM upload deliverable → klien dapat email notif
[ ] Klien login portal → hanya lihat project mereka (isolasi)
[ ] Klien approve deliverable → status berubah ke APPROVED
[ ] Klien revisi → PM dapat notif + revision history muncul
[ ] Brief upload dari klien → masuk ke repository admin
[ ] Change Request: PM menerima + buat deliverable baru → CR ACCEPTED
[ ] Invoice: generate dari deliverables APPROVED → PDF correct
[ ] File preview: Figma link embed, PDF render, gambar tampil
[ ] Admin dark theme: semua teks readable (kontras WCAG AA)
[ ] Client portal light theme: mobile-friendly di 375px
```

---

## 11. Environment Variables

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@studiovolta.com  # diganti nama agensi klien

NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_AGENCY_NAME=   # diisi nama agensi klien saat demo
```
