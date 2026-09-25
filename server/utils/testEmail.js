import dotenv from 'dotenv';
dotenv.config();

import { sendVerificationEmail } from '../services/emailService.js';

const testRecipient = process.argv[2] || process.env.SMTP_USER;

if (!testRecipient) {
  console.log('Usage: node utils/testEmail.js <recipient_email>');
  console.log('Example: node utils/testEmail.js mytest@gmail.com');
  process.exit(1);
}

console.log(`[Test Email] Sending a test verification OTP email to: ${testRecipient}...`);

try {
  const result = await sendVerificationEmail(testRecipient, 'VOXA Explorer', '849201');
  console.log('[Test Email] Result:', result);
  process.exit(0);
} catch (error) {
  console.error('[Test Email] Error:', error);
  process.exit(1);
}
