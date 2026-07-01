"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { z } from "zod";
import { ClientAction } from "@prisma/client";

const submitReviewSchema = z.object({
  deliverableId: z.string().min(1),
  versionId: z.string().min(1),
  action: z.enum(["APPROVED", "REVISION_REQUESTED", "APPROVED_WITH_TWEAKS"]),
  feedback: z.string().optional(),
  portalToken: z.string().min(1)
});

export async function submitReview(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = submitReviewSchema.safeParse(rawData);

  if (!parsed.success) {
    console.error("Validation failed", parsed.error);
    throw new Error("Invalid form data");
  }

  const { deliverableId, versionId, action, feedback, portalToken } = parsed.data;

  try {
    const updatedDeliverable = await prisma.$transaction(async (tx) => {
      // Update the version record
      await tx.deliverableVersion.update({
        where: { id: versionId },
        data: {
          clientAction: action as ClientAction,
          clientFeedback: feedback || null,
          clientFeedbackAt: new Date(),
        },
      });

      // Update the deliverable status
      // If APPROVED_WITH_TWEAKS, we can treat the overall status as APPROVED or a new status.
      // Since DeliverableStatus doesn't have APPROVED_WITH_TWEAKS, we'll map it to APPROVED 
      // but keep the action on the version record for context.
      const deliverableStatus = action === "APPROVED_WITH_TWEAKS" ? "APPROVED" : action;

      const updated = await tx.deliverable.update({
        where: { id: deliverableId },
        data: {
          status: deliverableStatus,
        },
        include: { project: true }
      });
      return updated;
    });

    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    });

    if (admin) {
      await sendEmail({
        to: admin.email,
        subject: `Client Feedback: ${action} on ${updatedDeliverable.name}`,
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
  } catch (error) {
    console.error("Failed to submit review:", error);
    throw new Error("Internal Server Error");
  }
}
