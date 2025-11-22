# JSP Detailing Backend API

Backend API for JSP Detailing e-commerce platform built with Node.js, Express, TypeScript, and MongoDB Atlas.

## Features

- **Authentication**: JWT-based auth with email verification and password recovery
- **Product Management**: Full CRUD for products, categories, variants
- **Shopping Cart**: Guest and authenticated user cart management
- **Admin Panel**: Complete backoffice for managing products, categories, banners, and content
- **Security**: Rate limiting, input sanitization, audit logging
- **File Upload**: Image upload for products, categories, and banners

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Public Routes
- `GET /api/products` - List products with filters
- `GET /api/products/:id` - Get product details
- `GET /api/products/search?q=` - Search products
- `GET /api/categories` - List categories
- `GET /api/home/banners` - Get active home banners
- `GET /api/content/:slug` - Get content page
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Protected Routes (User)
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/password` - Change password
- `GET /api/user/addresses` - Get addresses
- `POST /api/user/addresses` - Add address

### Admin Routes
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/products` - List products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- Similar routes for categories, banners, and content pages

## Deployment on Render

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Deploy!

## License

ISC

