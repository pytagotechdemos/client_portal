"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateSettings(formData: FormData) {
  const agencyName = formData.get("agencyName") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const duitkuMerchantCode = formData.get("duitkuMerchantCode") as string;
  const duitkuApiKey = formData.get("duitkuApiKey") as string;
  const duitkuEnv = formData.get("duitkuEnv") as string;

  // We assume there's only one settings row.
  const existing = await prisma.agencySettings.findFirst();

  if (existing) {
    await prisma.agencySettings.update({
      where: { id: existing.id },
      data: {
        agencyName,
        contactEmail,
        duitkuMerchantCode,
        duitkuApiKey,
        duitkuEnv,
      }
    });
  } else {
    await prisma.agencySettings.create({
      data: {
        agencyName,
        contactEmail,
        duitkuMerchantCode,
        duitkuApiKey,
        duitkuEnv,
      }
    });
  }

  revalidatePath("/settings");
  revalidatePath("/");
}
