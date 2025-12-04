import mongoose from 'mongoose';
import { ContentPage } from '../models/ContentPage';
import dotenv from 'dotenv';

dotenv.config();

const warrantyPolicyContent = {
  slug: 'warranty-policy',
  title: 'Garantía Legal',
  content: `
    <h2>Garantía Legal | JSP Detailing</h2>
    <p>En JSP Detailing garantizamos plenamente tus derechos como consumidor en conformidad con la legislación chilena vigente (Ley N° 21.398), por lo que si alguno de los productos adquiridos en nuestra tienda presenta fallas de fabricación, defectos de materiales o no es apto para el uso al que está destinado dentro de los 6 meses siguientes a la fecha de recepción, tienes la libertad de ejercer tu derecho a la garantía legal eligiendo entre tres opciones: la reparación gratuita del producto, el cambio por uno nuevo o la devolución íntegra del dinero, siempre y cuando la falla no se deba a un uso indebido o descuido por parte del usuario; para hacer efectivo este beneficio, es indispensable que te comuniques directamente con nosotros a través de nuestro formulario de contacto o correo electrónico oficial presentando tu comprobante de compra (boleta o factura), tras lo cual coordinaremos la recepción del producto para su evaluación técnica y la ejecución de la solución que hayas seleccionado.</p>
  `,
  metaDescription: 'Garantía legal de productos en JSP Detailing según Ley N° 21.398 del consumidor.',
};

async function updateWarrantyPolicy() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const result = await ContentPage.findOneAndUpdate(
      { slug: warrantyPolicyContent.slug },
      warrantyPolicyContent,
      { upsert: true, new: true, runValidators: true }
    );

    console.log('✅ Warranty policy updated successfully!');
    console.log(`   Title: ${result.title}`);
    console.log(`   Slug: ${result.slug}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating warranty policy:', error);
    process.exit(1);
  }
}

updateWarrantyPolicy();

