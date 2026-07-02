import { prisma } from "@/lib/prisma";
import { updateSettings } from "@/app/actions/settings";
import { SubmitButton } from "@/components/shared/SubmitButton";

export default async function SettingsPage() {
  const settings = await prisma.agencySettings.findFirst();

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Pengaturan Agensi</h2>
      
      <form action={updateSettings} className="space-y-8 bg-surface border border-border p-6 rounded-lg">
        {/* Profile */}
        <section className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-border pb-2">Profil Agensi</h3>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Nama Agensi</label>
            <input 
              required 
              name="agencyName" 
              defaultValue={settings?.agencyName || "Pytagotech"}
              type="text" 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Email Kontak (untuk tagihan)</label>
            <input 
              required
              name="contactEmail" 
              defaultValue={settings?.contactEmail || "hello@pytagotech.com"}
              type="email" 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">URL Logo (Opsional)</label>
              <input 
                name="logoUrl" 
                defaultValue={settings?.logoUrl || ""}
                type="url" 
                placeholder="https://..."
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Warna Utama (Hex)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  name="primaryColor" 
                  defaultValue={settings?.primaryColor || "#7C3AED"}
                  className="w-14 h-10 bg-background border border-border rounded-md cursor-pointer p-1" 
                />
                <span className="text-sm text-muted">Pilih warna merek</span>
              </div>
            </div>
          </div>
        </section>

        {/* Duitku Config */}
        <section className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-border pb-2">Integrasi Duitku</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Kode Merchant</label>
              <input 
                name="duitkuMerchantCode" 
                defaultValue={settings?.duitkuMerchantCode || ""}
                type="text" 
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Lingkungan (Environment)</label>
              <select 
                name="duitkuEnv"
                defaultValue={settings?.duitkuEnv || "sandbox"}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover"
              >
                <option value="sandbox">Sandbox (Pengujian)</option>
                <option value="production">Production (Langsung)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Kunci API</label>
            <input 
              name="duitkuApiKey" 
              defaultValue={settings?.duitkuApiKey || ""}
              type="password" 
              placeholder="••••••••••••••••"
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" 
            />
            <p className="text-xs text-muted mt-1">Jaga kerahasiaan kunci ini. Jangan pernah mengeksposnya di sisi klien.</p>
          </div>
        </section>

        <div className="pt-4 flex justify-end">
          <SubmitButton>Simpan Pengaturan</SubmitButton>
        </div>
      </form>
    </div>
  );
}
