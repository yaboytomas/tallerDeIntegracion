/**
 * Get the full image URL
 * - If the image is already a full URL (Cloudinary), return as-is
 * - If it's a relative path (local storage), prepend the API URL
 */
export function getImageUrl(imagePath: string): string {
  if (!imagePath) return '';
  
  // Check if it's already a full URL (starts with http:// or https://)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // It's a relative path, prepend the API URL
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiUrl.replace('/api', ''); // Remove /api suffix if present
  
  return `${baseUrl}${imagePath}`;
}

/**
 * Optimize Cloudinary image URL for faster loading
 * Adds auto format, quality optimization, and responsive sizing
 */
export function getOptimizedImageUrl(imagePath: string, options?: {
  width?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif';
}): string {
  const url = getImageUrl(imagePath);
  
  if (!url) return '';
  
  // Only optimize Cloudinary URLs
  if (!url.includes('cloudinary.com')) {
    return url;
  }
  
  const { width, quality = 80, format = 'auto' } = options || {};
  
  // Insert optimization params into Cloudinary URL
  // Format: https://res.cloudinary.com/{cloud}/{resource_type}/upload/{transformations}/{version}/{public_id}.{format}
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  
  const transformations: string[] = [];
  
  // Auto format (WebP/AVIF)
  transformations.push(`f_${format}`);
  
  // Quality optimization
  transformations.push(`q_${quality}`);
  
  // Width (responsive)
  if (width) {
    transformations.push(`w_${width}`);
    transformations.push('c_limit'); // Don't upscale
  }
  
  // Progressive loading
  transformations.push('fl_progressive:steep');
  
  // Lazy load placeholder
  transformations.push('e_blur:1000'); // Will be removed when setting this param conditionally
  
  const optimizedUrl = `${parts[0]}/upload/${transformations.slice(0, -1).join(',')}/${parts[1]}`;
  
  return optimizedUrl;
}

