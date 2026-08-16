const fs = require('fs');
let envContent = fs.readFileSync('.env', 'utf8');

const dbUrl = "postgresql://postgres.lxcfyzokhhrsesjpmfqi:ass29en1ass29en@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const directUrl = "postgresql://postgres.lxcfyzokhhrsesjpmfqi:ass29en1ass29en@aws-0-eu-west-2.pooler.supabase.com:5432/postgres";

// Update or add DATABASE_URL
if (envContent.includes('DATABASE_URL=')) {
    envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL="${dbUrl}"`);
} else {
    envContent += `\nDATABASE_URL="${dbUrl}"`;
}

// Update or add DIRECT_URL
if (envContent.includes('DIRECT_URL=')) {
    envContent = envContent.replace(/DIRECT_URL=.*/, `DIRECT_URL="${directUrl}"`);
} else {
    envContent += `\nDIRECT_URL="${directUrl}"`;
}

fs.writeFileSync('.env', envContent);
console.log("Updated .env with Supabase URLs");
