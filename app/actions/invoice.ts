"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createInvoiceSchema = z.object({
  projectId: z.string().min(1),
  items: z.string().min(1), // JSON stringified array of items
  totalAmount: z.number().min(0),
  notes: z.string().optional(),
});

export async function createInvoice(formData: FormData) {
  const rawData = {
    projectId: formData.get("projectId") as string,
    items: formData.get("items") as string,
    totalAmount: parseFloat(formData.get("totalAmount") as string),
    notes: formData.get("notes") as string || undefined,
  };

  const parsed = createInvoiceSchema.safeParse(rawData);

  if (!parsed.success) {
    throw new Error("Invalid form data");
  }

  const { projectId, items, totalAmount, notes } = parsed.data;

  // Generate a random invoice number for MVP
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

  await prisma.invoice.create({
    data: {
      projectId,
      invoiceNumber,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      items: JSON.parse(items),
      totalAmount,
      notes,
    }
  });

  revalidatePath(`/projects/${projectId}`);
}
