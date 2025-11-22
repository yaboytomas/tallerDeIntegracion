# 🔐 Environment Variables

Add these environment variables to your `.env` file (local) or Render environment settings (production).

---

## Required Environment Variables

### Server Configuration
```bash
PORT=5000
NODE_ENV=development  # or 'production' on Render
```

### Database
```bash
MONGODB_URI=mongodb://localhost:27017/jspdetailing
# Production example: mongodb+srv://username:password@cluster.mongodb.net/jspdetailing
```

### JWT Authentication
```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

### CORS
```bash
FRONTEND_URL=http://localhost:5173
# Production: https://jspdetailing.vercel.app
```

### Email Configuration (Nodemailer)
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=JSP Detailing <noreply@jspdetailing.cl>
```

### 🖼️ Cloudinary Configuration (Image Storage)
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**📖 See [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) for detailed Cloudinary setup instructions.**

### Admin User (for initial setup)
```bash
ADMIN_EMAIL=admin@jspdetailing.cl
ADMIN_PASSWORD=Admin123!
```

---

## 🚀 Setting Up Environment Variables

### Local Development (.env file)

Create a `.env` file in the `backend/` directory:

```bash
cd backend
touch .env
```

Copy all variables above and replace with your actual values.

### Render (Production)

1. Go to your Render service dashboard
2. Click on **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add each variable one by one:
   - Key: `CLOUDINARY_CLOUD_NAME`
   - Value: `your-cloud-name`
5. Click **"Save Changes"**

**Important**: After adding environment variables, Render will automatically redeploy your service.

---

## ⚠️ Security Notes

- ❌ **Never commit `.env` files to Git**
- ✅ The `.env` file is already in `.gitignore`
- 🔒 Keep your secrets secure
- 🔄 Rotate credentials regularly
- 🔑 Use strong passwords for production

---

## ✅ Verification

After setting up environment variables, verify they're loaded:

```bash
# In backend directory
npm run dev
```

Check the console for any missing variable warnings.

---

## 📝 Notes

- **Email**: For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833)
- **MongoDB**: Use MongoDB Atlas for production (free tier available)
- **Cloudinary**: Free tier includes 25 GB storage + 25 GB bandwidth/month
- **JWT_SECRET**: Generate a random string (at least 32 characters)

---

## 🆘 Troubleshooting

### "Cannot connect to MongoDB"
- Check `MONGODB_URI` is correct
- Verify MongoDB is running (local) or accessible (Atlas)

### "Email sending failed"
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- Use Gmail App Password, not regular password
- Check `EMAIL_HOST` and `EMAIL_PORT` match your provider

### "Images not uploading"
- Verify all three Cloudinary variables are set
- Check credentials are correct in Cloudinary dashboard
- See [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) for troubleshooting

