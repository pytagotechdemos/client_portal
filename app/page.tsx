import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/api/auth/signin");
  }

  // Assuming Klien would have "client" role and Admin would have "ADMIN"
  if (session.user.role === "ADMIN") {
    redirect("/projects");
  } else {
    // We don't have project tokens for a global client dashboard in this MVP, 
    // Klien access via specific /portal/[token] links directly.
    // If they land here, just tell them to use their link.
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="bg-white p-8 rounded-lg shadow text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-[#0F172A]">Welcome to Studio Volta</h1>
          <p className="text-[#64748B]">Please use the specific Project Portal Link provided to you via email to access your deliverables.</p>
        </div>
      </div>
    );
  }
}
