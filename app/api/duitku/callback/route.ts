import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const merchantCode = formData.get("merchantCode") as string;
    const amount = formData.get("amount") as string;
    const merchantOrderId = formData.get("merchantOrderId") as string;
    const signature = formData.get("signature") as string;
    const resultCode = formData.get("resultCode") as string;

    const settings = await prisma.agencySettings.findFirst();
    if (!settings?.duitkuApiKey) {
      return NextResponse.json({ error: "Missing Duitku Config" }, { status: 500 });
    }

    // Verify signature
    const signatureStr = `${merchantCode}${amount}${merchantOrderId}${settings.duitkuApiKey}`;
    const expectedSignature = crypto.createHash("md5").update(signatureStr).digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Bad Signature" }, { status: 400 });
    }

    if (resultCode === "00") {
      // Payment success
      await prisma.invoice.updateMany({
        where: { invoiceNumber: merchantOrderId },
        data: { status: "PAID" }
      });
      console.log(`Invoice ${merchantOrderId} marked as PAID via Duitku`);
    } else if (resultCode === "01") {
      // Payment failed
      console.log(`Invoice ${merchantOrderId} payment FAILED via Duitku`);
    }

    return NextResponse.json({ status: "OK" });
  } catch (error) {
    console.error("Duitku Callback Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
