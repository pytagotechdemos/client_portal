"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateSettingsSchema = z.object({
  agencyName: z.string().min(1),
  contactEmail: z.string().email(),
  logoUrl: z.string().optional(),
  primaryColor: z.string().optional(),
  duitkuMerchantCode: z.string().optional(),
  duitkuApiKey: z.string().optional(),
  duitkuEnv: z.string().optional(),
});

export async function updateSettings(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = updateSettingsSchema.safeParse(rawData);

  if (!parsed.success) {
    throw new Error("Invalid form data");
  }

  try {
    const existing = await prisma.agencySettings.findFirst();

    if (existing) {
      await prisma.agencySettings.update({
        where: { id: existing.id },
        data: parsed.data
      });
    } else {
      await prisma.agencySettings.create({
        data: parsed.data
      });
    }
  } catch {
    throw new Error("Failed to update settings");
  }

  revalidatePath("/settings");
  revalidatePath("/");
}
