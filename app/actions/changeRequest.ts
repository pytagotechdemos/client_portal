"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createCRSchema = z.object({
  projectId: z.string().min(1),
  requestedBy: z.string().min(1),
  description: z.string().min(1, "Description is required"),
  portalToken: z.string().optional(),
});

export async function createChangeRequest(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = createCRSchema.safeParse(rawData);

  if (!parsed.success) {
    throw new Error("Invalid form data");
  }

  const { projectId, requestedBy, description, portalToken } = parsed.data;

  await prisma.changeRequest.create({
    data: {
      projectId,
      requestedBy,
      description,
    }
  });

  if (portalToken) {
    revalidatePath(`/portal/${portalToken}`);
  }
  revalidatePath(`/projects/${projectId}`);
}

const updateCRSchema = z.object({
  changeRequestId: z.string().min(1),
  projectId: z.string().min(1),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "DISCUSSED"]),
  responseNote: z.string().optional(),
  respondedBy: z.string().min(1),
});

export async function updateChangeRequestStatus(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = updateCRSchema.safeParse(rawData);

  if (!parsed.success) {
    throw new Error("Invalid form data");
  }

  const { changeRequestId, projectId, status, responseNote, respondedBy } = parsed.data;

  await prisma.changeRequest.update({
    where: { id: changeRequestId },
    data: {
      status,
      responseNote,
      respondedBy,
      respondedAt: new Date(),
    }
  });

  revalidatePath(`/projects/${projectId}`);
}
