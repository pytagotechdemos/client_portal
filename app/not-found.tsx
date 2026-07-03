import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-surface border border-border rounded-lg p-10 text-center max-w-md w-full">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-muted text-sm mb-8">
          Kami tidak dapat menemukan halaman yang Anda cari. Halaman mungkin telah dipindahkan atau tidak ada.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-md font-medium transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
