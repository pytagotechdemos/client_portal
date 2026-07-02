"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const clientSchema = z.object({
  name: z.string().min(1),
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  phone: z.string().min(1),
});

export async function createClient(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = clientSchema.safeParse(rawData);

  if (!parsed.success) {
    throw new Error("Invalid form data");
  }

  try {
    await prisma.agencyClient.create({
      data: parsed.data
    });
  } catch {
    throw new Error("Failed to create client");
  }

  revalidatePath("/clients");
  redirect("/clients");
}

export async function updateClient(id: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = clientSchema.safeParse(rawData);

  if (!parsed.success) {
    throw new Error("Invalid form data");
  }

  try {
    await prisma.agencyClient.update({
      where: { id },
      data: parsed.data
    });
  } catch {
    throw new Error("Failed to update client");
  }

  revalidatePath("/clients");
  redirect("/clients");
}

export async function deleteClient(id: string) {
  try {
    const existing = await prisma.agencyClient.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("Client not found");
    }
    await prisma.agencyClient.delete({
      where: { id }
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to delete client");
  }
  revalidatePath("/clients");
}
