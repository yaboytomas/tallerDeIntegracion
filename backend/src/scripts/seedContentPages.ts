import mongoose from 'mongoose';
import { ContentPage } from '../models/ContentPage';

const contentPages = [
  {
    slug: 'about',
    title: 'Quiénes Somos',
    content: `
      <h2>Nuestra Historia</h2>
      <p>JSP Detailing nació en 2016 en Santiago con la misión de acercar productos de alto desempeño a los detalladores chilenos. Desde entonces hemos ampliado nuestro catálogo a más de 300 SKU, con atención personalizada, capacitaciones y envíos a todo Chile.</p>
      
      <h2>Misión</h2>
      <p>Entregar soluciones profesionales de detailing con asesoría experta, disponibilidad inmediata y precios competitivos, cuidando cada vehículo como si fuera propio.</p>
      
      <h2>Visión</h2>
      <p>Ser la tienda referente en Chile para el cuidado estético automotriz, destacando por la excelencia en servicio, innovación y cumplimiento normativo.</p>
    `,
    metaDescription: 'Conoce la historia, misión y visión de JSP Detailing, tu tienda especializada en productos de detailing profesional en Chile.',
  },
  {
    slug: 'shipping-policy',
    title: 'Política de Envíos',
    content: `
      <h2>Cobertura</h2>
      <p>Realizamos despachos a todo Chile mediante Chilexpress, Starken, Bluexpress y Correos Chile.</p>
      
      <h2>Tiempos de Procesamiento</h2>
      <p>Los pedidos se procesan en un máximo de 48 horas hábiles. El tiempo de entrega dependerá de la región y comuna destino.</p>
      
      <h2>Costos</h2>
      <p>Los costos se calculan automáticamente según peso volumétrico y comuna, incluyendo IVA.</p>
      
      <h2>Seguimiento</h2>
      <p>Una vez despachado tu pedido, recibirás un número de seguimiento para rastrear tu envío.</p>
    `,
    metaDescription: 'Información sobre envíos, tiempos de entrega y costos de despacho en JSP Detailing.',
  },
  {
    slug: 'return-policy',
    title: 'Política de Devoluciones',
    content: `
      <h2>Plazo para Cambios y Devoluciones</h2>
      <p>Tienes 10 días corridos desde la recepción para solicitar cambios o devoluciones por satisfacción.</p>
      
      <h2>Condiciones</h2>
      <ul>
        <li>Los productos deben estar sin uso, sellados y con embalaje original.</li>
        <li>Debes presentar la boleta o factura de compra.</li>
        <li>Los productos en oferta o liquidación no tienen cambio ni devolución.</li>
      </ul>
      
      <h2>Costos de Envío</h2>
      <p>Los costos de transporte por retracto corren por cuenta del cliente, salvo fallas de origen.</p>
      
      <h2>Proceso</h2>
      <p>Contáctanos a postventa@jspdetailing.cl con tu número de pedido y motivo de devolución.</p>
    `,
    metaDescription: 'Política de cambios y devoluciones en JSP Detailing. Conoce tus derechos como consumidor.',
  },
  {
    slug: 'warranty-policy',
    title: 'Garantía Legal',
    content: `
      <h2>Garantía Legal | JSP Detailing</h2>
      <p>En JSP Detailing garantizamos plenamente tus derechos como consumidor en conformidad con la legislación chilena vigente (Ley N° 21.398), por lo que si alguno de los productos adquiridos en nuestra tienda presenta fallas de fabricación, defectos de materiales o no es apto para el uso al que está destinado dentro de los 6 meses siguientes a la fecha de recepción, tienes la libertad de ejercer tu derecho a la garantía legal eligiendo entre tres opciones: la reparación gratuita del producto, el cambio por uno nuevo o la devolución íntegra del dinero, siempre y cuando la falla no se deba a un uso indebido o descuido por parte del usuario; para hacer efectivo este beneficio, es indispensable que te comuniques directamente con nosotros a través de nuestro formulario de contacto o correo electrónico oficial presentando tu comprobante de compra (boleta o factura), tras lo cual coordinaremos la recepción del producto para su evaluación técnica y la ejecución de la solución que hayas seleccionado.</p>
    `,
    metaDescription: 'Garantía legal de productos en JSP Detailing según Ley N° 21.398 del consumidor.',
  },
  {
    slug: 'privacy-policy',
    title: 'Política de Privacidad',
    content: `
      <h2>Compromiso con la Privacidad</h2>
      <p>JSP Detailing cumple con la Ley 19.628 sobre protección de datos personales y la normativa vigente en Chile.</p>
      
      <h2>Datos que Recopilamos</h2>
      <ul>
        <li>Nombre completo y RUT</li>
        <li>Correo electrónico y teléfono</li>
        <li>Dirección de despacho</li>
        <li>Historial de compras</li>
      </ul>
      
      <h2>Uso de la Información</h2>
      <p>La información recopilada se utiliza exclusivamente para:</p>
      <ul>
        <li>Procesar pedidos y gestionar envíos</li>
        <li>Gestionar cuentas de usuario</li>
        <li>Enviar comunicaciones autorizadas (ofertas, novedades)</li>
        <li>Mejorar nuestros servicios</li>
      </ul>
      
      <h2>Tus Derechos</h2>
      <p>Puedes solicitar acceso, rectificación o eliminación de tus datos escribiendo a privacidad@jspdetailing.cl.</p>
      
      <h2>Seguridad</h2>
      <p>Implementamos medidas de seguridad técnicas y administrativas para proteger tu información personal.</p>
    `,
    metaDescription: 'Política de privacidad y protección de datos personales de JSP Detailing según Ley 19.628.',
  },
  {
    slug: 'terms-conditions',
    title: 'Términos y Condiciones',
    content: `
      <h2>Aceptación de Términos</h2>
      <p>Al comprar en nuestro sitio aceptas los presentes términos y condiciones de uso.</p>
      
      <h2>Precios y Pagos</h2>
      <ul>
        <li>Los precios están expresados en pesos chilenos (CLP) e incluyen IVA (19%).</li>
        <li>Nos reservamos el derecho de actualizar precios, promociones y stock sin previo aviso.</li>
        <li>El pago se considera efectuado cuando se confirme la transacción.</li>
      </ul>
      
      <h2>Disponibilidad de Productos</h2>
      <p>Todos los productos están sujetos a disponibilidad de stock. En caso de no contar con stock, nos comunicaremos contigo para ofrecer alternativas.</p>
      
      <h2>Uso del Sitio</h2>
      <p>Te comprometes a usar el sitio de manera lícita y a no realizar actividades fraudulentas o que perjudiquen a JSP Detailing o terceros.</p>
      
      <h2>Propiedad Intelectual</h2>
      <p>Todo el contenido del sitio (textos, imágenes, logos) es propiedad de JSP Detailing y está protegido por derechos de autor.</p>
      
      <h2>Jurisdicción</h2>
      <p>Estos términos se rigen por las leyes de la República de Chile. Cualquier controversia será resuelta en los tribunales de Santiago.</p>
    `,
    metaDescription: 'Términos y condiciones de uso del sitio web de JSP Detailing.',
  },
  {
    slug: 'cookie-policy',
    title: 'Política de Cookies',
    content: `
      <h2>¿Qué son las Cookies?</h2>
      <p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web.</p>
      
      <h2>Tipos de Cookies que Utilizamos</h2>
      
      <h3>Cookies Esenciales</h3>
      <p>Necesarias para el funcionamiento básico del sitio (carrito de compras, sesión de usuario). No puedes desactivarlas.</p>
      
      <h3>Cookies de Rendimiento</h3>
      <p>Nos ayudan a entender cómo los visitantes interactúan con el sitio mediante información anónima.</p>
      
      <h3>Cookies de Marketing (Opcionales)</h3>
      <p>Utilizadas para mostrarte anuncios relevantes y medir la efectividad de campañas publicitarias.</p>
      
      <h2>Administrar tus Preferencias</h2>
      <p>Puedes administrar tus preferencias de cookies en cualquier momento desde el banner de cookies o desde la configuración de tu navegador.</p>
      
      <h2>Consentimiento</h2>
      <p>Al aceptar cookies de marketing nos ayudas a ofrecerte una experiencia personalizada y mejorar nuestros servicios.</p>
    `,
    metaDescription: 'Política de uso de cookies en el sitio web de JSP Detailing.',
  },
];

// Export function for automatic seeding on server startup
export async function runContentPagesSeeder(): Promise<void> {
  console.log('🔄 Checking content pages...');
  try {
    // Ensure DB connection
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ MongoDB not connected yet. Skipping content pages seed.');
      return;
    }

    let createdCount = 0;
    let existingCount = 0;
    let updatedCount = 0;

    // Check and create/update each content page
    for (const pageData of contentPages) {
      const existingPage = await ContentPage.findOne({ slug: pageData.slug });

      if (existingPage) {
        // Special case: Update warranty-policy if it exists (to update the legal guarantee text)
        if (pageData.slug === 'warranty-policy') {
          const needsUpdate = 
            existingPage.title !== pageData.title ||
            existingPage.content !== pageData.content ||
            existingPage.metaDescription !== pageData.metaDescription;
          
          if (needsUpdate) {
            existingPage.title = pageData.title;
            existingPage.content = pageData.content;
            existingPage.metaDescription = pageData.metaDescription;
            await existingPage.save();
            console.log(`🔄 Updated content page: ${pageData.slug}`);
            updatedCount++;
          } else {
            existingCount++;
          }
        } else {
          existingCount++;
        }
      } else {
        await ContentPage.create(pageData);
        console.log(`✅ Created content page: ${pageData.slug}`);
        createdCount++;
      }
    }

    if (createdCount > 0 || updatedCount > 0) {
      const messages = [];
      if (createdCount > 0) messages.push(`Created ${createdCount} new pages`);
      if (updatedCount > 0) messages.push(`Updated ${updatedCount} pages`);
      console.log(`\n✅ Content pages seeding completed! ${messages.join(', ')}.`);
    } else {
      console.log(`✓ All ${existingCount} content pages already exist and are up to date.`);
    }
  } catch (error) {
    console.error('❌ Error seeding content pages:', error);
    // Don't exit process on error, just log it
  }
}

// Manual execution support (for npm run seed-content)
async function seedContentPagesManual() {
  try {
    const dotenv = await import('dotenv');
    dotenv.config();

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    await runContentPagesSeeder();

    console.log('\n✅ Manual seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding content pages:', error);
    process.exit(1);
  }
}

// Only run manual execution if this file is run directly
if (require.main === module) {
  seedContentPagesManual();
}

