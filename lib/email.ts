import { Resend } from "resend";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;

  if (process.env.NODE_ENV !== "production" || !apiKey) {
    console.log("==================================================");
    console.log(`📧 MOCK EMAIL SENT`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`CONTENT:\n${html.replace(/<[^>]*>?/gm, "")}`); // Strip HTML for console readability
    console.log("==================================================");
    if (!apiKey && process.env.NODE_ENV === "production") {
      console.warn("⚠️ Resend API Key is missing. Check your environment variables.");
    }
    return { success: true };
  }

  try {
    const resend = new Resend(apiKey);
    const data = await resend.emails.send({
      from: "Pytagotech <onboarding@resend.dev>", // Default resend testing email
      to,
      subject,
      html,
    });
    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
