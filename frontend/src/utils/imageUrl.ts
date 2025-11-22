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

