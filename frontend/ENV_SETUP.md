# Frontend Environment Variables Setup

## Required Environment Variables

The frontend needs the following environment variables to connect to the backend API.

### 1. Create `.env` file

Create a `.env` file in the `frontend/` directory with the following content:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

### 2. Development Setup

For local development, use:
```env
VITE_API_URL=http://localhost:5000/api
```

Make sure your backend is running on port 5000 (or update the port accordingly).

### 3. Production Setup

When deploying to production (Vercel/Netlify), set the environment variable:

**Vercel:**
- Go to Project Settings → Environment Variables
- Add: `VITE_API_URL` = `https://your-backend.onrender.com/api`

**Netlify:**
- Go to Site Settings → Environment Variables
- Add: `VITE_API_URL` = `https://your-backend.onrender.com/api`

### 4. Testing the Connection

After setting up the environment variable:

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Open browser: `http://localhost:5173`
4. Try registering a user or logging in

### 5. Important Notes

- **VITE_** prefix is required for Vite to expose the variable to the frontend
- Restart the dev server after changing `.env` file
- The `.env` file is gitignored (don't commit it)
- Use `.env.example` as a template for your team

### 6. Current Configuration

The API service will use:
- `VITE_API_URL` if set
- Fallback to `http://localhost:5000/api` if not set

You can verify the API URL is being used by checking the browser console network tab when making API calls.

