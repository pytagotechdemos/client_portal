import { createProject } from "@/app/actions/project";

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
      
      <form action={createProject} className="space-y-8 bg-surface border border-border p-6 rounded-lg">
        {/* Project Info */}
        <section className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-border pb-2">Project Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Project Name *</label>
            <input required name="name" type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Description / Scope</label>
            <textarea name="description" rows={3} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Start Date *</label>
              <input required name="startDate" type="date" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6] color-scheme-dark" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Deadline</label>
              <input name="deadline" type="date" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6] color-scheme-dark" />
            </div>
          </div>
        </section>

        {/* Client Info */}
        <section className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-border pb-2">Client Details & Portal Access</h3>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Company / Client Name *</label>
            <input required name="clientName" type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Contact Person *</label>
              <input required name="contactName" type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Email Address *</label>
              <input required name="contactEmail" type="email" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1">Portal Password for Client *</label>
            <input required name="clientPassword" type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]" placeholder="e.g. Secret123" />
          </div>
        </section>

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" className="px-4 py-2 text-muted hover:text-white transition-colors">Cancel</button>
          <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-md font-medium transition-colors">Create Project</button>
        </div>
      </form>
    </div>
  );
}
