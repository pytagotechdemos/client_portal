# PYTAGOTECH CLIENT PORTAL - TUTORIAL

## Apa Itu Project Ini?
Client portal untuk agency. Admin upload hasil kerja → Client review & approve → Invoice → Payment.

---

## STEP-BY-STEP TUTORIAL

### 🟢 TUTORIAL 1: Login Admin
1. Buka `http://localhost:3000/login`
2. Masukkan email & password admin
3. Klik "Sign In"
4. Masuk ke Dashboard

**Tip:** Login pakai credentials yang ada di database (default: `admin@pytagotech.com` / `admin123`)

---

### 🟢 TUTORIAL 2: Buat Project Baru
1. Klik **Projects** di sidebar
2. Klik tombol **+ New Project**
3. Isi form:
   - **Project Name**: Nama project
   - **Start Date**: Tanggal mulai
   - **Deadline**: Tanggal deadline (optional)
   - **Company Name**: Nama perusahaan client
   - **Contact Person**: Nama PIC client
   - **Email**: Email client (akan jadi login client)
   - **Password**: Password sementara untuk client
4. Klik **Create Project**

**Yang terjadi:**
- Sistem buat Client baru
- Sistem buat Project
- Sistem buat User untuk client
- Email welcome dikirim ke client

---

### 🟢 TUTORIAL 3: Tambah Deliverable
1. Buka project → Tab **Deliverables**
2. Di form bawah, isi:
   - **Nama**: "Logo Design", "Website Draft", dll
   - **Type**: DESIGN / DOCUMENT / VIDEO / COPY / OTHER
   - **Assigned To**: Pilih team member (optional)
3. Klik **Add**

**Yang terjadi:**
- Deliverable terbuat dengan status "NOT_STARTED"
- Client dapat email notifikasi

---

### 🟢 TUTORIAL 4: Upload Hasil Kerja
1. Buka project → **Deliverables**
2. Klik nama deliverable
3. Di panel kanan:
   - **Upload File**: Upload file (JPG, PDF, dll)
   - **OR External Link**: Masukkan link (Figma, Google Drive, dll)
   - **Notes**: Catatan untuk client
4. Klik **Upload & Request Review**

**Yang terjadi:**
- Versi baru terbuat
- Status berubah ke "REVIEW"
- Client dapat email notification

---

### 🟢 TUTORIAL 5: Client Review Deliverable
**→ Ini dilakukan CLIENT (via portal link)**

1. Client buka link portal dari email
2. Lihat section **"Awaiting Your Review"**
3. Klik **Review Now**
4. Pilih aksi:
   - ✅ **Approve Deliverable** - Setuju, kerjaan selesai
   - ⚠️ **Approve (with minor tweaks)** - Setuju tapi ada revisi kecil
   - ❌ **Submit Revision Request** - Perlu revisi

**Yang terjadi:**
- Status berubah sesuai aksi client
- Admin dapat email notification
- Feedback client tersimpan di version history

---

### 🟢 TUTORIAL 6: Buat Invoice
**SYARAT: Minimal 1 deliverable berstatus "APPROVED"**

1. Buka project → Klik **Generate Invoice**
2. Set harga untuk setiap deliverable yang diapprove
3. Tambahkan notes (optional)
4. Klik **Generate Invoice**

**Yang terjadi:**
- Invoice terbuat
- Client dapat email dengan link invoice
- Invoice muncul di tab Invoices

---

### 🟢 TUTORIAL 7: Client Bayar Invoice
**→ Ini dilakukan CLIENT**

1. Client buka portal → Tab **Invoices**
2. Klik **View Invoice**
3. Klik **Pay with Duitku**
4. Selesai pembayaran

**Yang terjadi:**
- Client diarahkan ke halaman payment Duitku
- Setelah bayar, sistem auto-update status invoice ke "PAID"

---

### 🟢 TUTORIAL 8: Brief & Asset Upload
**→ Admin & Client bisa upload**

**Admin:**
1. Buka project → Tab **Briefs**
2. Klik **Upload Brief**
3. Isi title, category, dan file URL
4. Klik **Upload Brief**

**Client:**
1. Buka portal → Tab **Briefs & Assets**
2. Isi form upload
3. Klik **Upload Asset**

---

### 🟢 TUTORIAL 9: Change Request (Scope Creep)
**→ Client bisa minta kerjaan tambahan**

1. Buka portal → Tab **Change Requests**
2. Di form "New Request", isi description
3. Klik **Submit Request**

**Admin response:**
1. Buka project → Tab **Change Requests**
2. Pilih aksi: Accept / Reject / Need Discussion
3. Tambahkan catatan (optional)
4. Klik **Update**

---

### 🟢 TUTORIAL 10: Diskusi / Comments
**→ Admin & Client bisa chat**

1. Buka tab **Discussion** (di project atau portal)
2. Ketik pesan di form bawah
3. Klik **Send**

**Fitur:**
- Real-time update (SWR polling)
- Admin lihat icon 🛡️
- User hanya bisa hapus comment sendiri

---

## COMMON WORKFLOW

```
Admin creates project
    ↓
Admin adds deliverables
    ↓
Admin uploads work (version)
    ↓
Client reviews (approve/reject)
    ↓
Admin generates invoice
    ↓
Client pays via Duitku
    ↓
Invoice marked as PAID ✅
```

---

## TROUBLESHOOTING

### Login gagal?
1. Check email & password benar
2. Check user ada di database
3. Run `npx prisma studio` untuk cek data

### Email tidak terkirim?
1. Check `RESEND_API_KEY` di .env
2. Check `NEXTAUTH_URL` sudah set
3. Check console error

### Payment tidak works?
1. Check Duitku credentials di Settings
2. Pastikan environment (sandbox/production) sesuai
3. Check webhook callback URL accessible

---

## ENVIRONMENT SETUP

```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Supabase (file storage)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# Email
RESEND_API_KEY=re_xxx

# Payment (set di Settings UI, bukan .env)
# DUITKU_MERCHANT_CODE=
# DUITKU_API_KEY=
```
