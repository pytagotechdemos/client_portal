"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
  await prisma.deliverable.update({
    where: { id: deliverableId },
    data: {
      status: action,
    },
  });

  revalidatePath(`/portal/${portalToken}`);
  revalidatePath(`/portal/${portalToken}/deliverable/${deliverableId}`);
}
