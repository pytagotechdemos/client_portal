"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";

export async function submitReview(formData: FormData) {
  const deliverableId = formData.get("deliverableId") as string;
  const versionId = formData.get("versionId") as string;
  const action = formData.get("action") as "APPROVED" | "REVISION_REQUESTED";
  const feedback = formData.get("feedback") as string;
  const portalToken = formData.get("portalToken") as string;

  // Update the version record
  await prisma.deliverableVersion.update({
    where: { id: versionId },
    data: {
      clientAction: action,
      clientFeedback: feedback || null,
      clientFeedbackAt: new Date(),
    },
  });

  // Update the deliverable status
  const updatedDeliverable = await prisma.deliverable.update({
    where: { id: deliverableId },
    data: {
      status: action,
    },
    include: { project: true }
  });

  const admin = await prisma.agencyUser.findFirst();
  if (admin) {
    await sendEmail({
      to: admin.email,
      subject: `Client ${action === "APPROVED" ? "Approved" : "Requested Revision"} on ${updatedDeliverable.name}`,
      html: `
        <h2>Project: ${updatedDeliverable.project.name}</h2>
        <p>Deliverable: ${updatedDeliverable.name}</p>
        <p>Status: <strong>${action}</strong></p>
        <p>Feedback: ${feedback || "No additional feedback provided."}</p>
      `
    });
  }

  revalidatePath(`/portal/${portalToken}`);
  revalidatePath(`/portal/${portalToken}/deliverable/${deliverableId}`);
}
