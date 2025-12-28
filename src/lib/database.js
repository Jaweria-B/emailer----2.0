// lib/database.js
import { neon } from "@neondatabase/serverless";

// Initialize connection
const sql = neon(process.env.DATABASE_URL);

// helper to get UUID in both Edge and Node environments
let _nodeCrypto;
async function generateUUID() {
  // Web Crypto is available in Edge runtime and modern Node (global `crypto`)
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
  } catch (e) {
    // ignore and fallback to dynamic import
  }

  // dynamic import of Node's crypto only when needed (Node runtime)
  if (!_nodeCrypto) {
    // eslint-disable-next-line no-undef
    _nodeCrypto = await import("crypto");
  }
  return _nodeCrypto.randomUUID();
}

// Initialize database tables
const initializeSchema = async () => {
  try {
    // ensure old plaintext column removed (safe to run repeatedly)
    await sql`ALTER TABLE users DROP COLUMN IF EXISTS password`;

    // Create users table with email_verified field and password_hash
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        company TEXT,
        job_title TEXT,
        password_hash TEXT,
        email_verified BOOLEAN DEFAULT FALSE,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create email_verification table (includes user_data for upsert convenience)
    await sql`
      CREATE TABLE IF NOT EXISTS email_verification (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        verification_code TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        attempts INTEGER DEFAULT 0,
        user_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(email)
      )
    `;

    // Create user_sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        session_token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;

    // Create email_activity table
    await sql`
      CREATE TABLE IF NOT EXISTS email_activity (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        email_subject TEXT,
        email_body TEXT,
        recipient TEXT,
        tone TEXT,
        ai_provider TEXT,
        purpose TEXT,
        priority TEXT,
        status TEXT DEFAULT 'generated',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;

    // Create user_api_keys table
    await sql`
      CREATE TABLE IF NOT EXISTS user_api_keys (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        provider TEXT NOT NULL,
        api_key TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id, provider)
      )
    `;

    // Create feedback table
    await sql`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        feedback_type TEXT NOT NULL,
        feedback_data TEXT NOT NULL,
        ai_provider TEXT,
        email_sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      )
    `;

    // Create anonymous_devices table
    await sql`
      CREATE TABLE IF NOT EXISTS anonymous_devices (
        id SERIAL PRIMARY KEY,
        device_id TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database tables:", error);
    throw error;
  }
};

// -----------------------
// Anonymous device operations
// -----------------------
export const anonymousDevicesDb = {
  create: async (deviceId) => {
    await sql`
      INSERT INTO anonymous_devices (device_id)
      VALUES (${deviceId})
      ON CONFLICT (device_id) DO NOTHING
    `;
  },

  findByDeviceId: async (deviceId) => {
    const result =
      await sql`SELECT * FROM anonymous_devices WHERE device_id = ${deviceId}`;
    return result[0] || null;
  },
};

// -----------------------
// User operations
// -----------------------
export const userDb = {
  create: async (userData) => {
    const uinfoKey = await generateUUID();

    const result = await sql`
      INSERT INTO users (name, email, company, job_title, password_hash, email_verified, status, uinfo_key)
      VALUES (${userData.name}, ${userData.email}, ${userData.company}, ${
      userData.job_title
    }, ${userData.password_hash || null}, FALSE, 'pending', ${uinfoKey})
      RETURNING id, uinfo_key
    `;
    return { lastInsertRowid: result[0].id, uinfo_key: result[0].uinfo_key };
  },

  findByEmail: async (email) => {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    return result[0] || null;
  },

  findById: async (id) => {
    const result = await sql`SELECT * FROM users WHERE id = ${id}`;
    return result[0] || null;
  },

  verifyEmail: async (email) => {
    const result = await sql`
      UPDATE users
      SET email_verified = TRUE, status = 'active', updated_at = CURRENT_TIMESTAMP
      WHERE email = ${email}
      RETURNING *
    `;
    return result[0] || null;
  },

  update: async (id, userData) => {
    const result = await sql`
      UPDATE users
      SET name = ${userData.name}, company = ${userData.company}, job_title = ${userData.job_title}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0] || null;
  },

  // Update Stripe customer ID for a user
  updateStripeCustomer: async (userId, stripeCustomerId) => {
    await sql`
        UPDATE users 
        SET 
        stripe_customer_id = ${stripeCustomerId},
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
    `;
    return true;
  },

  // Get user by Stripe customer ID
  findByStripeCustomer: async (stripeCustomerId) => {
    const result = await sql`
        SELECT * FROM users 
        WHERE stripe_customer_id = ${stripeCustomerId}
        LIMIT 1
    `;
    return result[0] || null;
  },
};

// -----------------------
// Email verification operations
// -----------------------
export const verificationDb = {
  create: async (email, code, userData, verificationType = "registration") => {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await sql`
      INSERT INTO email_verification (email, verification_code, expires_at, attempts, user_data, verification_type)
      VALUES (${email}, ${code}, ${expiresAt.toISOString()}, 0, ${
      userData ? JSON.stringify(userData) : null
    }, ${verificationType})
      ON CONFLICT (email)
      DO UPDATE SET
        verification_code = ${code},
        expires_at = ${expiresAt.toISOString()},
        attempts = 0,
        user_data = ${userData ? JSON.stringify(userData) : null},
        verification_type = ${verificationType},
        created_at = CURRENT_TIMESTAMP
    `;

    return true;
  },

  verify: async (email, code, verificationType = null) => {
    let result;

    if (verificationType) {
      // Verify with specific type
      result = await sql`
        SELECT * FROM email_verification
        WHERE email = ${email} 
          AND verification_code = ${code} 
          AND verification_type = ${verificationType}
          AND expires_at > NOW()
      `;
    } else {
      // Verify without type check (backward compatibility)
      result = await sql`
        SELECT * FROM email_verification
        WHERE email = ${email} 
          AND verification_code = ${code} 
          AND expires_at > NOW()
      `;
    }

    const verification = result[0] || null;
    if (verification && verification.user_data) {
      try {
        verification.user_data = JSON.parse(verification.user_data);
      } catch (e) {
        // ignore parse errors
      }
    }
    return verification;
  },

  incrementAttempts: async (email, verificationType = null) => {
    if (verificationType) {
      await sql`
        UPDATE email_verification
        SET attempts = attempts + 1
        WHERE email = ${email} AND verification_type = ${verificationType}
      `;
    } else {
      await sql`
        UPDATE email_verification
        SET attempts = attempts + 1
        WHERE email = ${email}
      `;
    }
  },

  delete: async (email, verificationType = null) => {
    if (verificationType) {
      await sql`DELETE FROM email_verification WHERE email = ${email} AND verification_type = ${verificationType}`;
    } else {
      await sql`DELETE FROM email_verification WHERE email = ${email}`;
    }
  },

  cleanExpired: async () => {
    const result =
      await sql`DELETE FROM email_verification WHERE expires_at <= NOW()`;
    return result;
  },
};

// -----------------------
// Session operations
// -----------------------
export const sessionDb = {
  create: async (userId) => {
    const sessionToken = await generateUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await sql`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES (${userId}, ${sessionToken}, ${expiresAt.toISOString()})
    `;

    return sessionToken;
  },

  findValid: async (sessionToken) => {
    const result = await sql`
      SELECT us.*, u.* FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.session_token = ${sessionToken} AND us.expires_at > NOW()
    `;
    return result[0] || null;
  },

  delete: async (sessionToken) => {
    const result =
      await sql`DELETE FROM user_sessions WHERE session_token = ${sessionToken}`;
    return result;
  },

  cleanExpired: async () => {
    const result =
      await sql`DELETE FROM user_sessions WHERE expires_at <= NOW()`;
    return result;
  },
};

// -----------------------
// Email activity operations
// -----------------------
export const emailActivityDb = {
  create: async (userId, emailData) => {
    const result = await sql`
      INSERT INTO email_activity
      (user_id, email_subject, email_body, recipient, tone, ai_provider, purpose, priority, status)
      VALUES (${userId}, ${emailData.subject}, ${emailData.body}, ${
      emailData.recipient
    }, ${emailData.tone}, ${emailData.ai_provider}, ${emailData.purpose}, ${
      emailData.priority
    }, ${emailData.status || "generated"})
    `;
    return result;
  },

  getByUser: async (userId, limit = 50) => {
    const result = await sql`
      SELECT * FROM email_activity
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return result;
  },

  updateStatus: async (id, status) => {
    const result =
      await sql`UPDATE email_activity SET status = ${status} WHERE id = ${id}`;
    return result;
  },

  getTotalCount: async () => {
    const result = await sql`SELECT COUNT(*) as count FROM email_activity`;
    return parseInt(result[0].count, 10);
  },
};

// -----------------------
// API Keys operations
// -----------------------
export const apiKeysDb = {
  upsert: async (userId, provider, apiKey) => {
    const existing =
      await sql`SELECT id FROM user_api_keys WHERE user_id = ${userId} AND provider = ${provider}`;
    if (existing.length > 0) {
      await sql`
        UPDATE user_api_keys
        SET api_key = ${apiKey}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId} AND provider = ${provider}
      `;
    } else {
      await sql`
        INSERT INTO user_api_keys (user_id, provider, api_key)
        VALUES (${userId}, ${provider}, ${apiKey})
      `;
    }
    return { success: true };
  },

  getByUser: async (userId) => {
    const result =
      await sql`SELECT provider, api_key FROM user_api_keys WHERE user_id = ${userId}`;
    const apiKeys = {};
    result.forEach((row) => {
      apiKeys[row.provider] = row.api_key;
    });
    return apiKeys;
  },

  delete: async (userId, provider) => {
    const result =
      await sql`DELETE FROM user_api_keys WHERE user_id = ${userId} AND provider = ${provider}`;
    return result;
  },
};

// -----------------------
// Feedback operations
// -----------------------
export const feedbackDb = {
  create: async (feedbackData) => {
    const result = await sql`
      INSERT INTO feedback
      (user_id, feedback_type, feedback_data, ai_provider, email_sent)
      VALUES (${feedbackData.user_id}, ${
      feedbackData.feedback_type
    }, ${JSON.stringify(feedbackData.feedback_data)}, ${
      feedbackData.ai_provider
    }, ${feedbackData.email_sent})
      RETURNING id
    `;
    return { id: result[0].id };
  },

  getByUser: async (userId, feedbackType = null, limit = 50) => {
    let query;
    if (feedbackType) {
      query = sql`
        SELECT * FROM feedback
        WHERE user_id = ${userId} AND feedback_type = ${feedbackType}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      query = sql`
        SELECT * FROM feedback
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }
    const result = await query;
    return result.map((row) => ({
      ...row,
      feedback_data: JSON.parse(row.feedback_data),
    }));
  },

  getAll: async (limit = 100, offset = 0) => {
    const result = await sql`
      SELECT f.*, u.name as user_name, u.email as user_email
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return result.map((row) => ({
      ...row,
      feedback_data: JSON.parse(row.feedback_data),
    }));
  },

  getStats: async () => {
    const totalFeedback = await sql`SELECT COUNT(*) as count FROM feedback`;
    const generationFeedback =
      await sql`SELECT COUNT(*) as count FROM feedback WHERE feedback_type = 'email_generation'`;
    const senderFeedback =
      await sql`SELECT COUNT(*) as count FROM feedback WHERE feedback_type = 'email_sender'`;

    return {
      total: totalFeedback[0].count,
      email_generation: generationFeedback[0].count,
      email_sender: senderFeedback[0].count,
    };
  },

  delete: async (id) => {
    const result = await sql`DELETE FROM feedback WHERE id = ${id}`;
    return result;
  },
};

// -----------------------
// Bulk email / templates / CSV schema + operations
// -----------------------
const initializeBulkEmailSchema = async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS bulk_email_campaigns (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        total_recipients INTEGER DEFAULT 0,
        emails_sent INTEGER DEFAULT 0,
        emails_failed INTEGER DEFAULT 0,
        status TEXT DEFAULT 'draft',
        agent_config TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS bulk_email_sends (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER NOT NULL,
        recipient_email TEXT NOT NULL,
        recipient_name TEXT,
        subject TEXT,
        email_body TEXT,
        personal_info TEXT,
        status TEXT DEFAULT 'pending',
        message_id TEXT,
        error_message TEXT,
        sent_at TIMESTAMP,
        opened_at TIMESTAMP,
        clicked_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES bulk_email_campaigns (id) ON DELETE CASCADE
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS csv_uploads (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        original_filename TEXT,
        file_size INTEGER,
        total_rows INTEGER DEFAULT 0,
        headers TEXT,
        status TEXT DEFAULT 'processed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS email_templates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        subject_template TEXT NOT NULL,
        body_template TEXT NOT NULL,
        variables TEXT,
        category TEXT DEFAULT 'general',
        is_public BOOLEAN DEFAULT FALSE,
        usage_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_user_id ON bulk_email_campaigns (user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_status ON bulk_email_campaigns (status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bulk_sends_campaign_id ON bulk_email_sends (campaign_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bulk_sends_status ON bulk_email_sends (status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_csv_uploads_user_id ON csv_uploads (user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates (user_id)`;

    console.log("Bulk email database schema initialized successfully");
  } catch (error) {
    console.error("Error initializing bulk email schema:", error);
    throw error;
  }
};

export const bulkEmailDb = {
  createCampaign: async (campaignData) => {
    if (!campaignData.user_id)
      throw new Error("user_id is required for creating a campaign");

    const result = await sql`
      INSERT INTO bulk_email_campaigns
      (user_id, name, description, total_recipients, agent_config, status)
      VALUES (${campaignData.user_id}, ${campaignData.name}, ${
      campaignData.description || ""
    }, ${campaignData.total_recipients || 0}, ${JSON.stringify(
      campaignData.agent_config || {}
    )}, ${campaignData.status || "draft"})
      RETURNING id
    `;
    return result[0].id;
  },

  getCampaignsByUser: async (userId, limit = 50) => {
    const result = await sql`
      SELECT *,
             (emails_sent + emails_failed) as processed_count,
             CASE WHEN total_recipients > 0 THEN ROUND((emails_sent::decimal / total_recipients) * 100, 2) ELSE 0 END as success_rate
      FROM bulk_email_campaigns
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return result.map((campaign) => ({
      ...campaign,
      agent_config: JSON.parse(campaign.agent_config || "{}"),
    }));
  },

  updateCampaign: async (campaignId, updateData) => {
    const updateFields = [];
    const values = [campaignId];
    Object.entries(updateData).forEach(([key, value], index) => {
      updateFields.push(`${key} = $${index + 2}`);
      values.push(value);
    });
    if (updateFields.length === 0) throw new Error("No fields to update");
    const query = `
      UPDATE bulk_email_campaigns
      SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await sql.unsafe(query, values);
    return result[0];
  },

  logEmailSend: async (sendData) => {
    const result = await sql`
      INSERT INTO bulk_email_sends
      (campaign_id, recipient_email, recipient_name, subject, email_body, personal_info, status, message_id, error_message, sent_at)
      VALUES (${sendData.campaign_id}, ${sendData.recipient_email}, ${
      sendData.recipient_name || ""
    }, ${sendData.subject || ""}, ${sendData.email_body || ""}, ${
      sendData.personal_info || "{}"
    }, ${sendData.status}, ${sendData.message_id || ""}, ${
      sendData.error_message || ""
    }, ${sendData.status === "sent" ? new Date().toISOString() : null})
      RETURNING id
    `;
    return result[0].id;
  },

  getCampaignDetails: async (campaignId) => {
    const campaign =
      await sql`SELECT * FROM bulk_email_campaigns WHERE id = ${campaignId}`;
    if (campaign.length === 0) return null;
    const sends =
      await sql`SELECT * FROM bulk_email_sends WHERE campaign_id = ${campaignId} ORDER BY created_at DESC`;
    const stats =
      await sql`SELECT status, COUNT(*) as count FROM bulk_email_sends WHERE campaign_id = ${campaignId} GROUP BY status`;

    return {
      ...campaign[0],
      agent_config: JSON.parse(campaign[0].agent_config || "{}"),
      sends: sends.map((send) => ({
        ...send,
        personal_info: JSON.parse(send.personal_info || "{}"),
      })),
      stats: stats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.count, 10);
        return acc;
      }, {}),
    };
  },

  deleteCampaign: async (campaignId, userId) => {
    const campaign =
      await sql`SELECT id FROM bulk_email_campaigns WHERE id = ${campaignId} AND user_id = ${userId}`;
    if (campaign.length === 0)
      throw new Error("Campaign not found or access denied");
    await sql`DELETE FROM bulk_email_sends WHERE campaign_id = ${campaignId}`;
    const result =
      await sql`DELETE FROM bulk_email_campaigns WHERE id = ${campaignId}`;
    return result;
  },
};

// CSV Upload operations
export const csvUploadDb = {
  create: async (uploadData) => {
    const result = await sql`
      INSERT INTO csv_uploads
      (user_id, filename, original_filename, file_size, total_rows, headers, status)
      VALUES (${uploadData.user_id}, ${uploadData.filename}, ${
      uploadData.original_filename
    }, ${uploadData.file_size}, ${uploadData.total_rows}, ${JSON.stringify(
      uploadData.headers
    )}, ${uploadData.status || "processed"})
      RETURNING id
    `;
    return result[0].id;
  },

  getByUser: async (userId, limit = 20) => {
    const result =
      await sql`SELECT * FROM csv_uploads WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${limit}`;
    return result.map((upload) => ({
      ...upload,
      headers: JSON.parse(upload.headers || "[]"),
    }));
  },
};

// Email Template operations
export const emailTemplateDb = {
  create: async (templateData) => {
    const result = await sql`
      INSERT INTO email_templates
      (user_id, name, description, subject_template, body_template, variables, category)
      VALUES (${templateData.user_id}, ${templateData.name}, ${
      templateData.description
    }, ${templateData.subject_template}, ${
      templateData.body_template
    }, ${JSON.stringify(templateData.variables || [])}, ${
      templateData.category || "general"
    })
      RETURNING id
    `;
    return result[0].id;
  },

  getByUser: async (userId, category = null) => {
    let query;
    if (category) {
      query = sql`SELECT * FROM email_templates WHERE user_id = ${userId} AND category = ${category} ORDER BY created_at DESC`;
    } else {
      query = sql`SELECT * FROM email_templates WHERE user_id = ${userId} ORDER BY created_at DESC`;
    }
    const result = await query;
    return result.map((template) => ({
      ...template,
      variables: JSON.parse(template.variables || "[]"),
    }));
  },

  getPublic: async (category = null, limit = 50) => {
    let query;
    if (category) {
      query = sql`SELECT * FROM email_templates WHERE is_public = TRUE AND category = ${category} ORDER BY usage_count DESC, created_at DESC LIMIT ${limit}`;
    } else {
      query = sql`SELECT * FROM email_templates WHERE is_public = TRUE ORDER BY usage_count DESC, created_at DESC LIMIT ${limit}`;
    }
    const result = await query;
    return result.map((template) => ({
      ...template,
      variables: JSON.parse(template.variables || "[]"),
    }));
  },

  incrementUsage: async (templateId) => {
    await sql`UPDATE email_templates SET usage_count = usage_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ${templateId}`;
  },
};

// Export the schema initializer for manual use
export { initializeSchema, initializeBulkEmailSchema };

// Add these functions to your existing database.js file

// -----------------------
// Subscription Plans operations
// -----------------------
export const subscriptionPlansDb = {
  getAll: async () => {
    const result =
      await sql`SELECT * FROM subscription_plans WHERE is_active = TRUE ORDER BY price_per_generation ASC`;
    return result;
  },

  getById: async (planId) => {
    const result =
      await sql`SELECT * FROM subscription_plans WHERE id = ${planId}`;
    return result[0] || null;
  },

  getByName: async (planName) => {
    const result =
      await sql`SELECT * FROM subscription_plans WHERE name = ${planName} AND is_active = TRUE`;
    return result[0] || null;
  },
};

// -----------------------
// User Subscriptions operations
// -----------------------
export const userSubscriptionsDb = {
  create: async (userId, planId, periodStart = null, periodEnd = null) => {
    const start = periodStart || new Date();
    const end =
      periodEnd || new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from start

    const result = await sql`
      INSERT INTO user_subscriptions 
      (user_id, plan_id, status, current_period_start, current_period_end)
      VALUES (${userId}, ${planId}, 'active', ${start.toISOString()}, ${end.toISOString()})
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        plan_id = ${planId},
        status = 'active',
        current_period_start = ${start.toISOString()},
        current_period_end = ${end.toISOString()},
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    return result[0];
  },

  getCurrent: async (userId) => {
    const result = await sql`
      SELECT 
        us.*,
        sp.name as plan_name,
        sp.generation_limit,
        sp.sends_per_email,
        sp.max_daily_sends,
        sp.has_branding,
        sp.currency
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ${userId} AND us.status = 'active'
      LIMIT 1
    `;
    return result[0] || null;
  },

  updateStatus: async (userId, status) => {
    const result = await sql`
      UPDATE user_subscriptions
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
      RETURNING *
    `;
    return result[0] || null;
  },

  cancel: async (userId) => {
    const result = await sql`
      UPDATE user_subscriptions
      SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
      RETURNING *
    `;
    return result[0] || null;
  },

  purchasePackage: async (userId, packageId) => {
    const pkg = await packagesDb.getById(packageId);

    if (!pkg) {
      throw new Error("Package not found");
    }

    const subscription = await userSubscriptionsDb.getCurrent(userId);

    if (!subscription || subscription.plan_name !== "Pro") {
      throw new Error("User must be on Pro plan to purchase packages");
    }

    const creditsInt = parseInt(pkg.credits, 10);
    const sendsPerEmailInt = parseInt(pkg.sends_per_email, 10);

    // Update subscription with new package
    const result = await sql`
      UPDATE user_subscriptions
      SET 
        package_id = ${packageId},
        package_generations_remaining = ${creditsInt},
        package_sends_per_email = ${sendsPerEmailInt},
        package_purchased_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
      RETURNING *
    `;

    // Reset usage counters AND reset last_send_date to NULL
    await sql`
      UPDATE email_usage
      SET 
        generations_count = 0,
        sends_count = 0,
        daily_sends_count = 0,
        last_send_date = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
        AND period_start <= NOW()
        AND period_end >= NOW()
    `;

    console.log(
      `✅ Package ${packageId} purchased by user ${userId}. Usage reset.`
    );

    return result[0];
  },

  // Get package details for a user
  getPackageDetails: async (userId) => {
    const result = await sql`
      SELECT 
        us.package_id,
        us.package_generations_remaining,
        us.package_sends_per_email,
        us.package_purchased_at,
        p.name as package_name,
        p.credits as package_total_credits,
        p.price as package_price
      FROM user_subscriptions us
      LEFT JOIN packages p ON us.package_id = p.id
      WHERE us.user_id = ${userId} AND us.status = 'active'
    `;
    return result[0] || null;
  },
};

// -----------------------
// Email Usage operations
// -----------------------
export const emailUsageDb = {
  getCurrent: async (userId) => {
    const result = await sql`
      SELECT * FROM email_usage
      WHERE user_id = ${userId} 
        AND period_start <= NOW() 
        AND period_end >= NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;
    return result[0] || null;
  },

  create: async (userId, subscriptionId, periodStart, periodEnd) => {
    const result = await sql`
      INSERT INTO email_usage 
      (user_id, subscription_id, generations_count, sends_count, daily_sends_count, period_start, period_end)
      VALUES (${userId}, ${subscriptionId}, 0, 0, 0, ${periodStart.toISOString()}, ${periodEnd.toISOString()})
      RETURNING *
    `;
    return result[0];
  },

  incrementGeneration: async (userId) => {
    const usage = await emailUsageDb.getCurrent(userId);
    if (!usage) {
      throw new Error("No active usage record found");
    }

    const subscription = await userSubscriptionsDb.getCurrent(userId);

    // Update generations count
    const result = await sql`
      UPDATE email_usage
      SET generations_count = generations_count + 1, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${usage.id}
      RETURNING *
    `;

    // If Pro plan, decrement package generations
    if (subscription.plan_name === "Pro" && subscription.package_id) {
      await sql`
        UPDATE user_subscriptions
        SET package_generations_remaining = GREATEST(package_generations_remaining - 1, 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
      `;
    }

    return result[0];
  },

  incrementSends: async (userId, sendCount = 1) => {
    const usage = await emailUsageDb.getCurrent(userId);
    if (!usage) {
      throw new Error("No active usage record found");
    }

    console.log(
      `\n📧 [incrementSends] Starting for user ${userId}, sendCount=${sendCount}`
    );
    console.log(
      `   Current state: daily_sends=${usage.daily_sends_count}, last_send_date=${usage.last_send_date}`
    );

    // Get today's date (date only, no time)
    const today = new Date();
    const todayDateOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Check if last_send_date is from today
    let dailySendsCount = usage.daily_sends_count || 0;

    if (usage.last_send_date) {
      const lastSendDate = new Date(usage.last_send_date);
      const lastSendDateOnly = new Date(
        lastSendDate.getFullYear(),
        lastSendDate.getMonth(),
        lastSendDate.getDate()
      );

      if (lastSendDateOnly.getTime() !== todayDateOnly.getTime()) {
        console.log(`   🔄 Different day detected. Resetting counter.`);
        dailySendsCount = 0;
      } else {
        console.log(`   ✅ Same day. Keeping counter.`);
      }
    } else {
      console.log(`   📅 No previous send date. Starting fresh.`);
      dailySendsCount = 0;
    }

    const newCount = dailySendsCount + sendCount;
    console.log(
      `   📈 New daily_sends_count will be: ${dailySendsCount} + ${sendCount} = ${newCount}`
    );

    const result = await sql`
      UPDATE email_usage
      SET 
        sends_count = sends_count + ${sendCount},
        daily_sends_count = ${newCount},
        last_send_date = CURRENT_DATE,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${usage.id}
      RETURNING *
    `;

    console.log(`   ✅ Database updated. Result:`, {
      daily_sends_count: result[0]?.daily_sends_count,
      last_send_date: result[0]?.last_send_date,
    });

    return result[0];
  },

  getStats: async (userId) => {
    const subscription = await userSubscriptionsDb.getCurrent(userId);
    if (!subscription) {
      return null;
    }

    const usage = await emailUsageDb.getCurrent(userId);

    // FREE PLAN
    if (subscription.plan_name === "Free") {
      const generationsUsed = usage ? usage.generations_count : 0;
      const sendsUsed = usage ? usage.sends_count : 0;

      return {
        plan_type: "free",
        plan_name: subscription.plan_name,
        generations_used: generationsUsed,
        generations_limit: subscription.generation_limit,
        generations_remaining: Math.max(
          0,
          subscription.generation_limit - generationsUsed
        ),
        sends_per_email: subscription.sends_per_email,
        sends_used: sendsUsed,
        period_end: subscription.current_period_end,
        has_branding: subscription.has_branding,
        currency: subscription.currency,
      };
    }

    // PRO PLAN
    else if (subscription.plan_name === "Pro") {
      const packageDetails = await userSubscriptionsDb.getPackageDetails(
        userId
      );
      const dailyStats = await emailUsageDb.getDailyStats(userId);

      console.log(`\n📊 [getStats] Pro plan for user ${userId}`);
      console.log(`   packageDetails:`, packageDetails);
      console.log(`   dailyStats:`, dailyStats);

      return {
        plan_type: "pro",
        plan_name: subscription.plan_name,
        package_id: packageDetails?.package_id || null,
        package_name: packageDetails?.package_name || null,
        package_generations_remaining:
          subscription.package_generations_remaining || 0,
        package_sends_per_email: subscription.package_sends_per_email || 0,
        package_purchased_at: subscription.package_purchased_at,
        max_daily_sends: subscription.max_daily_sends || 200,
        daily_sends_used: dailyStats?.sends_today || 0,
        daily_sends_remaining: Math.max(
          0,
          (subscription.max_daily_sends || 200) - (dailyStats?.sends_today || 0)
        ),
        period_end: subscription.current_period_end,
        has_branding: subscription.has_branding,
        currency: subscription.currency,
      };
    }

    return null;
  },

  getDailyStats: async (userId) => {
    const result = await sql`
      SELECT 
        daily_sends_count,
        last_send_date,
        CASE 
          WHEN last_send_date::DATE = CURRENT_DATE THEN daily_sends_count
          ELSE 0
        END as sends_today
      FROM email_usage
      WHERE user_id = ${userId}
        AND period_start <= NOW()
        AND period_end >= NOW()
      LIMIT 1
    `;

    console.log(`\n📅 [getDailyStats] Result for user ${userId}:`, result[0]);

    return (
      result[0] || {
        sends_today: 0,
        daily_sends_count: 0,
        last_send_date: null,
      }
    );
  },
};

// -----------------------
// Helper function to check if user can generate email
// -----------------------
export const checkEmailLimit = async (
  userId,
  action = "generation",
  sendCount = 1
) => {
  const subscription = await userSubscriptionsDb.getCurrent(userId);

  if (!subscription) {
    return {
      allowed: false,
      reason: "No active subscription found",
      remaining: 0,
    };
  }

  const usage = await emailUsageDb.getCurrent(userId);

  // Create usage record if doesn't exist
  if (!usage) {
    await emailUsageDb.create(
      userId,
      subscription.id,
      new Date(subscription.current_period_start),
      new Date(subscription.current_period_end)
    );
  }

  // ========== FREE PLAN ==========
  if (subscription.plan_name === "Free") {
    const generationsUsed = usage ? usage.generations_count : 0;
    const sendsUsed = usage ? usage.sends_count : 0;

    if (action === "generation") {
      const remaining = subscription.generation_limit - generationsUsed;
      return {
        allowed: remaining > 0,
        remaining: Math.max(0, remaining),
        limit: subscription.generation_limit,
        has_branding: subscription.has_branding,
        reason:
          remaining <= 0
            ? "Generation limit reached. Upgrade to Pro for more!"
            : null,
      };
    } else if (action === "send") {
      // Free users can send each email to 100 people
      // Check if total sends would exceed (generations × 100)
      const maxTotalSends = generationsUsed * subscription.sends_per_email;
      const remaining = maxTotalSends - sendsUsed;

      return {
        allowed: remaining >= sendCount,
        remaining: Math.max(0, remaining),
        limit: maxTotalSends,
        sends_per_email: subscription.sends_per_email,
        has_branding: subscription.has_branding,
        reason:
          remaining < sendCount
            ? `You can send to ${remaining} more recipients`
            : null,
      };
    }
  }

  // ========== PRO PLAN ==========
  else if (subscription.plan_name === "Pro") {
    if (action === "generation") {
      // Check if user has an active package
      if (
        !subscription.package_id ||
        !subscription.package_generations_remaining ||
        subscription.package_generations_remaining <= 0
      ) {
        return {
          allowed: false,
          remaining: 0,
          limit: 0,
          has_branding: subscription.has_branding,
          reason: "No active package. Please purchase a package to continue.",
          needs_package: true,
        };
      }

      return {
        allowed: true,
        remaining: subscription.package_generations_remaining,
        limit: 0, // No fixed limit, depends on package
        has_branding: subscription.has_branding,
        package_sends_per_email: subscription.package_sends_per_email,
      };
    } else if (action === "send") {
      // Check daily sending limit (200 max for Pro)
      const dailyStats = await emailUsageDb.getDailyStats(userId);
      const maxDailySends = subscription.max_daily_sends || 200;
      const dailySendsUsed = dailyStats.sends_today;
      const dailyRemaining = maxDailySends - dailySendsUsed;

      if (dailyRemaining < sendCount) {
        return {
          allowed: false,
          remaining: Math.max(0, dailyRemaining),
          limit: maxDailySends,
          has_branding: subscription.has_branding,
          reason:
            dailyRemaining > 0
              ? `Daily limit: You can only send to ${dailyRemaining} more recipients today`
              : "Daily sending limit of 200 reached. Try again tomorrow.",
        };
      }

      return {
        allowed: true,
        remaining: dailyRemaining,
        limit: maxDailySends,
        has_branding: subscription.has_branding,
      };
    }
  }

  return {
    allowed: false,
    reason: "Invalid plan configuration",
    remaining: 0,
  };
};

// -----------------------
// Helper to create default Free subscription for new users
// -----------------------
export const createDefaultSubscription = async (userId) => {
  try {
    // Get the Free plan
    const freePlan = await subscriptionPlansDb.getByName("Free");

    if (!freePlan) {
      throw new Error("Free plan not found in database");
    }

    // Create subscription
    const subscription = await userSubscriptionsDb.create(userId, freePlan.id);

    // Create initial usage record
    await emailUsageDb.create(
      userId,
      subscription.id,
      new Date(subscription.current_period_start),
      new Date(subscription.current_period_end)
    );

    return subscription;
  } catch (error) {
    console.error("Error creating default subscription:", error);
    throw error;
  }
};

// -----------------------
// Packages operations
// -----------------------
export const packagesDb = {
  getAll: async () => {
    const result = await sql`
      SELECT * FROM packages 
      WHERE is_active = TRUE 
      ORDER BY price ASC
    `;
    return result;
  },

  getById: async (packageId) => {
    const result = await sql`
      SELECT * FROM packages 
      WHERE id = ${packageId}
    `;
    return result[0] || null;
  },

  getByName: async (packageName) => {
    const result = await sql`
      SELECT * FROM packages 
      WHERE name = ${packageName} AND is_active = TRUE
    `;
    return result[0] || null;
  },
};
