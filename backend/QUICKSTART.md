# 🚀 Quick Start Guide

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Configure .env File

Open `.env` file and update these **REQUIRED** values:

### ✅ MongoDB Atlas (REQUIRED)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a cluster (free tier is fine)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `username`, `password`, and `cluster` in `.env`:
   ```
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/jsp-detailing?retryWrites=true&w=majority
   ```
7. In Atlas, go to "Network Access" and add your IP (or `0.0.0.0/0` for development)

### ✅ JWT Secrets (REQUIRED)
Generate random secrets (minimum 32 characters):

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

Replace in `.env`:
```
JWT_SECRET=paste-generated-secret-here
JWT_REFRESH_SECRET=paste-another-generated-secret-here
```

### ⚠️ Email (OPTIONAL - for development)
If you want email verification to work:
- For Gmail: Enable 2FA, then create App Password at https://myaccount.google.com/apppasswords
- Update `EMAIL_USER` and `EMAIL_PASS` in `.env`

**Note:** Without email config, verification links will be logged to console (server will still work).

## Step 3: Start the Server
```bash
npm run dev
```

You should see:
```
MongoDB Connected: cluster0.xxxxx.mongodb.net
Server running on port 5000
Environment: development
```

## Step 4: Create Admin User (Optional)
```bash
npm run create-admin
```

Or set these in `.env` first:
```
ADMIN_EMAIL=admin@jspdetailing.cl
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_RUT=11111111-1
```

## Step 5: Test the API

Open browser or use curl:
```bash
# Health check
http://localhost:5000/health

# Should return: {"status":"ok","timestamp":"..."}
```

## 🎉 You're Ready!

The backend is now running at `http://localhost:5000`

### API Base URL
- Development: `http://localhost:5000/api`
- Production: Your Render URL + `/api`

### Test Endpoints
- `GET /api/products` - List products
- `GET /api/categories` - List categories
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login

## 📝 Next Steps

1. **Connect Frontend**: Update frontend API base URL to `http://localhost:5000/api`
2. **Add Products**: Use admin panel or API to add products
3. **Deploy**: Follow `SETUP.md` for Render deployment instructions

## ❌ Troubleshooting

**"MONGODB_URI is not defined"**
- Make sure `.env` file exists in `backend/` folder
- Check that `MONGODB_URI` line is not commented out

**"MongoDB connection error"**
- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has proper permissions

**"Port 5000 already in use"**
- Change `PORT=5000` to another port in `.env` (e.g., `PORT=5001`)

**Email not working**
- Check email credentials
- For Gmail, use App Password (not regular password)
- Server will still work without email (links logged to console)

## 📚 More Info

See `SETUP.md` for detailed setup instructions and `README.md` for API documentation.

