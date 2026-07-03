"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DeliverableType } from "@prisma/client";
import { z } from "zod";

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

const updateDeliverableSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  name: z.string().min(1),
  type: z.nativeEnum(DeliverableType),
  assignedTo: z.string().optional(),
});

export async function updateDeliverable(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = updateDeliverableSchema.safeParse(rawData);

  if (!parsed.success) {
    throw new Error("Invalid form data");
  }

  const { id, projectId, name, type, assignedTo } = parsed.data;

  try {
    await prisma.deliverable.update({
      where: { id },
      data: { name, type, assignedTo: assignedTo || null }
    });
  } catch {
    throw new Error("Failed to update deliverable");
  }

  revalidatePath(`/projects/${projectId}`);
}
