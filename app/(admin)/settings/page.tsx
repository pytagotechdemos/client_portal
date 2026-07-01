import { prisma } from "@/lib/prisma";
import { updateSettings } from "@/app/actions/settings";
import { SubmitButton } from "@/components/shared/SubmitButton";

export default async function SettingsPage() {
  const settings = await prisma.agencySettings.findFirst();

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Agency Settings</h2>
      
      <form action={updateSettings} className="space-y-8 bg-surface border border-border p-6 rounded-lg">
        {/* Profile */}
        <section className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-border pb-2">Agency Profile</h3>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Agency Name</label>
            <input 
              required 
              name="agencyName" 
              defaultValue={settings?.agencyName || "Pytagotech"}
              type="text" 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Contact Email (for invoices)</label>
            <input 
              required
              name="contactEmail" 
              defaultValue={settings?.contactEmail || "hello@pytagotech.com"}
              type="email" 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" 
            />
          </div>
        </section>

        {/* Duitku Config */}
        <section className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-border pb-2">Duitku Integration</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Merchant Code</label>
              <input 
                name="duitkuMerchantCode" 
                defaultValue={settings?.duitkuMerchantCode || ""}
                type="text" 
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Environment</label>
              <select 
                name="duitkuEnv"
                defaultValue={settings?.duitkuEnv || "sandbox"}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover"
              >
                <option value="sandbox">Sandbox (Testing)</option>
                <option value="production">Production (Live)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-1">API Key</label>
            <input 
              name="duitkuApiKey" 
              defaultValue={settings?.duitkuApiKey || ""}
              type="password" 
              placeholder="••••••••••••••••"
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary-hover" 
            />
            <p className="text-xs text-muted mt-1">Keep this key secret. Never expose it on the client side.</p>
          </div>
        </section>

        <div className="pt-4 flex justify-end">
          <SubmitButton label="Save Settings" />
        </div>
      </form>
    </div>
  );
}
