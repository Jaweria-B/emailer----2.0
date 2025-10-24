import pkg from '@next/env';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const { loadEnvConfig } = pkg;
loadEnvConfig(process.cwd());

const sql = neon(process.env.DATABASE_URL);

async function setDefaultPasswords() {
  try {
    const defaultPassword = 'Password!123';
    const password_hash = bcrypt.hashSync(defaultPassword, 10);

    console.log('🔄 Updating users without passwords...');

    // Update users where password_hash is NULL OR empty string
    const result = await sql`
      UPDATE users
      SET password_hash = ${password_hash}, updated_at = CURRENT_TIMESTAMP
      WHERE password_hash IS NULL OR password_hash = '' OR LENGTH(password_hash) < 10
      RETURNING id, email, name
    `;

    console.log(`✅ Updated ${result.length} users with default password`);
    
    if (result.length > 0) {
      console.log('\nUpdated users:');
      result.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id}, Name: ${user.name})`);
      });
    } else {
      console.log('ℹ️  No users found without passwords');
    }

  } catch (error) {
    console.error('❌ Error updating passwords:', error);
    process.exit(1);
  }
}

setDefaultPasswords();