// scripts/check-users.js
import pkg from '@next/env';
import { neon } from '@neondatabase/serverless';

const { loadEnvConfig } = pkg;
loadEnvConfig(process.cwd());

const sql = neon(process.env.DATABASE_URL);

async function checkUsers() {
  try {
    console.log('🔍 Checking all users...\n');

    // Get all users
    const allUsers = await sql`SELECT id, email, name, password_hash FROM users ORDER BY id`;

    console.log(`Total users: ${allUsers.length}\n`);

    allUsers.forEach(user => {
      const passwordStatus = 
        user.password_hash === null ? '❌ NULL' :
        user.password_hash === '' ? '⚠️  EMPTY STRING' :
        user.password_hash.length < 10 ? '⚠️  TOO SHORT' :
        '✅ HAS PASSWORD';

      console.log(`ID: ${user.id} | ${user.email}`);
      console.log(`  Name: ${user.name || 'N/A'}`);
      console.log(`  Password: ${passwordStatus}`);
      console.log(`  Hash length: ${user.password_hash ? user.password_hash.length : 0}`);
      console.log('');
    });

    // Count users without passwords (NULL or empty)
    const usersWithoutPassword = await sql`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE password_hash IS NULL OR password_hash = ''
    `;

    console.log(`\n📊 Users without password: ${usersWithoutPassword[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUsers();