import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const createBatches = (array, batchSize) => {
  const batches = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
};

// Create a fresh transporter
const createTransporter = (smtpConfig) => {
  let transporterConfig;

  if (!smtpConfig.host || smtpConfig.host === 'smtp.gmail.com') {
    transporterConfig = {
      service: 'gmail',
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass,
      },
      pool: true, // Use connection pooling
      maxConnections: 1, // Limit to 1 connection for better stability
      maxMessages: 50, // Recreate connection after 50 messages
      rateDelta: 1000, // 1 second
      rateLimit: 5, // Max 5 emails per second
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
        rejectUnauthorized: false
      },
      pool: true,
      maxConnections: 2,
      maxMessages: 50,
      rateDelta: 1000,
      rateLimit: 10,
    };

    if (smtpConfig.host.includes('hostinger.com')) {
      transporterConfig.secure = true;
      transporterConfig.port = smtpConfig.port || 465;
    } else if (smtpConfig.host.includes('outlook.com') || smtpConfig.host.includes('hotmail.com')) {
      transporterConfig.secure = false;
      transporterConfig.port = smtpConfig.port || 587;
      transporterConfig.requireTLS = true;
    } else if (smtpConfig.host.includes('yahoo.com')) {
      transporterConfig.secure = false;
      transporterConfig.port = smtpConfig.port || 587;
    }
  }

  return nodemailer.createTransport(transporterConfig);
};

export async function POST(request) {
  let transporter = null;
  
  try {
    const { emails, subject, body, smtpConfig } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ message: 'No email addresses provided' }, { status: 400 });
    }

    if (!subject || !body) {
      return NextResponse.json({ message: 'Subject and body are required' }, { status: 400 });
    }

    if (!smtpConfig || !smtpConfig.auth || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
      return NextResponse.json({ message: 'SMTP configuration is required' }, { status: 400 });
    }

    // Create initial transporter
    transporter = createTransporter(smtpConfig);

    // Verify the transporter configuration
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return NextResponse.json({ 
        message: 'SMTP configuration verification failed',
        error: verifyError.message 
      }, { status: 400 });
    }

    // Adjusted configuration for Gmail limits
    const BATCH_SIZE = 20; // Smaller batches
    const BATCH_DELAY = 5000; // 5 second delay between batches
    const EMAIL_DELAY = 300; // 300ms delay between emails (safer)
    const RECONNECT_AFTER = 50; // Recreate transporter every 50 emails

    const emailBatches = createBatches(emails, BATCH_SIZE);
    const results = [];
    let emailsSentCount = 0;

    console.log(`Processing ${emails.length} emails in ${emailBatches.length} batches of ${BATCH_SIZE}`);

    // Process each batch
    for (let batchIndex = 0; batchIndex < emailBatches.length; batchIndex++) {
      const batch = emailBatches[batchIndex];
      const batchNumber = batchIndex + 1;
      
      console.log(`Processing batch ${batchNumber}/${emailBatches.length} with ${batch.length} emails`);

      // Recreate transporter periodically to avoid connection issues
      if (emailsSentCount > 0 && emailsSentCount % RECONNECT_AFTER === 0) {
        console.log('Recreating transporter connection...');
        await transporter.close();
        await delay(2000); // Wait 2 seconds before reconnecting
        transporter = createTransporter(smtpConfig);
        await transporter.verify();
        console.log('Transporter reconnected');
      }

      // Process emails in current batch
      for (let emailIndex = 0; emailIndex < batch.length; emailIndex++) {
        const email = batch[emailIndex];
        
        try {
          const mailOptions = {
            from: `"${smtpConfig.fromName || ''}" <${smtpConfig.auth.user}>`,
            to: email,
            subject: subject,
            text: body,
            html: body.replace(/\n/g, '<br>'),
          };

          await transporter.sendMail(mailOptions);
          console.log(`✓ Email ${emailsSentCount + 1} sent successfully to ${email}`);
          
          results.push({
            email: email,
            success: true,
            batch: batchNumber,
            batchPosition: emailIndex + 1,
            timestamp: new Date().toISOString()
          });

          emailsSentCount++;

        } catch (error) {
          console.error(`✗ Error sending email to ${email}:`, error.message);
          
          // Check if it's a connection error and try to reconnect
          if (error.message.includes('connection') || error.message.includes('timeout')) {
            console.log('Connection error detected, attempting to reconnect...');
            try {
              await transporter.close();
              await delay(3000);
              transporter = createTransporter(smtpConfig);
              await transporter.verify();
              console.log('Reconnection successful');
              
              // Retry sending this email
              try {
                await transporter.sendMail(mailOptions);
                console.log(`✓ Email sent successfully to ${email} after reconnect`);
                results.push({
                  email: email,
                  success: true,
                  retried: true,
                  batch: batchNumber,
                  batchPosition: emailIndex + 1,
                  timestamp: new Date().toISOString()
                });
                emailsSentCount++;
                continue;
              } catch (retryError) {
                console.error(`Failed again after retry: ${retryError.message}`);
              }
            } catch (reconnectError) {
              console.error(`Reconnection failed: ${reconnectError.message}`);
            }
          }
          
          results.push({
            email: email,
            success: false,
            error: error.message,
            batch: batchNumber,
            batchPosition: emailIndex + 1,
            timestamp: new Date().toISOString()
          });
        }

        // Add delay between individual emails
        if (emailIndex < batch.length - 1) {
          await delay(EMAIL_DELAY);
        }
      }

      console.log(`Batch ${batchNumber}/${emailBatches.length} completed`);

      // Add delay between batches (except after the last batch)
      if (batchIndex < emailBatches.length - 1) {
        console.log(`Waiting ${BATCH_DELAY / 1000} seconds before next batch...`);
        await delay(BATCH_DELAY);
      }
    }

    const successfulEmails = results.filter(r => r.success).length;
    const failedEmails = results.filter(r => !r.success).length;
    
    console.log(`Email sending completed: ${successfulEmails} successful, ${failedEmails} failed out of ${emails.length} total`);

    return NextResponse.json({
      results: results,
      summary: {
        total: emails.length,
        successful: successfulEmails,
        failed: failedEmails,
        batches: emailBatches.length,
        batchSize: BATCH_SIZE
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: error.message 
    }, { status: 500 });
  } finally {
    if (transporter) {
      await transporter.close();
      console.log('Transporter closed');
    }
  }
}

export async function GET() {
  return NextResponse.json({ message: 'GET method not supported for this endpoint' }, { status: 405 });
}