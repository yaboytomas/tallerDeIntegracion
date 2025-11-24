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

