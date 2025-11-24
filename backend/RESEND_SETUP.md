# 📧 Resend Email Setup Guide

## Why Resend?

Render blocks direct SMTP connections (ports 465/587), which prevents Nodemailer + Gmail from working. Resend uses HTTP APIs instead of SMTP, which works perfectly on Render.

**Resend is the easiest email service** - modern, clean API, and great developer experience.

---

## 🚀 Quick Setup (3 minutes)

### Step 1: Create Resend Account

1. Go to: https://resend.com/signup
2. Sign up with your email or GitHub
3. Verify your email address
4. **FREE tier**: 100 emails/day, 3,000 emails/month

### Step 2: Create API Key

1. Login to Resend Dashboard
2. Go to: **API Keys** (left sidebar)
3. Click **"Create API Key"**
4. Name: `JSP Detailing Production`
5. Permission: **Sending access**
6. **Copy the API key** (starts with `re_...`)
   - ⚠️ **You can only see it once!**

### Step 3: Add Domain (or use onboarding.resend.dev)

You have 2 options:

#### Option A: Use Test Domain (Quick Start - Works Immediately!)
- Resend provides `onboarding@resend.dev` for testing
- **No verification needed** - works right away!
- Limited to 1 recipient per email
- **Use this for initial testing**

For `EMAIL_FROM`, use:
```
onboarding@resend.dev
```

#### Option B: Add Your Domain (Production - Recommended)
1. Go to: **Domains** → **Add Domain**
2. Enter: `jspdetailing.cl` (or your domain)
3. Add the DNS records shown to your domain provider
4. Wait for verification (a few minutes)
5. Once verified, you can send from any email at your domain:
   - `noreply@jspdetailing.cl`
   - `info@jspdetailing.cl`
   - etc.

### Step 4: Add to Render Environment Variables

1. Go to Render Dashboard → Your Service
2. Click **Environment** tab
3. Add these **2 variables**:

```bash
RESEND_API_KEY=re_your_actual_api_key_here
EMAIL_FROM=onboarding@resend.dev
```

**Important**: 
- Replace `re_your_actual_api_key_here` with your real API key
- If using your own domain, change `EMAIL_FROM` to your verified email
- **NO quotes** needed in Render

4. Click **"Save Changes"**

### Step 5: Deploy

Your code is already updated! Render will **auto-deploy** from your latest push.

Wait 1-2 minutes for deployment to complete.

---

## ✅ Testing

### Test 1: Check Logs
After deployment, check Render logs. You should see:
```
📧 Email service configured: Resend
```

### Test 2: Test Password Reset
1. Go to your website: https://jsp.zabotec.com
2. Click **"Olvidé mi contraseña"**
3. Enter your email
4. Check your email inbox (and spam folder)
5. 🎉 You should receive the reset email!

### Test 3: Test Registration
1. Register a new account
2. Check for verification email

---

## 📊 Resend Dashboard

Monitor your emails:
- **Emails**: See all sent emails and their status
- **Logs**: Real-time delivery logs
- **Analytics**: Email metrics

---

## 🔄 Switching Between Environments

The code automatically uses:
- **Resend** if `RESEND_API_KEY` is set (production)
- **Nodemailer** if `EMAIL_USER` and `EMAIL_PASS` are set (local dev)

Your local `.env` can keep using Gmail:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

---

## 🎯 Upgrading to Your Own Domain

When ready to use your own domain:

1. **Add Domain in Resend**:
   - Go to: **Domains** → **Add Domain**
   - Enter: `jspdetailing.cl`

2. **Add DNS Records**:
   Resend will give you records like:
   ```
   Type: TXT
   Name: resend._domainkey
   Value: (provided by Resend)
   
   Type: TXT
   Name: @
   Value: (provided by Resend)
   ```

3. **Update Environment Variable**:
   ```bash
   EMAIL_FROM=noreply@jspdetailing.cl
   ```

4. **Verify**:
   - Click "Verify" in Resend
   - Wait a few minutes
   - ✅ Done!

---

## 🆓 Free Tier Limits

**Resend Free Plan**:
- 100 emails per day
- 3,000 emails per month
- All features included
- No credit card required

If you need more, paid plans start at $20/month for 50,000 emails.

---

## ❓ Troubleshooting

### Error: "API key is invalid"
**Solution**: 
- Check that `RESEND_API_KEY` is correct in Render
- Make sure you copied the full key (starts with `re_`)
- Regenerate key if needed

### Error: "Domain not verified"
**Solution**: 
- Use `onboarding@resend.dev` for testing
- Or add DNS records and wait for verification

### Emails not arriving
**Solution**: 
1. Check Resend **Emails** tab for delivery status
2. Check spam folder
3. Try `onboarding@resend.dev` first
4. Make sure you're not exceeding rate limits

### Still says "Email service not configured"
**Solution**: 
- Make sure `RESEND_API_KEY` is set in Render (no quotes)
- Wait for Render to redeploy
- Check logs for errors

---

## 📝 Quick Checklist

- [ ] Create Resend account (free)
- [ ] Create API Key (starts with `re_`)
- [ ] Add `RESEND_API_KEY` to Render
- [ ] Add `EMAIL_FROM=onboarding@resend.dev` to Render  
- [ ] Wait for Render to redeploy (1-2 min)
- [ ] Check logs for: `📧 Email service configured: Resend`
- [ ] Test password reset
- [ ] 🎉 Working!

---

## 🔗 Useful Links

- **Resend Dashboard**: https://resend.com/overview
- **Resend Docs**: https://resend.com/docs
- **API Keys**: https://resend.com/api-keys
- **Domains**: https://resend.com/domains
- **Emails Log**: https://resend.com/emails

---

**That's it!** Resend is now set up and your emails will work on Render. 🎉

**Need help?** Check the troubleshooting section above or reach out!

