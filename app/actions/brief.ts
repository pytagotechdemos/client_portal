"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createBriefSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  fileUrl: z.string().url("Must be a valid URL"),
  uploadedBy: z.string().min(1),
  portalToken: z.string().optional(),
});

export async function createBrief(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = createBriefSchema.safeParse(rawData);

  if (!parsed.success) {
    console.error("Validation failed", parsed.error);
    throw new Error("Invalid form data");
  }

  const { projectId, title, category, fileUrl, uploadedBy, portalToken } = parsed.data;

  try {
    await prisma.brief.create({
      data: {
        projectId,
        title,
        category,
        fileUrl,
        uploadedBy,
      }
    });

    if (portalToken) {
      revalidatePath(`/portal/${portalToken}`);
    }
    revalidatePath(`/projects/${projectId}`);
  } catch (error) {
    console.error("Failed to create brief:", error);
    throw new Error("Internal Server Error");
  }
}
