import nodemailer from 'nodemailer';

const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
const emailFrom = process.env.EMAIL_FROM || 'noreply@jspdetailing.cl';

// Determine email provider
const useResend = !!process.env.RESEND_API_KEY;
const useNodemailer = !useResend && !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS;

let transporter: nodemailer.Transporter | null = null;
let resend: any = null;

// Configure Resend (for production on Render)
if (useResend) {
  try {
    const { Resend } = require('resend');
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log('📧 Email service configured: Resend');
  } catch (error) {
    console.error('❌ Resend package not installed. Run: npm install resend');
  }
}
// Configure Nodemailer (for local development)
else if (useNodemailer) {
  const emailPort = parseInt(process.env.EMAIL_PORT || '587', 10);
  const emailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: emailPort,
    secure: emailPort === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  };
  
  transporter = nodemailer.createTransport(emailConfig);
  console.log(`📧 Email service configured: Nodemailer (${emailConfig.auth.user})`);
}
else {
  console.warn('⚠️  Email configuration missing. Set RESEND_API_KEY or EMAIL_USER/EMAIL_PASS');
}

/**
 * Send email using configured provider
 */
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (resend) {
    // Resend
    await resend.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    });
  } else if (transporter) {
    // Nodemailer
    const sendPromise = transporter.sendMail({
      from: emailFrom,
      to,
      subject,
      html,
    });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email send timeout')), 10000)
    );
    await Promise.race([sendPromise, timeoutPromise]);
  } else {
    throw new Error('No email service configured');
  }
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(_userId: string, email: string, token: string): Promise<void> {
  if (!resend && !transporter) {
    console.log('Email service not configured. Verification link:', `${frontendURL}/auth/verify-email?token=${token}`);
    return;
  }

  const verificationURL = `${frontendURL}/auth/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Bienvenido a JSP Detailing</h1>
        <p>Gracias por registrarte. Por favor, verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
        <a href="${verificationURL}" class="button">Verificar correo</a>
        <p>O copia y pega este enlace en tu navegador:</p>
        <p>${verificationURL}</p>
        <p>Este enlace expirará en 24 horas.</p>
        <div class="footer">
          <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
          <p>© ${new Date().getFullYear()} JSP Detailing. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail(email, 'Verifica tu correo electrónico - JSP Detailing', html);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    console.warn('Registration completed but email sending failed. User can request resend.');
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(_userId: string, email: string, token: string): Promise<void> {
  if (!resend && !transporter) {
    console.log('Email service not configured. Reset link:', `${frontendURL}/auth/reset-password?token=${token}`);
    console.warn('⚠️  Email not sent - configure RESEND_API_KEY or EMAIL_USER/EMAIL_PASS');
    return;
  }

  const resetURL = `${frontendURL}/auth/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
        .warning { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Recuperar contraseña</h1>
        <p>Recibimos una solicitud para restablecer tu contraseña. Si no fuiste tú, ignora este correo.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <a href="${resetURL}" class="button">Restablecer contraseña</a>
        <p>O copia y pega este enlace en tu navegador:</p>
        <p>${resetURL}</p>
        <div class="warning">
          <p><strong>Importante:</strong> Este enlace expirará en 15 minutos por seguridad.</p>
        </div>
        <div class="footer">
          <p>Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña permanecerá sin cambios.</p>
          <p>© ${new Date().getFullYear()} JSP Detailing. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail(email, 'Recuperar contraseña - JSP Detailing', html);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    console.warn('Password reset request completed but email sending failed.');
  }
}

/**
 * Test email connection
 */
export async function testEmailConnection(): Promise<boolean> {
  if (resend) {
    // Resend doesn't need verification - API key is validated on first use
    return true;
  }
  
  if (!transporter) {
    return false;
  }

  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email connection test failed:', error);
    return false;
  }
}

