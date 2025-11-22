import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for products
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jspdetailing/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
  } as any,
});

// Cloudinary storage for categories
const categoryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jspdetailing/categories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  } as any,
});

// Cloudinary storage for banners
const bannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jspdetailing/banners',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1920, height: 800, crop: 'limit' }],
  } as any,
});

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB default

// File filter
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, WebP, GIF)'));
  }
};

// Multer instances for different upload types
export const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: maxFileSize },
  fileFilter,
});

export const uploadCategory = multer({
  storage: categoryStorage,
  limits: { fileSize: maxFileSize },
  fileFilter,
});

export const uploadBanner = multer({
  storage: bannerStorage,
  limits: { fileSize: maxFileSize },
  fileFilter,
});

/**
 * Delete image from Cloudinary
 */
export async function deleteCloudinaryImage(imageUrl: string): Promise<void> {
  try {
    // Extract public_id from Cloudinary URL
    // Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image.jpg
    const matches = imageUrl.match(/\/([^\/]+)\.(jpg|jpeg|png|webp|gif)$/);
    if (matches) {
      const publicId = imageUrl.split('/upload/')[1]?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
}

/**
 * Delete multiple images from Cloudinary
 */
export async function deleteCloudinaryImages(imageUrls: string[]): Promise<void> {
  await Promise.all(imageUrls.map(url => deleteCloudinaryImage(url)));
}

export { cloudinary };

