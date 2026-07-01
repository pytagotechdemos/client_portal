import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, projectId } = await req.json();

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const settings = await prisma.agencySettings.findFirst();
    
    if (!settings?.duitkuMerchantCode || !settings?.duitkuApiKey) {
      return NextResponse.json({ error: "Duitku is not configured in Settings" }, { status: 500 });
    }

    const merchantCode = settings.duitkuMerchantCode;
    const apiKey = settings.duitkuApiKey;
    const paymentAmount = Math.round(Number(invoice.totalAmount)); // Duitku amount is integer
    const paymentMethod = ""; // Empty string for UI popup
    const merchantOrderId = invoice.invoiceNumber;
    const productDetails = `Payment for Invoice ${invoice.invoiceNumber}`;
    const email = project.client.contactEmail;
    const phoneNumber = project.client.phone || "";
    const additionalParam = "";
    const merchantUserInfo = "";
    const customerVaName = project.client.name;
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/duitku/callback`;
    const returnUrl = `${process.env.NEXTAUTH_URL}/portal/${project.portalToken}/invoice/${invoice.id}?status=success`;
    const expiryPeriod = 1440; // 24 hours

    const signatureStr = `${merchantCode}${merchantOrderId}${paymentAmount}${apiKey}`;
    const signature = crypto.createHash("md5").update(signatureStr).digest("hex");

    const payload = {
      merchantCode,
      paymentAmount,
      paymentMethod,
      merchantOrderId,
      productDetails,
      additionalParam,
      merchantUserInfo,
      customerVaName,
      email,
      phoneNumber,
      itemDetails: [
        {
          name: productDetails,
          price: paymentAmount,
          quantity: 1
        }
      ],
      customerDetail: {
        firstName: project.client.contactName,
        lastName: "",
        email: email,
        phoneNumber: phoneNumber,
      },
      callbackUrl,
      returnUrl,
      signature,
      expiryPeriod
    };

    const isProduction = settings.duitkuEnv === "production";
    const endpoint = isProduction 
      ? "https://passport.duitku.com/webapi/api/merchant/v2/inquiry" 
      : "https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.statusCode === "00") {
      return NextResponse.json({ 
        paymentUrl: data.paymentUrl,
        reference: data.reference
      });
    } else {
      console.error("Duitku Error:", data);
      return NextResponse.json({ error: data.statusMessage }, { status: 400 });
    }
  } catch (error) {
    console.error("Error creating Duitku transaction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
