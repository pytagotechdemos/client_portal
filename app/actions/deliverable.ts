"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DeliverableType } from "@prisma/client";

export async function deleteDeliverable(id: string) {
  try {
    const deliverable = await prisma.deliverable.findUnique({ where: { id } });
    if (!deliverable) {
      throw new Error("Deliverable not found");
    }
    await prisma.deliverable.delete({ where: { id } });
    revalidatePath(`/projects/${deliverable.projectId}`);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to delete deliverable");
  }
}
export async function updateDeliverable(formData: FormData) {
  const id = formData.get("id") as string;
  const projectId = formData.get("projectId") as string;
  const name = formData.get("name") as string;
  const type = formData.get("type") as DeliverableType;
  const assignedTo = formData.get("assignedTo") as string;

  if (!id || !projectId || !name || !type) {
    throw new Error("Missing required fields");
  }

  await prisma.deliverable.update({
    where: { id },
    data: { name, type, assignedTo: assignedTo || null }
  });

  revalidatePath(`/projects/${projectId}`);
}
