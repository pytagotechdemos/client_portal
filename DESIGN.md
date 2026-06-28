# DESIGN.md — Client Visibility Portal
**Segmen 07 · Kreatif & Digital**

---

## 1. Design Principles

**Agensi kreatif menjual estetika — platform mereka harus mencerminkan itu.** Klien agensi adalah decision-maker korporat yang terbiasa dengan tools profesional. Platform yang terlihat murahan akan merusak kepercayaan. Sebaliknya, agensi yang punya platform yang polished otomatis terlihat lebih profesional dari kompetitor yang masih pakai WA.

1. **Polished over functional** — antarmuka harus mencerminkan kualitas kreatif agensi yang memakainya
2. **Status harus langsung terbaca** — PM dan klien sama-sama butuh tahu status dalam 3 detik
3. **Client portal: impress, don't confuse** — klien buka portal, harus langsung tahu apa yang perlu mereka lakukan

---

## 2. Color System

### Admin / PM Panel
```
Background:  #0F0F11  (near-black — premium, modern agensi)
Surface:     #18181B  (dark surface)
Surface 2:   #27272A  (elevated card)
Border:      #3F3F46

Primary:     #8B5CF6  (violet — kreatif, modern)
Primary dark:#7C3AED
Accent:      #06B6D4  (cyan — highlight, link)

Status not_started:       #52525B (abu, muted)
Status in_progress:       #06B6D4 (cyan)
Status review:            #F59E0B (amber — action needed)
Status approved:          #10B981 (emerald hijau)
Status revision_requested:#EF4444 (merah)

Text primary:  #FAFAFA
Text secondary:#A1A1AA
Text muted:    #71717A

Change Request badge:     bg #7F1D1D, text #FCA5A5, border #EF4444
```

### Client Portal (lebih light — klien tidak terbiasa dark mode)
```
Background:  #F8FAFC
Surface:     #FFFFFF
Border:      #E2E8F0
Primary:     #7C3AED  (violet — sama dengan admin, tapi di light mode)
Text:        #0F172A
Text muted:  #64748B
```

---

## 3. Typography

```
Font: Geist (modern, clean, tech-forward)
Fallback: Inter, system-ui

Admin Panel:
  Heading: 24px / 700 / white
  Sub:     18px / 600 / white
  Body:    14px / 400 / #A1A1AA
  Label:   11px / 500 / uppercase / tracking-widest / #71717A
  Monospace: Geist Mono (nomor invoice, version number)

Client Portal:
  Heading: 22px / 700 / #0F172A
  Body:    15px / 400 / #334155
  Label:   12px / 500 / uppercase / #64748B
```

---

## 4. Admin Panel Layout

### Dashboard PM
```
Dark sidebar (240px):
  [Logo agensi]
  ─────────────
  📊 Dashboard
  📁 Projects
  👤 Clients
  📂 Brief Repository
  📋 Change Requests     ← badge merah jika ada pending
  🧾 Invoices
  ⚙️  Settings

Content area dark:
  [Search bar] [+ New Project]

  Project cards (list view, bukan grid):
    Per card:
      Status bar kiri 4px (warna sesuai status project)
      Nama project | Nama klien
      Progress: 3/7 deliverables approved
      Deadline: X hari lagi (merah jika <7 hari)
      Last activity: 2 jam lalu
      Avatar PM yang handle
```

### Halaman Detail Project
```
Top bar: Nama project | Status badge | Klien | Deadline | [Generate Invoice]

Tabs: Deliverables | Brief | Change Requests | Timeline

Tab Deliverables:
  Per deliverable row:
    Status badge (warna sesuai) | Nama | Tipe | Deadline | Versi | [Aksi]
    
    Expand row:
      Riwayat versi (mini timeline)
      Preview file (thumbnail)
      Catatan revisi terakhir
      [Upload Versi Baru] jika status revision_requested

Sidebar kanan (240px):
  Info project
  Klien contact
  Link portal klien
  [Copy portal link]
```

---

## 5. Client Portal Layout

### Dashboard Klien (setelah login)
```
[Header: logo agensi | nama project | nama klien | logout]

[Hero card - Project Status]
  Nama project
  Progress visual: 3 dari 7 deliverables approved
  Deadline project: 15 November 2026

[Section: Perlu Review Anda] ← yang butuh aksi dari klien
  Card deliverable yang status REVIEW
  Highlight dengan border amber + badge "MENUNGGU REVIEW"
  CTA besar: [Review Sekarang]

[Section: Semua Deliverable]
  List dengan status badge
  Approved: hijau ✓
  Revision: merah ← bisa lihat feedback yang dikirim
  In Progress: abu
  
[Section: Upload Brief Baru]
  Drop zone atau [Pilih File]
  Brief masuk ke repository otomatis
```

### Halaman Review Deliverable
```
Split view (desktop):
  Kiri 60%: preview file / embed / link
  Kanan 40%: action panel

Action panel:
  [Riwayat Revisi] — timeline ringkas versi-versi sebelumnya
  
  Teks: "Versi 2 — diupload 10 Okt"
  
  ┌──────────────────────────────────┐
  │ ✅ Saya Setujui Deliverable Ini  │  ← hijau, tombol besar
  └──────────────────────────────────┘
  
  ┌──────────────────────────────────┐
  │ ✏️ Minta Revisi                  │  ← merah/amber, secondary
  └──────────────────────────────────┘
  
  Jika klik "Minta Revisi":
    Textarea wajib diisi: "Catatan revisi:"
    Placeholder: "Jelaskan apa yang perlu diubah..."
    [Kirim Revisi] — aktif hanya jika textarea tidak kosong
```

---

## 6. Component Specs

### Deliverable Status Badge (Admin - dark mode)
```
not_started:        bg #27272A, text #71717A, border #3F3F46
in_progress:        bg #083344, text #06B6D4, border #0E7490
review:             bg #451A03, text #F59E0B, border #B45309  + pulse
approved:           bg #022C22, text #10B981, border #059669
revision_requested: bg #450A0A, text #EF4444, border #B91C1C
```

### Change Request Card
```
Border kiri 4px merah
Background: #1A0A0A  (dark red tint)
Header: "⚠ Change Request" badge merah
Dari: nama klien | Waktu submit
Deskripsi: teks permintaan
Tombol: [Terima & Buat Deliverable] | [Diskusikan] | [Tolak]
Status: PENDING / ACCEPTED / REJECTED
```

### Revision Timeline
```
Vertikal timeline per deliverable:
  ● v3 APPROVED — 12 Okt — "Sudah sesuai"          ← titik hijau
  ● v2 REVISION — 10 Okt — "Font perlu lebih bold"  ← titik merah
  ● v1 REVISION —  8 Okt — "Warna belum sesuai"     ← titik merah

Setiap node: klik untuk expand full feedback
Download versi: tersedia di setiap node
```

### Invoice Preview
```
Modal besar (90% viewport):
  Preview PDF-style invoice
  Kanan: form meta (nomor, tanggal, jatuh tempo)
  Footer modal: [Download PDF] [Kirim ke Email Klien] [Tutup]
  
Invoice design: korporat, bersih — bukan template biasa
  Header: logo agensi + info kontak
  Table deliverable: nama, keterangan, harga
  Total dengan bold
  Footer: nomor rekening + instruksi pembayaran
```

---

## 7. Empty States

```
Tidak ada project aktif:
  Ilustrasi sederhana (line art folder)
  "Belum ada project aktif"
  [+ Buat Project Baru]

Semua deliverable approved (klien lihat):
  Ilustrasi ceklis besar
  "Semua sudah di-approve! 🎉"
  "Tim sedang menyelesaikan pekerjaan."

Tidak ada Change Request:
  "Tidak ada permintaan di luar scope"
  (tidak perlu CTA — ini kondisi ideal)
```

---

## 8. Notification Design

```
In-app notification (bell icon di topbar):
  Panel slide dari kanan
  Per notifikasi:
    Ikon status (✅ approve, ✏️ revisi, ⚠️ CR)
    Teks: "Klien PT ABC approve Logo Final"
    Waktu: "2 menit lalu"
    Klik → langsung ke deliverable yang dimaksud
    
Email notification (format):
  Subject: "[Project X] Deliverable 'Logo Final' menunggu review Anda"
  Body: simpel, CTA besar → tombol ke portal
```
