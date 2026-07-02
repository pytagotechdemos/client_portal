"use server";

import React from "react";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { render } from "@react-email/components";
import NewInvoiceEmail from "@/emails/NewInvoiceEmail";

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

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true }
  });

  if (!project) throw new Error("Project not found");

  try {
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

    await prisma.invoice.create({
      data: {
        projectId,
        invoiceNumber,
        issueDate: new Date(),
        dueDate,
        items: JSON.parse(items),
        totalAmount,
        notes,
      }
    });

    const settings = await prisma.agencySettings.findFirst();
    const portalUrl = `${process.env.NEXTAUTH_URL}/portal/${project.portalToken}?tab=invoices`;

    const html = await render(
      React.createElement(NewInvoiceEmail, {
        clientName: project.client.contactName,
        projectName: project.name,
        invoiceNumber: invoiceNumber,
        totalAmount: totalAmount,
        dueDate: dueDate.toLocaleDateString(),
        portalUrl: portalUrl,
        agencyName: settings?.agencyName || "Pytagotech"
      })
    );

    await sendEmail({
      to: project.client.contactEmail,
      subject: `New Invoice from ${settings?.agencyName || "Pytagotech"}: ${invoiceNumber}`,
      html,
    });
  } catch {
    throw new Error("Failed to create invoice");
  }

  revalidatePath(`/projects/${projectId}`);
}

export async function deleteInvoice(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    await prisma.invoice.delete({ where: { id } });
    revalidatePath(`/projects/${invoice.projectId}`);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to delete invoice");
  }
}
export async function updateInvoice(formData: FormData) {
  const id = formData.get("id") as string;
  const projectId = formData.get("projectId") as string;
  const totalAmount = parseFloat(formData.get("totalAmount") as string);
  const status = formData.get("status") as InvoiceStatus;

  if (!id || !projectId || isNaN(totalAmount)) {
    throw new Error("Missing required fields");
  }

  await prisma.invoice.update({
    where: { id },
    data: { totalAmount, status }
  });

  revalidatePath("/projects");
  revalidatePath("/invoices");
}
