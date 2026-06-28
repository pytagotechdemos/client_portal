"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createProject(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const clientName = formData.get("clientName") as string;
  const contactName = formData.get("contactName") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const clientPassword = formData.get("clientPassword") as string;
  const startDate = new Date(formData.get("startDate") as string);
  const deadlineStr = formData.get("deadline") as string;
  const deadline = deadlineStr ? new Date(deadlineStr) : null;

  // 1. Create or find Client
  const client = await prisma.agencyClient.create({
    data: {
      name: clientName,
      contactName,
      contactEmail,
    },
  });

  // 2. Create Project
  const project = await prisma.project.create({
    data: {
      name,
      description,
      startDate,
      deadline,
      clientId: client.id,
    },
  });

  // 3. Create ClientAccess for the portal
  await prisma.clientAccess.create({
    data: {
      clientId: client.id,
      projectId: project.id,
      email: contactEmail,
      passwordHash: clientPassword, // In a real app, hash this with bcrypt!
    },
  });

  redirect(`/projects/${project.id}`);
}
