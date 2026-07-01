import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteDeliverable(id: string) {
  const deliverable = await prisma.deliverable.findUnique({ where: { id } });
  if (deliverable) {
    await prisma.deliverable.delete({ where: { id } });
    revalidatePath(`/projects/${deliverable.projectId}`);
  }
}
