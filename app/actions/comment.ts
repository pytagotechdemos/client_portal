"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const addCommentSchema = z.object({
  projectId: z.string().min(1),
  content: z.string().min(1),
  authorName: z.string().min(1),
  authorRole: z.string().min(1),
  deliverableId: z.string().optional().nullable(),
});

export async function addComment(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  if (rawData.deliverableId === "") {
    delete rawData.deliverableId;
  }
  
  const parsed = addCommentSchema.safeParse(rawData);

  if (!parsed.success) {
    throw new Error("Invalid form data");
  }

  const { projectId, content, authorName, authorRole, deliverableId } = parsed.data;

  try {
    await prisma.comment.create({
      data: {
        projectId,
        content,
        authorName,
        authorRole,
        deliverableId: deliverableId ? deliverableId : null,
      },
    });
  } catch {
    throw new Error("Failed to add comment");
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/portal/[projectToken]`, "page");
}

export async function deleteComment(commentId: string, projectId: string) {
  try {
    const existing = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!existing) {
      throw new Error("Comment not found");
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to delete comment");
  }
  
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/portal/[projectToken]`, "page");
}
