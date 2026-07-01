"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addComment(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const content = formData.get("content") as string;
  const authorName = formData.get("authorName") as string;
  const authorRole = formData.get("authorRole") as string;
  const deliverableId = formData.get("deliverableId") as string | null;

  if (!content || content.trim() === "") return;

  await prisma.comment.create({
    data: {
      projectId,
      content,
      authorName,
      authorRole,
      deliverableId: deliverableId ? deliverableId : null,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/portal/[projectToken]`, "page");
}

export async function deleteComment(commentId: string, projectId: string) {
  await prisma.comment.delete({
    where: { id: commentId },
  });
  
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/portal/[projectToken]`, "page");
}
