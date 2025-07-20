# VHELPCC - VIT Chennai Campus Services Platform

A comprehensive campus services platform built with Next.js (TypeScript) frontend and Node.js (Express + TypeScript) backend, integrated with Supabase database.

## Features

### Core Services

- **Repair Services** - Phone and laptop repair order management
- **Food Delivery** - Multi-restaurant food ordering system
- **Lost & Found** - Campus lost and found item management
- **Authentication** - Secure user registration and login system

### Technical Features

- **Multi-Role Support** - Customer, Admin, Restaurant Admin, Delivery, Vendor roles
- **Real-time Updates** - Live order status tracking
- **Image Upload** - Supabase storage integration for item images
- **Responsive Design** - Mobile-friendly UI with Tailwind CSS
- **TypeScript** - Full type safety across frontend and backend
- **Security** - Rate limiting, CORS, helmet, input validation

## Tech Stack

### Frontend

- Next.js 15
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod validation
- Lucide React icons

### Backend

- Node.js
- Express.js
- TypeScript
- Supabase (PostgreSQL)
- JWT authentication
- bcryptjs for password hashing
- Express validation

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the complete schema from `vhelpcc-updated-complete-schema.sql`
3. Optionally, run the restaurant-specific schema from `restaurant-schema.sql` for enhanced restaurant features
4. Get your project URL and service role key from Settings > API

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
npm install
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

## API Endpoints

### Authentication Routes

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/verify` - Verify JWT token

### Repair Services Routes

- `GET /api/repair-orders` - Get user's repair orders
- `POST /api/repair-orders` - Create new repair order
- `PUT /api/repair-orders/:id` - Update repair order status

### Food Delivery Routes

- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:slug/menu` - Get restaurant menu
- `POST /api/food-orders` - Create food order
- `GET /api/food-orders` - Get user's food orders

### Lost & Found Routes

- `GET /api/lost-and-found` - Get lost and found items
- `POST /api/lost-and-found` - Submit lost/found item
- `PUT /api/lost-and-found/:id` - Update item status

### Health Check

- `GET /health` - Server health check

## Database Schema

The system uses multiple interconnected tables for comprehensive campus services:

### Core Tables

- **users** - User accounts with role-based access (customer, admin, restaurant_admin, delivery, vendor)
- **password_reset_tokens** - Secure password reset functionality

### Repair Services

- **service_types** - Phone and laptop repair categories
- **repair_orders** - Repair service requests and tracking
- **repair_order_history** - Audit trail for order status changes

### Food Delivery

- **restaurants** - Restaurant information and branding
- **restaurant_admins** - Restaurant management access
- **menu_items** - Restaurant menu with categories and pricing
- **food_orders** - Food delivery orders and tracking
- **food_order_items** - Individual items within orders

### Lost & Found

- **lost_and_found** - Lost and found item submissions with image support

### Additional Features

- **user_sessions** - Session management
- Comprehensive indexing for performance
- Audit triggers for data tracking
- Data validation constraints

## Frontend Pages

### Public Pages

- `/` - Home page with service selection
- `/login` - User login page
- `/signup` - User registration page
- `/forgot-password` - Password reset request page

### Service Pages

- `/repair` - Repair service forms (phone/laptop)
- `/restaurants` - Restaurant selection
- `/restaurants/[slug]` - Individual restaurant menus
- `/lost-and-found` - Lost and found submissions

### User Dashboard

- `/dashboard` - User order history and account management
- `/restaurant-admin` - Restaurant management portal (for restaurant admins)

## Security Features

- Password hashing with bcryptjs (12 salt rounds)
- JWT tokens with 7-day expiration
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation and sanitization
- SQL injection protection via Supabase
- Password strength requirements
