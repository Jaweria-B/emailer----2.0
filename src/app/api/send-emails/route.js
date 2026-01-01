// app/api/send-emails/route.js
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { sessionDb } from "@/lib/database";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createBatches = (array, batchSize) => {
  const batches = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
};

/**
 * Create a fresh nodemailer transporter
 */
const createTransporter = (smtpConfig) => {
  let transporterConfig;

  if (!smtpConfig.host || smtpConfig.host === "smtp.gmail.com") {
    transporterConfig = {
      service: "gmail",
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass,
      },
      pool: true,
      maxConnections: 1,
      maxMessages: 50,
      rateDelta: 1000,
      rateLimit: 5,
    };
  } else {
    transporterConfig = {
      host: smtpConfig.host,
      port: smtpConfig.port || 587,
      secure: smtpConfig.secure || false,
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      pool: true,
      maxConnections: 2,
      maxMessages: 50,
      rateDelta: 1000,
      rateLimit: 10,
    };

    if (smtpConfig.host.includes("hostinger.com")) {
      transporterConfig.secure = true;
      transporterConfig.port = smtpConfig.port || 465;
    } else if (
      smtpConfig.host.includes("outlook.com") ||
      smtpConfig.host.includes("hotmail.com")
    ) {
      transporterConfig.secure = false;
      transporterConfig.port = smtpConfig.port || 587;
      transporterConfig.requireTLS = true;
    } else if (smtpConfig.host.includes("yahoo.com")) {
      transporterConfig.secure = false;
      transporterConfig.port = smtpConfig.port || 587;
    }
  }

  return nodemailer.createTransport(transporterConfig);
};

export async function POST(request) {
  let transporter = null;

  try {
    const { emails, subject, body, smtpConfig, attachments } =
      await request.json();

    // ============================================
    // VALIDATE REQUEST DATA
    // ============================================

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "No email addresses provided" },
        { status: 400 }
      );
    }

    if (!subject || !body) {
      return NextResponse.json(
        { error: "Subject and body are required" },
        { status: 400 }
      );
    }

    if (
      !smtpConfig ||
      !smtpConfig.auth ||
      !smtpConfig.auth.user ||
      !smtpConfig.auth.pass
    ) {
      return NextResponse.json(
        { error: "SMTP configuration is required" },
        { status: 400 }
      );
    }

    // ============================================
    // CHECK SEND LIMITS (Authenticated Users Only)
    // ============================================

    const sessionToken = request.cookies.get("session_token")?.value;

    if (sessionToken) {
      const user = await sessionDb.findValid(sessionToken);

      if (user) {
        // Fetch user's send limit from users table
        const userData = await sql`
          SELECT 
            id,
            email,
            sends_per_email,
            current_package,
            generations_remaining
          FROM users
          WHERE id = ${user.id}
        `;

        if (userData.length === 0) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        const userLimits = userData[0];
        const recipientCount = emails.length;

        // Validate recipient count against limit
        if (recipientCount > userLimits.sends_per_email) {
          const packageInfo = userLimits.current_package
            ? `your ${userLimits.current_package} package`
            : "the free tier";

          console.log(
            `❌ Send limit exceeded for user ${user.id}: ${recipientCount} > ${userLimits.sends_per_email}`
          );

          return NextResponse.json(
            {
              error: `Recipient limit exceeded. You can send to ${userLimits.sends_per_email} recipients per email with ${packageInfo}.`,
              limit: userLimits.sends_per_email,
              requested: recipientCount,
              exceeded_by: recipientCount - userLimits.sends_per_email,
              upgrade_suggestion: !userLimits.current_package
                ? "Purchase a package to increase your recipient limit"
                : "Purchase a higher-tier package for more recipients per email",
            },
            { status: 403 }
          );
        }

        console.log(
          `✅ Send limit validated for user ${user.id}: ${recipientCount}/${userLimits.sends_per_email} recipients`
        );
      }
    } else {
      // Anonymous users can send (no limit check)
      console.log(
        `ℹ️ Anonymous user sending to ${emails.length} recipients (no limit)`
      );
    }

    // ============================================
    // CREATE AND VERIFY TRANSPORTER
    // ============================================

    transporter = createTransporter(smtpConfig);

    try {
      await transporter.verify();
      console.log("✅ SMTP connection verified successfully");
    } catch (verifyError) {
      console.error("❌ SMTP verification failed:", verifyError);
      return NextResponse.json(
        {
          error: "SMTP configuration verification failed",
          details: verifyError.message,
        },
        { status: 400 }
      );
    }

    // ============================================
    // SEND EMAILS IN BATCHES
    // ============================================

    const BATCH_SIZE = 20;
    const BATCH_DELAY = 5000; // 5 seconds
    const EMAIL_DELAY = 300; // 300ms
    const RECONNECT_AFTER = 50;

    const emailBatches = createBatches(emails, BATCH_SIZE);
    const results = [];
    let emailsSentCount = 0;

    console.log(
      `📧 Processing ${emails.length} emails in ${emailBatches.length} batches`
    );

    // Process each batch
    for (let batchIndex = 0; batchIndex < emailBatches.length; batchIndex++) {
      const batch = emailBatches[batchIndex];
      const batchNumber = batchIndex + 1;

      console.log(
        `📦 Processing batch ${batchNumber}/${emailBatches.length} (${batch.length} emails)`
      );

      // Recreate transporter periodically to avoid connection issues
      if (emailsSentCount > 0 && emailsSentCount % RECONNECT_AFTER === 0) {
        console.log("🔄 Recreating transporter connection...");
        await transporter.close();
        await delay(2000);
        transporter = createTransporter(smtpConfig);
        await transporter.verify();
        console.log("✅ Transporter reconnected");
      }

      // Process emails in current batch
      for (let emailIndex = 0; emailIndex < batch.length; emailIndex++) {
        const email = batch[emailIndex];

        try {
          const mailOptions = {
            from: `"${smtpConfig.fromName || ""}" <${smtpConfig.auth.user}>`,
            to: email,
            subject: subject,
            text: body,
            html: body.replace(/\n/g, "<br>"),
            attachments: attachments || [],
          };

          await transporter.sendMail(mailOptions);
          console.log(`✅ Email ${emailsSentCount + 1} sent to ${email}`);

          results.push({
            email: email,
            success: true,
            batch: batchNumber,
            batchPosition: emailIndex + 1,
            timestamp: new Date().toISOString(),
          });

          emailsSentCount++;
        } catch (error) {
          console.error(`❌ Error sending to ${email}:`, error.message);

          // Handle connection errors with retry
          if (
            error.message.includes("connection") ||
            error.message.includes("timeout")
          ) {
            console.log("🔄 Connection error, attempting reconnect...");

            try {
              await transporter.close();
              await delay(3000);
              transporter = createTransporter(smtpConfig);
              await transporter.verify();
              console.log("✅ Reconnection successful");

              // Retry sending this email
              try {
                await transporter.sendMail(mailOptions);
                console.log(`✅ Email sent to ${email} after retry`);

                results.push({
                  email: email,
                  success: true,
                  retried: true,
                  batch: batchNumber,
                  batchPosition: emailIndex + 1,
                  timestamp: new Date().toISOString(),
                });

                emailsSentCount++;
                continue;
              } catch (retryError) {
                console.error(`❌ Retry failed: ${retryError.message}`);
              }
            } catch (reconnectError) {
              console.error(
                `❌ Reconnection failed: ${reconnectError.message}`
              );
            }
          }

          // Log failure
          results.push({
            email: email,
            success: false,
            error: error.message,
            batch: batchNumber,
            batchPosition: emailIndex + 1,
            timestamp: new Date().toISOString(),
          });
        }

        // Delay between individual emails
        if (emailIndex < batch.length - 1) {
          await delay(EMAIL_DELAY);
        }
      }

      console.log(`✅ Batch ${batchNumber}/${emailBatches.length} completed`);

      // Delay between batches
      if (batchIndex < emailBatches.length - 1) {
        console.log(`⏳ Waiting ${BATCH_DELAY / 1000}s before next batch...`);
        await delay(BATCH_DELAY);
      }
    }

    // ============================================
    // RETURN RESULTS
    // ============================================

    const successfulEmails = results.filter((r) => r.success).length;
    const failedEmails = results.filter((r) => !r.success).length;

    console.log(`✅ Email sending completed:`);
    console.log(`   Successful: ${successfulEmails}`);
    console.log(`   Failed: ${failedEmails}`);
    console.log(`   Total: ${emails.length}`);

    return NextResponse.json({
      success: true,
      results: results,
      summary: {
        total: emails.length,
        successful: successfulEmails,
        failed: failedEmails,
        batches: emailBatches.length,
        batchSize: BATCH_SIZE,
      },
    });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    if (transporter) {
      await transporter.close();
      console.log("🔒 Transporter closed");
    }
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "This endpoint only accepts POST requests",
    },
    { status: 405 }
  );
}
