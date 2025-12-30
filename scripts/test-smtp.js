const nodemailer = require('nodemailer');
// Try to load dotenv if available
try {
    require('dotenv').config({ path: '.env' });
} catch (e) {
    // Ignore if dotenv is not found, assume preloaded or Node --env-file
}

// Check for required env vars
const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASSWORD;

console.log('Testing SMTP Connection...');
console.log('Loaded Configuration:');
console.log('SMTP_HOST:', host);
console.log('SMTP_USER:', user, `(Length: ${user ? user.length : 0})`);

if (pass) {
    console.log('SMTP_PASSWORD Length:', pass.length);
    const hex = Buffer.from(pass).toString('hex');
    console.log('SMTP_PASSWORD Hex:', hex); // Safe to print hex for debugging structure

    // Check for suspicious characters
    if (pass.includes(';') || pass.includes('#') || pass.includes(' ')) {
        console.log('⚠️  WARNING: Password contains special characters (; # space). Ensure it is wrapped in quotes in .env if using a parser that needs it.');
    }
} else {
    console.log('SMTP_PASSWORD: [MISSING]');
}

if (!user || !pass) {
    console.error('❌ Error: SMTP_USER or SMTP_PASSWORD not set in environment.');
    process.exit(1);
}

const configs = [
    {
        port: 465,
        secure: true,
        name: 'Port 465 (SSL/TLS)'
    },
    {
        port: 587,
        secure: false, // STARTTLS
        name: 'Port 587 (STARTTLS)'
    }
];

async function testConnections() {
    for (const config of configs) {
        console.log(`\nTesting ${config.name}...`);

        const transporter = nodemailer.createTransport({
            host: host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: user,
                pass: pass,
            },
            tls: {
                rejectUnauthorized: false
            },
            debug: true,
            logger: true
        });

        try {
            await transporter.verify();
            console.log(`✅ Success on ${config.name}: Server is ready to take our messages`);
            return; // Exit after first success
        } catch (error) {
            console.error(`❌ Failed on ${config.name}:`);
            console.error(`   Code: ${error.code}`);
            console.error(`   Response: ${error.response}`);
        }
    }
    console.log('\n❌ All connection attempts failed. Please verify your credentials.');
}

testConnections();
