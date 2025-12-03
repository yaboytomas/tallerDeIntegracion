import nodemailer from 'nodemailer';

const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
// Use Resend's test domain if domain is not verified (only works for verified emails)
// Default to verified domain: jsp.zabotec.com
const emailFrom = process.env.EMAIL_FROM || 'noreply@jsp.zabotec.com';
const useResendTestDomain = process.env.USE_RESEND_TEST_DOMAIN === 'true';

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
    
    // Determine the actual FROM address to use
    const actualFrom = useResendTestDomain ? 'onboarding@resend.dev' : emailFrom;
    console.log(`📧 Email FROM address: ${actualFrom}${useResendTestDomain ? ' (Resend test domain)' : ''}`);
    console.log(`📧 Frontend URL: ${frontendURL}`);
    
    if (useResendTestDomain) {
      console.log(`⚠️  Using Resend test domain. This allows sending to any email address.`);
    } else {
      const domain = emailFrom.split('@')[1];
      console.log(`⚠️  IMPORTANT: Domain "${domain}" must be verified in Resend dashboard!`);
      console.log(`⚠️  If domain is not verified, Resend will only allow sending to your account email.`);
      console.log(`⚠️  The system will automatically retry with test domain if verification fails.`);
      console.log(`⚠️  To verify domain: https://resend.com/domains`);
    }
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
    // Use test domain only if explicitly configured, otherwise use the configured domain
    let actualFrom = useResendTestDomain ? 'onboarding@resend.dev' : emailFrom;
    
    try {
      console.log(`📧 Attempting to send email via Resend to ${to} from ${actualFrom}`);
      const result = await resend.emails.send({
        from: actualFrom,
        to,
        subject,
        html,
      });
      
      // Log the response for debugging
      console.log(`📧 Resend API response:`, JSON.stringify(result, null, 2));
      
      // Check if there's an error in the response
      if (result.error) {
        const errorMessage = result.error.message || JSON.stringify(result.error);
        const statusCode = result.error.statusCode;
        console.error('❌ Resend API returned an error:', result.error);
        
        // Check for the specific error about only sending to own email (domain not verified)
        if (statusCode === 403 && 
            (errorMessage.includes('You can only send testing emails to your own email address') ||
             errorMessage.includes('verify a domain'))) {
          console.error('🚨 CRITICAL: Domain is NOT verified in Resend!');
          console.error(`🚨 Current FROM address: ${actualFrom}`);
          console.error(`🚨 Attempted TO address: ${to}`);
          console.error('🚨 Resend only allows sending to your account email when domain is not verified.');
          console.error('');
          console.error('🔧 SOLUTION:');
          console.error('   1. Go to https://resend.com/domains');
          console.error('   2. Verify your domain: jsp.zabotec.com');
          console.error('   3. Make sure DNS records are correctly configured');
          console.error('   4. Wait for domain verification to complete');
          console.error('   5. Once verified, emails will work with noreply@jsp.zabotec.com');
          console.error('');
          console.error('⚠️  NOTE: The test domain (onboarding@resend.dev) only works if you have a verified domain.');
          console.error('⚠️  If domain is not verified, you can only send to your account email.');
          throw new Error(`Domain not verified in Resend. Please verify jsp.zabotec.com at https://resend.com/domains`);
        }
        
        // Check for other specific Resend errors
        if (errorMessage.includes('Invalid `to` field') || 
            errorMessage.includes('not verified') ||
            errorMessage.includes('domain not verified') ||
            errorMessage.includes('email not verified')) {
          console.error('🚨 CRITICAL: Email address or domain not verified in Resend!');
          console.error('🚨 This email will NOT be sent.');
          throw new Error(`Email not verified in Resend: ${to}`);
        }
        
        throw new Error(`Resend API error: ${errorMessage}`);
      }
      
      // Check if email was successfully queued
      if (result.data && result.data.id) {
        console.log(`✅ Email queued successfully with ID: ${result.data.id}`);
        console.log(`✅ Email will be sent from: ${actualFrom}`);
        console.log(`✅ Email will be sent to: ${to}`);
        return; // Success, exit early
      } else {
        console.warn('⚠️  Resend response missing email ID. Email may not have been sent.');
        throw new Error('Resend API did not return email ID');
      }
    } catch (error: any) {
      const errorMessage = error?.message || '';
      const statusCode = error?.statusCode || error?.response?.statusCode;
      
      // Check for the specific 403 error about only sending to own email
      if (statusCode === 403 && 
          (errorMessage.includes('You can only send testing emails to your own email address') ||
           errorMessage.includes('verify a domain'))) {
        console.error('🚨 CRITICAL: Domain is NOT verified in Resend!');
        console.error(`🚨 Current FROM address: ${actualFrom}`);
        console.error(`🚨 Attempted TO address: ${to}`);
        console.error('🚨 Resend only allows sending to your account email when domain is not verified.');
        console.error('');
        console.error('🔧 SOLUTION:');
        console.error('   1. Go to https://resend.com/domains');
        console.error('   2. Verify your domain: jsp.zabotec.com');
        console.error('   3. Make sure DNS records are correctly configured');
        console.error('   4. Wait for domain verification to complete');
        console.error('   5. Once verified, emails will work with noreply@jsp.zabotec.com');
        throw new Error(`Domain not verified in Resend. Please verify jsp.zabotec.com at https://resend.com/domains`);
      }
      
      console.error('❌ Error in Resend sendEmail:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        name: error?.name,
        statusCode: statusCode,
        response: error?.response,
      });
      throw error;
    }
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
    console.log('Email service not configured. Verification link:', `${frontendURL}/verificar-email?token=${token}`);
    return;
  }

  const verificationURL = `${frontendURL}/verificar-email?token=${token}`;

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
    const actualFrom = useResendTestDomain ? 'onboarding@resend.dev' : emailFrom;
    console.log(`📧 Preparing to send verification email to ${email}`);
    console.log(`📧 Using email service: ${resend ? 'Resend' : transporter ? 'Nodemailer' : 'None'}`);
    console.log(`📧 Email from address: ${actualFrom}${useResendTestDomain ? ' (Resend test domain)' : ''}`);
    console.log(`📧 Frontend URL: ${frontendURL}`);
    console.log(`📧 Verification URL: ${verificationURL}`);
    
    await sendEmail(email, 'Verifica tu correo electrónico - JSP Detailing', html);
    console.log(`✅ Verification email sent successfully to ${email}`);
  } catch (error: any) {
    console.error('❌ Error sending verification email:', error);
    console.error('❌ Error stack:', error?.stack);
    console.error('❌ Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.warn('⚠️  Registration completed but email sending failed. User can request resend.');
    // Don't throw - allow registration to complete even if email fails
    // The user can request a resend later
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

  const resetURL = `${frontendURL}/reestablecer-password/${token}`;

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
 * Send quotation request email to customer
 */
export async function sendQuotationRequestToCustomer(
  customerName: string,
  customerEmail: string,
  items: any[]
): Promise<void> {
  if (!resend && !transporter) {
    console.log('Email service not configured. Quotation request not sent.');
    return;
  }

  const itemsList = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.productName}${item.variantName ? ` - ${item.variantName}` : ''}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toLocaleString('es-CL')}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.subtotal.toLocaleString('es-CL')}</td>
        </tr>`
    )
    .join('');

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; }
        table { width: 100%; border-collapse: collapse; background-color: white; margin: 20px 0; }
        th { background-color: #f0f0f0; padding: 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #ddd; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; padding: 15px; background-color: white; border-radius: 5px; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Solicitud de Cotización Recibida</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${customerName}</strong>,</p>
          <p>Hemos recibido tu solicitud de cotización. Nuestro equipo la revisará y te contactará pronto con los detalles.</p>
          
          <h3>Productos solicitados:</h3>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th style="text-align: center;">Cantidad</th>
                <th style="text-align: right;">Precio Unit.</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>
          
          <div class="total">
            Total estimado: $${total.toLocaleString('es-CL')} CLP (IVA incluido)
          </div>
          
          <p style="margin-top: 30px;">Te contactaremos dentro de las próximas <strong>24 horas</strong> con la cotización detallada y opciones de envío.</p>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        </div>
        <div class="footer">
          <p>Gracias por confiar en JSP Detailing</p>
          <p>© ${new Date().getFullYear()} JSP Detailing. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail(customerEmail, 'Solicitud de Cotización Recibida - JSP Detailing', html);
    console.log(`✅ Quotation confirmation sent to ${customerEmail}`);
  } catch (error) {
    console.error('❌ Error sending quotation email to customer:', error);
  }
}

/**
 * Send quotation request notification to admin
 */
export async function sendQuotationRequestToAdmin(
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  customerMessage: string,
  items: any[]
): Promise<void> {
  if (!resend && !transporter) {
    console.log('Email service not configured. Admin notification not sent.');
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@jspdetailing.cl';

  const itemsList = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.productName}${item.variantName ? ` - ${item.variantName}` : ''}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toLocaleString('es-CL')}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.subtotal.toLocaleString('es-CL')}</td>
        </tr>`
    )
    .join('');

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .customer-info { background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #dc3545; }
        table { width: 100%; border-collapse: collapse; background-color: white; margin: 20px 0; }
        th { background-color: #f0f0f0; padding: 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #ddd; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; padding: 15px; background-color: white; border-radius: 5px; }
        .message-box { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Nueva Solicitud de Cotización</h1>
        </div>
        <div class="content">
          <h3>Información del Cliente:</h3>
          <div class="customer-info">
            <p><strong>Nombre:</strong> ${customerName}</p>
            <p><strong>Email:</strong> <a href="mailto:${customerEmail}">${customerEmail}</a></p>
            <p><strong>Teléfono:</strong> <a href="tel:${customerPhone}">${customerPhone}</a></p>
          </div>
          
          ${customerMessage ? `
          <h3>Mensaje del Cliente:</h3>
          <div class="message-box">
            <p>${customerMessage}</p>
          </div>
          ` : ''}
          
          <h3>Productos solicitados:</h3>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th style="text-align: center;">Cantidad</th>
                <th style="text-align: right;">Precio Unit.</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>
          
          <div class="total">
            Total estimado: $${total.toLocaleString('es-CL')} CLP (IVA incluido)
          </div>
          
          <p style="margin-top: 30px;"><strong>⏰ Acción requerida:</strong> Contactar al cliente dentro de las próximas 24 horas.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail(adminEmail, `Nueva Cotización de ${customerName} - JSP Detailing`, html);
    console.log(`✅ Quotation notification sent to admin (${adminEmail})`);
  } catch (error) {
    console.error('❌ Error sending quotation notification to admin:', error);
  }
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmation(
  customerName: string,
  customerEmail: string,
  orderNumber: string,
  items: any[],
  total: number,
  shippingAddress: any
): Promise<void> {
  if (!resend && !transporter) {
    console.log('Email service not configured. Order confirmation not sent.');
    return;
  }

  const itemsList = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toLocaleString('es-CL')}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toLocaleString('es-CL')}</td>
        </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .order-number { background-color: white; padding: 15px; margin: 20px 0; text-align: center; border-radius: 5px; border: 2px solid #28a745; }
        table { width: 100%; border-collapse: collapse; background-color: white; margin: 20px 0; }
        th { background-color: #f0f0f0; padding: 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #ddd; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; padding: 15px; background-color: white; border-radius: 5px; }
        .shipping-info { background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #28a745; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Pedido Confirmado</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${customerName}</strong>,</p>
          <p>¡Gracias por tu pedido! Hemos recibido tu orden y la estamos procesando.</p>
          
          <div class="order-number">
            <p style="margin: 0; color: #666; font-size: 14px;">Número de Pedido</p>
            <h2 style="margin: 5px 0; color: #28a745;">${orderNumber}</h2>
          </div>
          
          <h3>Productos:</h3>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th style="text-align: center;">Cantidad</th>
                <th style="text-align: right;">Precio Unit.</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>
          
          <div class="total">
            Total: $${total.toLocaleString('es-CL')} CLP (IVA incluido)
          </div>
          
          <h3>Dirección de Envío:</h3>
          <div class="shipping-info">
            <p><strong>${shippingAddress.street} ${shippingAddress.number}</strong></p>
            ${shippingAddress.apartment ? `<p>Depto/Casa: ${shippingAddress.apartment}</p>` : ''}
            <p>${shippingAddress.comuna}, ${shippingAddress.region}</p>
            <p>Teléfono: ${shippingAddress.phone}</p>
          </div>
          
          <p>Te notificaremos cuando tu pedido sea despachado.</p>
          <p>Puedes seguir el estado de tu pedido en <a href="${frontendURL}/account/orders">tu cuenta</a>.</p>
        </div>
        <div class="footer">
          <p>Gracias por confiar en JSP Detailing</p>
          <p>© ${new Date().getFullYear()} JSP Detailing. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail(customerEmail, `Pedido Confirmado #${orderNumber} - JSP Detailing`, html);
    console.log(`✅ Order confirmation sent to ${customerEmail}`);
  } catch (error) {
    console.error('❌ Error sending order confirmation:', error);
  }
}

/**
 * Send contact form notification to admin
 */
export async function sendContactFormToAdmin(data: {
  type: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  preferredDate?: string;
  preferredTime?: string;
  address?: string;
  numberOfParticipants?: number;
}): Promise<void> {
  if (!resend && !transporter) {
    console.log('Email service not configured. Contact form notification not sent.');
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@jspdetailing.cl';

  const typeLabels: { [key: string]: { label: string; icon: string; color: string } } = {
    quote: { label: 'Cotización', icon: '💰', color: '#007bff' },
    pickup: { label: 'Agendar Retiro', icon: '🚚', color: '#28a745' },
    training: { label: 'Capacitación', icon: '🎓', color: '#ffc107' },
    general: { label: 'Consulta General', icon: '📧', color: '#6c757d' },
  };

  const typeInfo = typeLabels[data.type] || typeLabels.general;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${typeInfo.color}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .customer-info { background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid ${typeInfo.color}; }
        .message-box { background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${typeInfo.color}; }
        .details-box { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${typeInfo.icon} Nueva Solicitud: ${typeInfo.label}</h1>
        </div>
        <div class="content">
          <h3>Información del Cliente:</h3>
          <div class="customer-info">
            <p><strong>Nombre:</strong> ${data.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            <p><strong>Teléfono:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>
            ${data.company ? `<p><strong>Empresa:</strong> ${data.company}</p>` : ''}
          </div>
          
          <h3>Mensaje:</h3>
          <div class="message-box">
            <p>${data.message.replace(/\n/g, '<br>')}</p>
          </div>
          
          ${data.preferredDate || data.preferredTime || data.address || data.numberOfParticipants ? `
          <h3>Detalles Adicionales:</h3>
          <div class="details-box">
            ${data.preferredDate ? `<p><strong>Fecha Preferida:</strong> ${data.preferredDate}</p>` : ''}
            ${data.preferredTime ? `<p><strong>Hora Preferida:</strong> ${data.preferredTime}</p>` : ''}
            ${data.address ? `<p><strong>Dirección:</strong> ${data.address}</p>` : ''}
            ${data.numberOfParticipants ? `<p><strong>Número de Participantes:</strong> ${data.numberOfParticipants}</p>` : ''}
          </div>
          ` : ''}
          
          <p style="margin-top: 30px;"><strong>⏰ Acción requerida:</strong> Contactar al cliente dentro de las próximas 24 horas.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} JSP Detailing. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail(
      adminEmail,
      `${typeInfo.icon} Nueva ${typeInfo.label} de ${data.name} - JSP Detailing`,
      html
    );
    console.log(`✅ Contact form notification sent to admin (${adminEmail})`);
  } catch (error) {
    console.error('❌ Error sending contact form notification to admin:', error);
  }
}

/**
 * Send contact form confirmation to customer
 */
export async function sendContactFormConfirmation(data: {
  type: string;
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  if (!resend && !transporter) {
    console.log('Email service not configured. Contact form confirmation not sent.');
    return;
  }

  const typeLabels: { [key: string]: { label: string; icon: string; message: string } } = {
    quote: {
      label: 'Cotización',
      icon: '💰',
      message: 'Hemos recibido tu solicitud de cotización. Nuestro equipo de ventas revisará tu solicitud y te contactará dentro de las próximas 24 horas con una cotización personalizada.',
    },
    pickup: {
      label: 'Agendar Retiro',
      icon: '🚚',
      message: 'Hemos recibido tu solicitud para agendar un retiro. Nuestro equipo de logística se pondrá en contacto contigo dentro de las próximas 24 horas para coordinar la fecha y hora del retiro.',
    },
    training: {
      label: 'Capacitación',
      icon: '🎓',
      message: 'Hemos recibido tu solicitud de capacitación. Nuestro equipo de capacitación revisará tu solicitud y te contactará dentro de las próximas 24 horas para coordinar los detalles de la capacitación.',
    },
    general: {
      label: 'Consulta',
      icon: '📧',
      message: 'Hemos recibido tu consulta. Nuestro equipo revisará tu mensaje y te responderá dentro de las próximas 24 horas.',
    },
  };

  const typeInfo = typeLabels[data.type] || typeLabels.general;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; }
        .message-box { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
        .button { display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">${typeInfo.icon} Solicitud Recibida</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${data.name}</strong>,</p>
          <p>${typeInfo.message}</p>
          
          <div class="message-box">
            <p style="margin: 0; color: #666; font-style: italic;">"${data.message}"</p>
          </div>
          
          <p>Si tienes alguna pregunta adicional, no dudes en contactarnos:</p>
          <ul>
            <li>📧 Email: <a href="mailto:ventas@jspdetailing.cl">ventas@jspdetailing.cl</a></li>
            <li>📱 Teléfono: +56 9 1234 5678</li>
          </ul>
          
          <p style="text-align: center;">
            <a href="${frontendURL}" class="button">Visitar Nuestro Sitio</a>
          </p>
        </div>
        <div class="footer">
          <p>Gracias por confiar en JSP Detailing</p>
          <p>© ${new Date().getFullYear()} JSP Detailing. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail(
      data.email,
      `${typeInfo.icon} Solicitud de ${typeInfo.label} Recibida - JSP Detailing`,
      html
    );
    console.log(`✅ Contact form confirmation sent to ${data.email}`);
  } catch (error) {
    console.error('❌ Error sending contact form confirmation:', error);
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

