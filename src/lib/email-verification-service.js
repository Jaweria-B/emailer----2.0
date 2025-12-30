// lib/email-verification-service.js
import nodemailer from "nodemailer";

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 465,
    secure: process.env.SMTP_SECURE || false, // true for 465 (SSL), false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Additional options for better compatibility
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false,
    },
    // dkim: true,
    debug: true,
    logger: true,
    from: `"Email Curator" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
  });
};

// Generate 6-digit verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email - UPDATED to support both types
export const sendVerificationEmail = async (
  email,
  code,
  name,
  verificationType = "registration"
) => {
  try {
    const transporter = createTransporter();
    // Different subject and content based on verification type
    const isLogin = verificationType === "login";
    const subject = isLogin
      ? "Your Email Curator Login Code"
      : "Verify Your EmailCurator Account";

    const title = isLogin
      ? "Login to Email Curator"
      : "Welcome to Email Curator!";

    const greeting = isLogin
      ? `Hi ${name}, here's your login code`
      : `Hi ${name}, verify your account to get started`;

    const instructions = isLogin
      ? "Please use the verification code below to complete your login:"
      : "Please use the verification code below to complete your registration:";

    const mailOptions = {
      from: `"EmailCurator" <${
        process.env.SMTP_FROM || process.env.SMTP_USER
      }>`,
      to: email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${title}</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">${greeting}</p>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                        ${instructions}
                      </p>
                      
                      <!-- Verification Code Box -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; display: inline-block;">
                              <p style="color: #667eea; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                ${code}
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Warning Text -->
                      <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0;">
                        This code will expire in 15 minutes. If you didn't request this ${
                          isLogin ? "login" : "verification"
                        }, please ignore this email.
                      </p>
                      
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="color: #999999; font-size: 12px; margin: 0;">
                        © 2025 EmailCurator. All rights reserved.
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
      text: `${title}\n\n${greeting}\n\nYour verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this ${
        isLogin ? "login" : "verification"
      }, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
};

// Rate limiting helper
export const isRateLimited = (attempts) => {
  return attempts >= 5; // Max 5 attempts
};
