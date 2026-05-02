#!/usr/bin/env node
// Usage: node hash-password.mjs <password> [secret]
// Generates the SHA-256 HMAC hash for use in AUTH_USER_* env vars.

import { createHmac } from 'node:crypto';

const password = process.argv[2];
const secret = process.argv[3] || process.env.AUTH_SECRET || 'change-me-in-production';

if (!password) {
  console.error('Usage: node hash-password.mjs <password> [auth_secret]');
  console.error('  password   — the plaintext password to hash');
  console.error('  auth_secret — optional, defaults to AUTH_SECRET env or fallback');
  process.exit(1);
}

const hash = createHmac('sha256', secret).update(password).digest('hex');

console.log('\n  Password hash generated!\n');
console.log(`  Hash: ${hash}`);
console.log(`\n  Add to .env like:`);
console.log(`  AUTH_USER_1="yourname:${hash}"\n`);
