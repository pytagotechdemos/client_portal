"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  clientName: z.string().min(1),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  clientPassword: z.string().min(6), // Ideally, remove this and use invite links
  startDate: z.string().pipe(z.coerce.date()),
  deadline: z.string().optional().transform(str => str ? new Date(str) : null),
});

export async function createProject(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = createProjectSchema.safeParse(rawData);

  if (!parsed.success) {
    console.error("Validation failed", parsed.error);
    throw new Error("Invalid form data");
  }

  const data = parsed.data;
  let newProjectId: string | undefined;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create or find Client
      let client = await tx.agencyClient.findFirst({
        where: { contactEmail: data.contactEmail }
      });
      
      if (!client) {
        client = await tx.agencyClient.create({
          data: {
            name: data.clientName,
            contactName: data.contactName,
            contactEmail: data.contactEmail,
          },
        });
      }

      // 2. Create Project
      const project = await tx.project.create({
        data: {
          name: data.name,
          description: data.description || null,
          startDate: data.startDate,
          deadline: data.deadline,
          clientId: client.id,
        },
      });
      
      newProjectId = project.id;

      // 3. Create or find User
      const hashedPassword = await bcrypt.hash(data.clientPassword, 10);
      let user = await tx.user.findUnique({
        where: { email: data.contactEmail }
      });
      
      if (!user) {
        user = await tx.user.create({
          data: {
            name: data.contactName,
            email: data.contactEmail,
            passwordHash: hashedPassword,
            role: "CLIENT",
            clientId: client.id
          }
        });
      } else {
        // If user exists, optionally update password if provided, but for safety we don't here.
      }

      // 4. Create Project Access
      await tx.projectAccess.create({
        data: {
          userId: user.id,
          projectId: project.id
        }
      });
      
      // 5. Send Welcome Email
      const portalUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/portal/${project.id}`;
      
      await sendEmail({
        to: data.contactEmail,
        subject: `Welcome to Pytagotech - Your Project Portal`,
        html: `
          <h1>Welcome ${data.contactName}!</h1>
          <p>Your project <strong>${data.name}</strong> has been created.</p>
          <p>You can track progress, review deliverables, and access files through your dedicated Client Portal:</p>
          <br/>
          <a href="${portalUrl}" style="padding: 10px 20px; background-color: #0F172A; color: white; text-decoration: none; border-radius: 5px;">Access Portal</a>
          <br/><br/>
          <p><em>For security reasons, your password is not included in this email. If you forgot it, please contact your project manager.</em></p>
        `
      });
    });
  } catch (error) {
    console.error("Failed to create project:", error);
    throw new Error("Internal Server Error");
  }

  if (newProjectId) {
    redirect(`/projects/${newProjectId}`);
  }
}
