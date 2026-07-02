# PYTAGOTECH CLIENT PORTAL

## Apa Ini?
Agency project management portal. Memungkinkan agency upload hasil kerja, client review & approve, dan payment via invoice.

---

## Tech Stack
Next.js 14 • Prisma • PostgreSQL • NextAuth • Tailwind CSS • Recharts • Duitku Payment • Supabase Storage • Resend Email

---

## User Flows

| Flow | Steps |
|------|-------|
| **Create Project** | Admin buat project → Client account otomatis dibuat → Email terkirim |
| **Deliver Work** | Admin upload deliverable → Status REVIEW → Client review |
| **Client Review** | Client approve/reject → Status update → Admin notify |
| **Invoice** | Admin generate invoice dari approved deliverables → Client bayar via Duitku |
| **Discussion** | Real-time comments antara admin & client |

---

## Roles
- **ADMIN** - Agency staff, full access
- **CLIENT** - Client company, portal access only

---

## Key Features
✅ Project management dengan status tracking
✅ Deliverable versioning dengan feedback
✅ Client portal dengan review workflow
✅ Invoice generation dengan Duitku payment
✅ Real-time discussion comments
✅ Email notifications
✅ File upload via Supabase

---

## Test Results
**41 tests passing** - Full E2E coverage

---

## Files Created
- `GUIDE.md` - Step-by-step tutorial
- `SUMMARY.md` - File ini
- `tests/comprehensive.spec.ts` - 41 Playwright tests
