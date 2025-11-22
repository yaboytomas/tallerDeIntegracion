# 🖼️ Cloudinary Setup Guide

This guide will help you set up Cloudinary for image storage in your JSP Detailing e-commerce platform.

---

## 📋 Why Cloudinary?

- ✅ **Persistent Storage**: Unlike local file storage, images survive server restarts
- ✅ **CDN Delivery**: Fast image loading worldwide
- ✅ **Free Tier**: 25 GB storage + 25 GB bandwidth/month
- ✅ **Automatic Optimization**: Images are automatically optimized
- ✅ **Transformations**: Resize, crop, and format images on-the-fly

---

## 🚀 Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a **free account**
3. Verify your email address
4. Log in to your dashboard

---

## 🔑 Step 2: Get Your API Credentials

Once logged in to Cloudinary dashboard:

1. You'll see your **Account Details** on the dashboard
2. Copy these three values:
   - **Cloud Name**: `dxxxxxxxx`
   - **API Key**: `123456789012345`
   - **API Secret**: `xxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## ⚙️ Step 3: Add Environment Variables

### For Local Development:

Create/update `backend/.env`:

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### For Render (Production):

1. Go to your Render service
2. Click **"Environment"** tab
3. Add these environment variables:
   - `CLOUDINARY_CLOUD_NAME` = `your-cloud-name`
   - `CLOUDINARY_API_KEY` = `your-api-key`
   - `CLOUDINARY_API_SECRET` = `your-api-secret`
4. Click **"Save Changes"**

---

## 📁 Image Organization

Images are automatically organized in Cloudinary folders:

```
jspdetailing/
├── products/     (Product images - max 1200x1200px)
├── categories/   (Category images - max 800x800px)
└── banners/      (Banner images - max 1920x800px)
```

---

## ✅ Step 4: Verify It Works

### Test Locally:

1. Start your backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Login as admin
3. Go to Admin Panel → Products
4. Click "Nuevo Producto"
5. Upload an image
6. ✅ If successful, you'll see the Cloudinary URL in the product

### Test in Production:

After deploying to Render:
1. Go to your live site
2. Login as admin
3. Upload a product image
4. Check if the image displays correctly
5. ✅ The URL should start with `https://res.cloudinary.com/...`

---

## 🧹 Cloudinary Media Library

Access all your uploaded images:

1. Go to Cloudinary dashboard
2. Click **"Media Library"** in the left menu
3. Browse your `jspdetailing/` folders
4. You can manually delete, rename, or organize images here

---

## 🔄 Migration from Local Storage (Optional)

If you already have images in local storage:

1. Download all images from `backend/uploads/`
2. Upload them manually through the admin panel
3. Or use Cloudinary's bulk upload feature

---

## 💡 Tips

- **Image Format**: Upload JPG, PNG, WebP, or GIF
- **Max Size**: 5 MB per image (configurable)
- **Optimization**: Images are automatically compressed
- **Backup**: Cloudinary keeps your images safe
- **URL Format**: `https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/jspdetailing/products/image.jpg`

---

## 🆘 Troubleshooting

### Error: "Missing required configuration"

- Check that all three environment variables are set
- Restart your server after adding variables

### Error: "Invalid API Key"

- Double-check your API credentials in Cloudinary dashboard
- Make sure there are no extra spaces in the `.env` file

### Images not displaying

- Check browser console for CORS errors
- Verify the Cloudinary URLs are accessible
- Check if the image was successfully uploaded to Cloudinary Media Library

### "Disk quota exceeded" error

- You've reached your free tier limit (25 GB)
- Upgrade to a paid plan or delete old images

---

## 📚 Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Pricing](https://cloudinary.com/pricing)

---

**✅ Your images are now stored in the cloud and will persist across deployments!**

