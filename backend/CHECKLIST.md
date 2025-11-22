# ✅ Backend Setup Checklist

## 📋 What's Already Done

- ✅ Project structure created
- ✅ All dependencies installed
- ✅ TypeScript configuration ready
- ✅ All models created (User, Product, Category, Cart, etc.)
- ✅ All API routes implemented
- ✅ Authentication system (JWT, bcrypt)
- ✅ Security middleware (Helmet, rate limiting, sanitization)
- ✅ File upload system
- ✅ Email service (Nodemailer)
- ✅ Audit logging
- ✅ Error handling
- ✅ `.env` file created with all variables
- ✅ Build successful (no TypeScript errors)
- ✅ Uploads directory created

## 🔧 What You Need to Configure

### 1. MongoDB Atlas (REQUIRED) ⚠️
- [ ] Sign up at https://www.mongodb.com/cloud/atlas
- [ ] Create a free cluster
- [ ] Create database user (username/password)
- [ ] Whitelist your IP address (Network Access)
- [ ] Get connection string from "Connect" → "Connect your application"
- [ ] Update `MONGODB_URI` in `.env` file

**Example:**
```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/jsp-detailing?retryWrites=true&w=majority
```

### 2. JWT Secrets (REQUIRED) ⚠️
- [ ] Generate JWT_SECRET (min 32 chars)
- [ ] Generate JWT_REFRESH_SECRET (min 32 chars)
- [ ] Update both in `.env` file

**Generate secrets:**
```powershell
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 3. Email Configuration (OPTIONAL)
- [ ] For Gmail: Enable 2FA
- [ ] Create App Password at https://myaccount.google.com/apppasswords
- [ ] Update `EMAIL_USER` and `EMAIL_PASS` in `.env`

**Note:** Server works without email - verification links will be logged to console.

### 4. Frontend URL (if different)
- [ ] Update `FRONTEND_URL` in `.env` if frontend runs on different port

## 🚀 Ready to Start?

Once you've configured MongoDB and JWT secrets:

```bash
npm run dev
```

## 🧪 Test It Works

1. **Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Test Products Endpoint:**
   ```bash
   curl http://localhost:5000/api/products
   ```
   Should return: `{"products":[],"pagination":{...}}`

3. **Test Registration:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"Test123!@#","firstName":"Test","lastName":"User","rut":"12345678-9","phone":"+56 9 1234 5678","agreeTerms":true}'
   ```

## 📝 Create Admin User

After server is running:

```bash
npm run create-admin
```

Or set in `.env`:
```
ADMIN_EMAIL=admin@jspdetailing.cl
ADMIN_PASSWORD=YourSecurePassword123!
```

## 🎯 All Set!

Your backend is ready when:
- ✅ Server starts without errors
- ✅ MongoDB connection successful
- ✅ Health endpoint returns OK
- ✅ Can register/login users
- ✅ Can access products endpoint

## 📚 Documentation

- `QUICKSTART.md` - Quick setup guide
- `SETUP.md` - Detailed setup instructions
- `README.md` - API documentation

