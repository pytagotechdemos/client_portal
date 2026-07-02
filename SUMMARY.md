# CLIENT PORTAL

## Apa Ini?
Sistem portal untuk agency Pytagotech manage project dengan client.

---

## Sistem / Fitur:

| Sistem | Fungsi |
|--------|---------|
| **Project Management** | Buat & manage project dengan client |
| **Deliverable Tracking** | Upload hasil kerja, versioning, track status |
| **Review Workflow** | Client review & approve/reject hasil kerja |
| **Invoice System** | Generate invoice, kirim ke client |
| **Payment Gateway** | Integrasi Duit-ku untuk pembayaran |
| **Client Portal** | Akses khusus client via link unik |
| **Discussion** | Chat real-time antara admin & client |
| **Email Notification** | Auto email ke client saat ada update |

---

## Workflow:
```
Admin buat project
    ↓
Admin upload deliverable
    ↓
Client review (approve/reject)
    ↓
Admin generate invoice
    ↓
Client bayar via Duit-ku
```

---

## Tech Stack
Next.js 14 • PostgreSQL • NextAuth • Tailwind CSS • Recharts • Duit-ku Payment • Supabase Storage • Resend Email

---

## Akun Login

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pytagotech.com | admin123 |

Client login via link unik per project.

---

## Live URL
https://07-client-portal.vercel.app
