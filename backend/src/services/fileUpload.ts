import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = process.env.UPLOAD_DIR || './uploads';
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB default

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const subfolder = req.path.includes('/admin') ? 'admin' : 'public';
    const fullPath = path.join(uploadDir, subfolder);
    
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (_req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow images only
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, WebP, GIF)'));
  }
};

// Multer instance
export const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSize,
  },
  fileFilter,
});

/**
 * Get file URL for serving
 */
export function getFileURL(filename: string, subfolder: string = 'public'): string {
  return `/uploads/${subfolder}/${filename}`;
}

/**
 * Delete file 
 */
export function deleteFile(filename: string, subfolder: string = 'public'): void {
  const filePath = path.join(uploadDir, subfolder, filename);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Delete multiple files
 */
export function deleteFiles(filenames: string[], subfolder: string = 'public'): void {
  filenames.forEach(filename => deleteFile(filename, subfolder));
}

