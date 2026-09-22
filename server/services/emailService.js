import nodemailer from 'nodemailer';

let transporter = null;

const initTransporter = async () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransporter({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    console.log('[Email Service] Configured with custom SMTP host:', SMTP_HOST);
  } else {
    // In development without explicit SMTP, use an ethereal test account or console fallback
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('[Email Service] Initialized dev test mailer with Ethereal.');
    } catch (e) {
      console.warn('[Email Service] Ethereal initialization failed, using console fallback:', e.message);
      transporter = null;
    }
  }

  return transporter;
};

const getEmailTemplate = ({ title, preheader, name, message, code, footerNote }) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #0e0f12;
        color: #ecebe8;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
      .container {
        max-width: 520px;
        margin: 40px auto;
        background-color: #15171c;
        border: 1px solid #262a33;
        border-radius: 8px;
        overflow: hidden;
      }
      .header {
        padding: 28px 32px;
        border-bottom: 1px solid #262a33;
        display: flex;
        align-items: center;
      }
      .brand-badge {
        display: inline-block;
        width: 32px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        background-color: #cf6646;
        color: #ffffff;
        font-weight: 800;
        border-radius: 4px;
        font-size: 16px;
        margin-right: 12px;
      }
      .brand-title {
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: #ecebe8;
      }
      .body {
        padding: 32px;
      }
      .greeting {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
        color: #ecebe8;
      }
      .text {
        font-size: 14px;
        line-height: 1.6;
        color: #8e94a0;
        margin-bottom: 24px;
      }
      .code-container {
        background-color: #0e0f12;
        border: 1px solid #262a33;
        border-radius: 6px;
        padding: 20px;
        text-align: center;
        margin-bottom: 24px;
      }
      .otp-code {
        font-family: 'JetBrains Mono', 'Courier New', monospace;
        font-size: 32px;
        font-weight: 700;
        letter-spacing: 8px;
        color: #cf6646;
      }
      .expiry-notice {
        font-size: 12px;
        color: #8e94a0;
        margin-top: 8px;
      }
      .footer {
        padding: 20px 32px;
        border-top: 1px solid #262a33;
        font-size: 12px;
        color: #5a606e;
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <span class="brand-badge">V</span>
        <span class="brand-title">VOXA</span>
      </div>
      <div class="body">
        <div class="greeting">Hello ${name || 'there'},</div>
        <div class="text">${message}</div>
        <div class="code-container">
          <div class="otp-code">${code}</div>
          <div class="expiry-notice">This code expires in 10 minutes.</div>
        </div>
        <div class="text" style="font-size: 12px; margin-bottom: 0;">
          If you did not request this code, you can safely ignore this email. Never share this code with anyone.
        </div>
      </div>
      <div class="footer">
        ${footerNote || 'VOXA · Real-Time Communication Platform'}<br>
        Conversations that stay in motion.
      </div>
    </div>
  </body>
  </html>
  `;
};

// Send account verification OTP
export const sendVerificationEmail = async (email, name, otp) => {
  const subject = `Verify your VOXA account · [${otp}]`;
  const html = getEmailTemplate({
    title: 'Verify your VOXA account',
    name,
    message: 'Welcome to VOXA. Please enter the verification code below to confirm your email address and activate your workspace.',
    code: otp,
    footerNote: 'Account Registration Verification',
  });

  console.log(`\n==================================================`);
  console.log(`[VOXA Email] ✉ Verification Code for ${email}: ${otp}`);
  console.log(`==================================================\n`);

  try {
    const mailer = await initTransporter();
    if (mailer) {
      const from = process.env.EMAIL_FROM || '"VOXA Security" <no-reply@voxa.local>';
      const info = await mailer.sendMail({
        from,
        to: email,
        subject,
        html,
        text: `Welcome to VOXA. Your verification code is: ${otp}. It expires in 10 minutes.`,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Email Preview]: ${previewUrl}`);
      }
      return { success: true, previewUrl };
    }
  } catch (err) {
    console.error('[Email Service] Error sending verification email:', err.message);
  }

  return { success: true, loggedToConsole: true };
};

// Send Two-Factor Authentication (2FA) OTP
export const send2FAEmail = async (email, name, otp) => {
  const subject = `VOXA 2FA Security Code · [${otp}]`;
  const html = getEmailTemplate({
    title: 'Two-Factor Authentication Security Code',
    name,
    message: 'A sign-in attempt requires two-factor authentication. Please enter this 6-digit code to complete your login to VOXA.',
    code: otp,
    footerNote: 'Two-Factor Authentication Login Challenge',
  });

  console.log(`\n==================================================`);
  console.log(`[VOXA 2FA Email] 🛡 2FA Security Code for ${email}: ${otp}`);
  console.log(`==================================================\n`);

  try {
    const mailer = await initTransporter();
    if (mailer) {
      const from = process.env.EMAIL_FROM || '"VOXA Security" <security@voxa.local>';
      const info = await mailer.sendMail({
        from,
        to: email,
        subject,
        html,
        text: `Your VOXA 2FA security code is: ${otp}. It expires in 10 minutes.`,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Email Preview]: ${previewUrl}`);
      }
      return { success: true, previewUrl };
    }
  } catch (err) {
    console.error('[Email Service] Error sending 2FA email:', err.message);
  }

  return { success: true, loggedToConsole: true };
};

// Send 2FA Setup Activation Confirmation OTP
export const send2FAActivationEmail = async (email, name, otp) => {
  const subject = `Confirm 2FA Activation on VOXA · [${otp}]`;
  const html = getEmailTemplate({
    title: 'Confirm Two-Factor Authentication Setup',
    name,
    message: 'You requested to enable Two-Factor Authentication on your VOXA account. Please enter this verification code in Settings to confirm activation.',
    code: otp,
    footerNote: '2FA Activation Setup Confirmation',
  });

  console.log(`\n==================================================`);
  console.log(`[VOXA 2FA Setup] 🛡 2FA Activation Code for ${email}: ${otp}`);
  console.log(`==================================================\n`);

  try {
    const mailer = await initTransporter();
    if (mailer) {
      const from = process.env.EMAIL_FROM || '"VOXA Security" <security@voxa.local>';
      const info = await mailer.sendMail({
        from,
        to: email,
        subject,
        html,
        text: `Your VOXA 2FA activation code is: ${otp}. It expires in 10 minutes.`,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Email Preview]: ${previewUrl}`);
      }
      return { success: true, previewUrl };
    }
  } catch (err) {
    console.error('[Email Service] Error sending 2FA activation email:', err.message);
  }

  return { success: true, loggedToConsole: true };
};
