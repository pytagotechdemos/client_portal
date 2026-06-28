# PRD — Client Visibility Portal
**Segmen:** 07 · Kreatif & Digital  
**Target:** Agensi Pemasaran Digital, Production House, Agensi Kreatif  
**Status:** MVP Demo · Pytagotech 2026

---

## 1. Problem Statement

Agensi kreatif dan digital beroperasi dengan klien yang sering tidak merasa terlibat dalam proses — mereka hanya melihat hasil akhir dan kemudian minta revisi besar-besaran karena ekspektasi tidak terkelola. Brief via WhatsApp hilang. Revisi tidak ter-track (versi mana yang final?). Scope creep terjadi tapi tidak ada paper trail — tim kerjakan tanpa bisa tagih. Klien lambat approve tapi deadline tidak mundur. Invoice tidak bisa keluar karena tidak ada dokumentasi deliverable yang sudah diapprove.

**Root cause:** Tidak ada satu platform yang menjadi sumber kebenaran tunggal (single source of truth) untuk semua komunikasi, deliverable, dan persetujuan antara agensi dan klien.

---

## 2. Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Revisi besar berkurang | Jumlah major revision request per project turun >60% |
| Approval lebih cepat | Rata-rata waktu klien approve deliverable dari >3 hari → <24 jam |
| 0 scope creep tanpa dokumen | 100% permintaan di luar scope masuk sebagai Change Request formal |
| Invoice lebih cepat | Dari selesai project ke invoice terkirim: dari rata-rata 5 hari → <1 hari |
| Brief tidak hilang | 0 kali "brief dari WA tidak ketemu" dalam satu kuartal |

---

## 3. User Personas

### 3A. Account Manager / PM Agensi
- Tugasnya: manage project, komunikasi dengan klien, koordinasi tim kreatif
- Pain: jadi "translator" antara klien dan tim — semua lewat dirinya, bottleneck
- Need: klien bisa interaksi langsung ke sistem, tidak selalu lewat WA ke AM

### 3B. Tim Kreatif
- Tugasnya: produksi konten, desain, copy, video
- Pain: tidak tahu revisi mana yang final, pesan revisi hilang di chat
- Need: semua revisi tercatat rapi per deliverable, tidak ada ambiguitas

### 3C. Klien
- Tugasnya: review hasil kerja, beri feedback, approve
- Pain: tidak tahu progress project kecuali aktif tanya — tidak nyaman
- Need: bisa lihat progress kapanpun, beri feedback langsung di sistem, tidak perlu WA

### 3D. Owner / Direktur Agensi
- Tugasnya: keputusan strategis, monitor profitability
- Pain: tidak tahu project mana yang bermasalah sebelum terlambat
- Need: dashboard: project yang stuck, scope creep, klien yang lama approve

---

## 4. Scope MVP

### 4.1 In Scope
**Project Management (internal):**
- CRUD project + klien
- Daftar deliverable per project
- Status tracking per deliverable
- Upload deliverable (file / link eksternal)

**Client Portal:**
- Login klien (per project)
- Lihat progress semua deliverable
- Approve / Reject deliverable dengan catatan
- Riwayat revisi (semua versi, semua feedback)
- Submit permintaan baru (otomatis terflag sebagai Change Request)

**Brief Repository:**
- Upload dan simpan semua brief per project
- Tag per deliverable
- Search brief

**Scope Change Alert:**
- Permintaan klien di luar scope → otomatis di-flag CR
- CR butuh acknowledgment PM sebelum tim mulai kerjakan

**Invoice Generator:**
- Generate invoice dari deliverable yang sudah diapprove
- Preview sebelum kirim

### 4.2 Out of Scope
- Payment processing
- Time tracking per task
- Resource allocation / scheduling
- Kolaborasi real-time dokumen (Google Docs-style)

---

## 5. Feature Specification

### F-01 · Project Setup
**Admin/PM buat project:**
- Nama project, klien (dari master atau baru), tanggal mulai, deadline
- Package/scope awal (deskripsi singkat atau upload dokumen scope)
- Deliverable list: nama, deskripsi, deadline per deliverable, PIC tim
- Buat akun klien (email + password) dan assign ke project

**Deliverable types:**
- Dokumen (upload file: PDF, DOC, XLSX)
- Design (upload file atau link Figma/Canva)
- Video (upload atau YouTube/Vimeo link)
- Copy/Konten (teks langsung atau link Google Docs)
- Lainnya (custom)

---

### F-02 · Deliverable Flow
```
Status deliverable:
  NOT_STARTED → IN_PROGRESS → REVIEW → APPROVED / REVISION_REQUESTED

Flow:
  PM upload deliverable versi 1 → status: REVIEW
  → Notifikasi ke klien: "Ada deliverable baru untuk review"
  → Klien buka portal → review → pilih:
      APPROVE: status → APPROVED, notif ke PM & tim
      REVISION: status → REVISION_REQUESTED + wajib isi catatan revisi
  → Tim upload versi revisi → status kembali ke REVIEW
  → Loop sampai APPROVED
```

**Versi deliverable:**
- Setiap upload baru = versi baru (v1, v2, v3, …)
- Semua versi tersimpan, bisa diakses
- Catatan revisi melekat ke versi yang di-reject

---

### F-03 · Brief Repository
**Upload brief:**
- PM upload dokumen brief (PDF, Word, gambar)
- Tag: terhubung ke project + deliverable tertentu (opsional)
- Kategori: Visual Brief / Copy Brief / Brand Guideline / Meeting Notes / dll

**Akses:**
- Tim internal bisa lihat semua brief di project
- Klien bisa upload brief sendiri via portal (masuk langsung ke repository)
- Search by keyword, kategori, tanggal

---

### F-04 · Change Request (Scope Creep Prevention)
**Trigger:** Klien mengetik permintaan di kolom "Feedback/Request" di portal

**Deteksi CR:**
- Otomatis: jika keyword terdeteksi di luar deliverable yang ada (bisa manual toggle oleh PM)
- Manual: PM bisa flag permintaan apapun sebagai CR

**CR Flow:**
```
Klien submit permintaan baru di portal
→ PM dapat notifikasi: "Ada permintaan baru dari klien [nama]"
→ PM review: Terima (masuk ke deliverable baru) / Tolak / Diskusi
→ Jika Terima: buat deliverable baru + update scope dokumen
→ PM dan klien sama-sama tandatangani scope change (digital acknowledge)
```

---

### F-05 · Revision History
**Tampilan per deliverable:**
```
Deliverable: "Logo Final — Versi Approved"

Riwayat:
  v3 [APPROVED]   12 Okt 2026   "Logo sudah oke, warna sesuai"
  v2 [REVISION]   10 Okt 2026   "Font kurang bold, coba yang lebih tebal"
  v1 [REVISION]    8 Okt 2026   "Warna belum sesuai brand guideline"
  
[Download v3 — versi approved] | [Lihat semua versi]
```

---

### F-06 · Invoice Generator
**Trigger:** PM buka halaman Invoice → pilih project

**Logic:**
- Sistem list semua deliverable APPROVED di project
- PM bisa pilih mana yang masuk ke invoice ini
- Fields tambahan: nomor invoice, tanggal, jatuh tempo, catatan
- Preview PDF → Download → Kirim ke email klien

**Invoice tidak bisa dibuat sebelum ada minimal 1 deliverable APPROVED**
(ini fitur proteksi bisnis yang juga jadi selling point ke klien)

---

## 6. User Flow

### Internal (PM)
```
Buat project → Tambah deliverable → Assign tim
→ Upload brief → Tim produksi → Upload deliverable v1
→ Klien dapat notif → Klien review di portal
→ Jika revisi → tim update → upload v2 → dst
→ Jika approve → semua deliverable approved → Generate invoice
```

### Klien
```
Terima email notifikasi
→ Login portal (email + password)
→ Lihat dashboard project: semua deliverable + status
→ Klik deliverable yang REVIEW → download/preview
→ Pilih Approve atau Request Revision (wajib isi alasan)
→ Submit → notif ke PM
```

---

## 7. Data Model (Simplified)

```
Client
  id, name, contactName, contactEmail, phone, companyName

Project
  id, clientId, name, description, startDate, deadline
  status: active|completed|on_hold|cancelled
  scopeDocUrl (link atau file)

Deliverable
  id, projectId, name, description, type
  deadline, assignedTo (userId)
  status: not_started|in_progress|review|approved|revision_requested
  currentVersion (int)

DeliverableVersion
  id, deliverableId, version (int)
  fileUrl, linkUrl, notes (dari PM)
  uploadedBy, uploadedAt
  clientFeedback, clientFeedbackAt
  clientAction: approved|revision_requested|null

Brief
  id, projectId, deliverableId (nullable)
  title, category, fileUrl
  uploadedBy (admin/pm/client), uploadedAt

ChangeRequest
  id, projectId, requestedBy (client atau PM)
  description, status: pending|accepted|rejected|discussed
  responseNote, respondedAt

ClientAccess
  id, clientId, projectId
  email, passwordHash  (satu klien bisa punya akses ke beberapa project)

Invoice
  id, projectId
  invoiceNumber, issueDate, dueDate
  items: [{deliverableId, description, amount}]
  totalAmount, notes, status: draft|sent|paid
  pdfUrl
```

---

## 8. Demo Script (untuk Sales)

**Target:** Owner agensi kreatif atau manajer account

1. **Opening hook:** "Berapa jam per minggu tim kalian habis untuk update klien via WA tentang progress project?"
2. Tunjukkan dashboard project dari sisi PM: semua deliverable, status real-time
3. Upload deliverable baru (simulasi: upload file desain)
4. Pindah ke portal klien (tab lain / HP): notif → review
5. Klien klik "Request Revision" + isi alasan → submit
6. Kembali ke admin: notif masuk, revisi tercatat di riwayat
7. Tunjukkan brief repository: semua brief terorganisir, searchable
8. Simulasi scope creep: klien kirim permintaan baru → otomatis terflag CR
9. Generate invoice dari deliverable yang approved
10. **Close:** "Setiap revisi, setiap brief, setiap approval — semua ada jejak digitalnya. Invoice bisa keluar dalam 1 menit setelah klien approve."

---

## 9. Timeline Estimasi

| Fase | Durasi |
|------|--------|
| Setup + project & client management | 3 hari |
| Deliverable CRUD + file upload | 4 hari |
| Client portal (login + review + approve/revisi) | 4 hari |
| Revision history | 2 hari |
| Brief repository | 2 hari |
| Change Request flow | 2 hari |
| Invoice generator + PDF | 3 hari |
| Notifikasi (email + WA) | 2 hari |
| Polish + demo data | 2 hari |
| **Total** | **~24 hari kerja** |
