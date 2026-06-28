/**
 * Mock Email Utility for MVP
 * In production, replace the contents of sendEmail with a real provider 
 * like Resend, SendGrid, or Nodemailer.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (process.env.NODE_ENV !== "production") {
    console.log("==================================================");
    console.log(`📧 MOCK EMAIL SENT`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`CONTENT:\n${html.replace(/<[^>]*>?/gm, '')}`); // Strip HTML for console readability
    console.log("==================================================");
    return { success: true };
  }

  // TODO: Add real email provider logic here when deploying to production
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'Studio Volta <hello@studiovolta.com>',
  //   to,
  //   subject,
  //   html
  // });
  
  return { success: true };
}
