import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const toEmail = process.env.CONTACT_TO_EMAIL || "aalwishewa@gmail.com";

  try {
    await transporter.sendMail({
      from: `"Lanka Map Contact" <${process.env.SMTP_USER}>`,
      replyTo: `"${name}" <${email}>`,
      to: toEmail,
      subject: `[Lanka Map] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#15803d;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">
            New message via Lanka Map
          </h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:14px;width:90px;">Name</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;">${name}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:14px;">Email</td>
              <td style="padding:6px 0;font-size:14px;">
                <a href="mailto:${email}" style="color:#15803d;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:14px;">Subject</td>
              <td style="padding:6px 0;font-size:14px;">${subject}</td>
            </tr>
          </table>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
            <p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message}</p>
          </div>
          <p style="margin-top:16px;font-size:12px;color:#9ca3af;">
            Sent from Lanka Map contact form · Reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact email failed:", err);
    return NextResponse.json(
      { error: "Failed to send email. Please try again later." },
      { status: 500 }
    );
  }
}
