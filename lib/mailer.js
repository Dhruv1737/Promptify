import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ Mailer connection failed:", error.message);
  } else {
    console.log("✅ Mailer ready to send emails!");
  }
});

export async function sendVerificationEmail(name, email, token) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;

  const mailOptions = {
    from: `"Promptify AI Hub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "✅ Verify your Promptify account",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="520" cellpadding="0" cellspacing="0" 
                  style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;padding:40px;">
                  
                  <!-- Logo / Brand -->
                  <tr>
                    <td align="center" style="padding-bottom:24px;">
                      <span style="font-size:1.5rem;font-weight:800;color:#fff;letter-spacing:-0.5px;">
                         Promptify
                      </span>
                    </td>
                  </tr>

                  <!-- Heading -->
                  <tr>
                    <td align="center" style="padding-bottom:12px;">
                      <h1 style="margin:0;font-size:1.4rem;font-weight:700;color:#fff;">
                        Verify your email address
                      </h1>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td align="center" style="padding-bottom:32px;">
                      <p style="margin:0;font-size:0.95rem;color:#888;line-height:1.6;text-align:center;">
                        Hey ${name}! Thanks for signing up.<br/>
                        Click the button below to verify your email and activate your account.
                      </p>
                    </td>
                  </tr>

                  <!-- CTA Button -->
                  <tr>
                    <td align="center" style="padding-bottom:32px;">
                      <a href="${verifyUrl}"
                        style="display:inline-block;background:#6366f1;color:#fff;
                        text-decoration:none;padding:14px 36px;border-radius:10px;
                        font-weight:700;font-size:0.95rem;">
                        Verify My Account →
                      </a>
                    </td>
                  </tr>

                  <!-- Fallback link -->
                  <tr>
                    <td align="center" style="padding-bottom:24px;">
                      <p style="margin:0;font-size:0.75rem;color:#555;text-align:center;">
                        Button not working? Copy and paste this link:<br/>
                        <a href="${verifyUrl}" 
                          style="color:#6366f1;word-break:break-all;">
                          ${verifyUrl}
                        </a>
                      </p>
                    </td>
                  </tr>

                  <!-- Expiry notice -->
                  <tr>
                    <td align="center">
                      <p style="margin:0;font-size:0.75rem;color:#444;text-align:center;">
                        This link expires in <strong style="color:#666;">24 hours</strong>.<br/>
                        If you didn't create an account, ignore this email.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
