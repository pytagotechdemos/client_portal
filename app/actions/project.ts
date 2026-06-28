"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email";

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

  const hashedPassword = await bcrypt.hash(clientPassword, 10);

  // 3. Create ClientAccess for the portal
  await prisma.clientAccess.create({
    data: {
      clientId: client.id,
      projectId: project.id,
      email: contactEmail,
      passwordHash: hashedPassword,
    },
  });

  // 4. Send Welcome Email
  const portalUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/portal/${project.id}`;
  
  await sendEmail({
    to: contactEmail,
    subject: `Welcome to Studio Volta - Your Project Portal`,
    html: `
      <h1>Welcome ${contactName}!</h1>
      <p>Your project <strong>${name}</strong> has been created.</p>
      <p>You can track progress, review deliverables, and access files through your dedicated Client Portal:</p>
      <br/>
      <a href="${portalUrl}" style="padding: 10px 20px; background-color: #0F172A; color: white; text-decoration: none; border-radius: 5px;">Access Portal</a>
      <br/><br/>
      <p><strong>Login Details:</strong></p>
      <p>Email: ${contactEmail}</p>
      <p>Password: ${clientPassword}</p>
    `
  });

  redirect(`/projects/${project.id}`);
}
