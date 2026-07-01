"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createClient(formData: FormData) {
  const name = formData.get("name") as string;
  const companyName = formData.get("companyName") as string;
  const contactName = formData.get("contactName") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const phone = formData.get("phone") as string;

  await prisma.agencyClient.create({
    data: {
      name,
      companyName,
      contactName,
      contactEmail,
      phone,
    }
  });

  revalidatePath("/clients");
  redirect("/clients");
}

export async function updateClient(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const companyName = formData.get("companyName") as string;
  const contactName = formData.get("contactName") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const phone = formData.get("phone") as string;

  await prisma.agencyClient.update({
    where: { id },
    data: {
      name,
      companyName,
      contactName,
      contactEmail,
      phone,
    }
  });

  revalidatePath("/clients");
  redirect("/clients");
}

export async function deleteClient(id: string) {
  await prisma.agencyClient.delete({
    where: { id }
  });
  revalidatePath("/clients");
}
