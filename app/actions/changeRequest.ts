"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CRStatus } from "@prisma/client";

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

  try {
    const project = await prisma.project.findUnique({
      where: { id: parsed.data.projectId },
      select: { portalToken: true }
    });

    if (parsed.data.portalToken && project?.portalToken !== parsed.data.portalToken) {
      throw new Error("Invalid portal token");
    }

    await prisma.changeRequest.create({
      data: {
        projectId: parsed.data.projectId,
        requestedBy: parsed.data.requestedBy,
        description: parsed.data.description,
      }
    });
  } catch {
    throw new Error("Failed to create change request");
  }

  revalidatePath(`/projects/${parsed.data.projectId}`);
  
  if (parsed.data.portalToken) {
    revalidatePath(`/portal/${parsed.data.portalToken}`);
  }
}

export async function deleteChangeRequest(id: string, portalToken?: string) {
  try {
    const cr = await prisma.changeRequest.findUnique({ where: { id } });
    if (!cr) throw new Error("Not found");
    
    await prisma.changeRequest.delete({ where: { id } });
    revalidatePath(`/projects/${cr.projectId}`);
    if (portalToken) {
      revalidatePath(`/portal/${portalToken}`);
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to delete change request");
  }
}

export async function respondChangeRequest(id: string, responseNote: string, status: CRStatus) {
  try {
    const cr = await prisma.changeRequest.update({
      where: { id },
      data: {
        status,
        responseNote,
        respondedAt: new Date(),
      }
    });
    revalidatePath(`/projects/${cr.projectId}`);
  } catch {
    throw new Error("Failed to update change request");
  }
}

const updateCRSchema = z.object({
  changeRequestId: z.string().min(1),
  projectId: z.string().min(1),
  status: z.nativeEnum(CRStatus),
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

  try {
    await prisma.changeRequest.update({
      where: { id: changeRequestId },
      data: {
        status,
        responseNote,
        respondedBy,
        respondedAt: new Date(),
      }
    });
  } catch {
    throw new Error("Failed to update change request");
  }

  revalidatePath(`/projects/${projectId}`);
}

export async function updateChangeRequest(formData: FormData) {
  const id = formData.get("id") as string;
  const projectId = formData.get("projectId") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as CRStatus;
  const responseNote = formData.get("responseNote") as string;

  if (!id || !projectId || !description || !status) {
    throw new Error("Missing required fields");
  }

  await prisma.changeRequest.update({
    where: { id },
    data: { description, status, responseNote: responseNote || null }
  });

  revalidatePath("/projects");
}
