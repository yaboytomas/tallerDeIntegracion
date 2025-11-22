# Environment Variables Setup Guide

## 📋 Quick Setup Checklist

### ✅ Frontend (Already Created)
The `.env` file in `frontend/` is already created with:
- `VITE_API_URL=http://localhost:5000/api`

**No action needed** - it's ready to use!

### ⚙️ Backend (Needs Configuration)
The `.env` file in `backend/` needs these values:

## 🔧 Backend Environment Variables

Edit `backend/.env` and configure these **REQUIRED** variables:

### 1. MongoDB Atlas (REQUIRED) ⚠️
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jsp-detailing?retryWrites=true&w=majority
```

**How to get it:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Create database user
4. Whitelist IP (use `0.0.0.0/0` for development)
5. Get connection string from "Connect" → "Connect your application"
6. Replace `username`, `password`, and `cluster` in the connection string

### 2. JWT Secrets (REQUIRED) ⚠️
```env
JWT_SECRET=your-generated-secret-here-min-32-chars
JWT_REFRESH_SECRET=your-generated-refresh-secret-here-min-32-chars
```

**Generate secrets:**
```powershell
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Run this twice to get two different secrets.

### 3. Email Configuration (OPTIONAL)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@jspdetailing.cl
```

**For Gmail:**
- Enable 2FA on your Gmail account
- Go to https://myaccount.google.com/apppasswords
- Generate app password for "Mail"
- Use that password in `EMAIL_PASS`

**Note:** Server works without email - verification links will be logged to console.

### 4. Other Backend Variables (Already Set)
These are already configured with defaults:
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=12
```

## 🚀 Quick Start

### Step 1: Configure Backend
1. Open `backend/.env`
2. Set `MONGODB_URI` (your Atlas connection string)
3. Generate and set `JWT_SECRET` and `JWT_REFRESH_SECRET`

### Step 2: Start Backend
```bash
cd backend
npm run dev
```

You should see:
```
MongoDB Connected: cluster0.xxxxx.mongodb.net
Server running on port 5000
```

### Step 3: Start Frontend
```bash
cd frontend
npm run dev
```

Frontend will use `VITE_API_URL` from `.env` (already set to `http://localhost:5000/api`)

### Step 4: Test User Creation
1. Go to http://localhost:5173/registro
2. Fill the registration form
3. Submit - user will be created in MongoDB

## 📝 Summary

**Frontend:** ✅ Ready (`.env` already created)
- `VITE_API_URL=http://localhost:5000/api`

**Backend:** ⚙️ Needs configuration
- `MONGODB_URI` - Your Atlas connection string
- `JWT_SECRET` - Generated secret (32+ chars)
- `JWT_REFRESH_SECRET` - Generated secret (32+ chars)
- `EMAIL_*` - Optional (for email verification)

## 🔍 Verify Setup

After configuring backend `.env`:

1. **Backend health check:**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend connection:**
   - Open browser console
   - Try registering a user
   - Check Network tab - API calls should go to `http://localhost:5000/api`

## 🆘 Troubleshooting

**"MONGODB_URI is not defined"**
- Make sure `.env` file exists in `backend/` folder
- Check that `MONGODB_URI` line is not commented out

**"MongoDB connection error"**
- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has proper permissions

**Frontend can't connect to backend**
- Verify backend is running on port 5000
- Check `VITE_API_URL` in `frontend/.env`
- Restart frontend dev server after changing `.env`

**"JWT_SECRET is too short"**
- Generate new secret with at least 32 characters
- Use the PowerShell command above

