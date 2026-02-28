/**
 * Resend email client — singleton for server-side use in API routes only.
 * Set RESEND_API_KEY in your .env.local file.
 * Set RESEND_FROM in .env.local, e.g. "BanquetEase <no-reply@yourdomain.com>"
 */
import { Resend } from "resend";

let _resend = null;

export function getResend() {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key)
      throw new Error("RESEND_API_KEY is not set in environment variables");
    _resend = new Resend(key);
  }
  return _resend;
}

export const FROM_ADDRESS =
  process.env.RESEND_FROM || "BanquetEase <onboarding@resend.dev>";

/**
 * Build the HTML body for a staff onboarding email.
 */
export function buildOnboardingEmail({
  name,
  email,
  password,
  role,
  branchName,
  loginUrl,
}) {
  const roleLabel = role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to BanquetEase</title>
</head>
<body style="margin:0;padding:0;background:#f5f6fa;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#c8962b 0%,#f0c040 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">🎊 BanquetEase</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.88);font-size:14px;">Your event management platform</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:700;">Welcome aboard, ${name}! 👋</h2>
              <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
                Your <strong>${roleLabel}</strong> account has been created${branchName ? ` for <strong>${branchName}</strong>` : ""}. 
                Here are your login credentials — please change your password after your first login.
              </p>

              <!-- Credentials card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ff;border:1.5px solid #e8dff7;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#8e44ad;text-transform:uppercase;letter-spacing:0.8px;">Your Login Credentials</p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:5px 0;color:#777;font-size:14px;width:90px;">Email</td>
                        <td style="padding:5px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;color:#777;font-size:14px;">Password</td>
                        <td style="padding:5px 0;">
                          <code style="background:#fff;border:1px solid #e0d7f5;border-radius:6px;padding:3px 10px;font-size:14px;font-weight:700;color:#c8962b;letter-spacing:1px;">${password}</code>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;color:#777;font-size:14px;">Role</td>
                        <td style="padding:5px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${roleLabel}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#c8962b,#f0c040);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                      Log In to BanquetEase →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:13px;color:#999;text-align:center;">
                🔒 For security, please update your password immediately after logging in.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f5ff;padding:20px 40px;text-align:center;border-top:1px solid #ede9f7;">
              <p style="margin:0;font-size:12px;color:#aaa;">
                This email was sent by BanquetEase. If you did not expect this, please contact your branch manager.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
