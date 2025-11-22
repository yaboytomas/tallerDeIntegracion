# Backend Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file with your actual values:

#### MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user (username/password)
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string from "Connect" → "Connect your application"
6. Replace the `MONGODB_URI` in `.env`:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/jsp-detailing?retryWrites=true&w=majority
   ```

#### JWT Secrets
Generate strong random secrets:
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Replace `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env` with generated values.

#### Email Configuration (Optional for development)

**For Gmail:**
1. Enable 2-Factor Authentication on your Gmail account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Use that password in `EMAIL_PASS`

**For other providers:**
- Update `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` accordingly

**Note:** If email is not configured, the app will still work but will log verification links to console instead of sending emails.

### 3. Create Upload Directory
The uploads directory is created automatically, but you can verify:
```bash
# Should already exist, but if not:
mkdir uploads
```

### 4. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### 5. Test the API
```bash
# Health check
curl http://localhost:5000/health

# Should return: {"status":"ok","timestamp":"..."}
```

## Production Deployment on Render

### 1. Environment Variables
Set all environment variables in Render dashboard:
- `NODE_ENV=production`
- `MONGODB_URI` (your Atlas connection string)
- `JWT_SECRET` (strong random string)
- `JWT_REFRESH_SECRET` (strong random string)
- `FRONTEND_URL` (your frontend URL)
- `EMAIL_*` variables (if using email)

### 2. Build Settings
- **Build Command:** `npm run build`
- **Start Command:** `npm start`

### 3. Health Check
Render will use `/health` endpoint for health checks.

## API Testing

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User",
    "rut": "12345678-9",
    "phone": "+56 9 1234 5678",
    "agreeTerms": true
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### Test Products (Public)
```bash
curl http://localhost:5000/api/products
```

## Troubleshooting

### MongoDB Connection Issues
- Verify your connection string is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has proper permissions

### Email Not Sending
- Check email credentials
- For Gmail, ensure you're using App Password, not regular password
- Check firewall/network restrictions
- Emails will log to console if not configured (check server logs)

### Port Already in Use
- Change `PORT` in `.env` to a different port
- Or kill the process using port 5000

### Build Errors
- Run `npm run build` to check for TypeScript errors
- Ensure all dependencies are installed: `npm install`

## Next Steps

1. Create an admin user (you can do this via registration and then manually update role in MongoDB)
2. Add some test products via admin API
3. Connect your frontend to this backend API
4. Test the full flow: registration → login → browse products → add to cart

