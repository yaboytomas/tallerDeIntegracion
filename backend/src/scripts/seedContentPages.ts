import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ContentPage } from '../models/ContentPage';

// Load environment variables
dotenv.config();

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
      <h2>Garantía Legal (Ley 19.496)</h2>
      <p>Todos los productos cuentan con 3 meses de garantía legal según Ley 19.496 de Protección de los Derechos de los Consumidores.</p>
      
      <h2>Cobertura</h2>
      <p>La garantía cubre fallas de fabricación, defectos de materiales o cualquier desperfecto no atribuible al uso normal del producto.</p>
      
      <h2>Opciones de Garantía</h2>
      <p>En caso de falla comprobada, puedes elegir entre:</p>
      <ul>
        <li>Cambio del producto por uno nuevo</li>
        <li>Reparación del producto</li>
        <li>Devolución del dinero pagado</li>
      </ul>
      
      <h2>Cómo Hacer Efectiva la Garantía</h2>
      <p>Para gestionar la garantía, contáctanos con tu número de orden y evidencia fotográfica del problema a garantia@jspdetailing.cl.</p>
    `,
    metaDescription: 'Garantía legal de productos en JSP Detailing según Ley 19.496 del consumidor.',
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

async function seedContentPages() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check and create/update each content page
    for (const pageData of contentPages) {
      const existingPage = await ContentPage.findOne({ slug: pageData.slug });

      if (existingPage) {
        console.log(`✓ Content page "${pageData.slug}" already exists`);
      } else {
        await ContentPage.create(pageData);
        console.log(`✅ Created content page: ${pageData.slug}`);
      }
    }

    console.log('\n✅ Content pages seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding content pages:', error);
    process.exit(1);
  }
}

seedContentPages();

