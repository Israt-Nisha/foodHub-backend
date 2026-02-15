# Food Hub 🍽️ — Backend

This repository contains the backend API for **Food Hub** — a full-stack food ordering platform supporting **customers, providers, and admins** with secure authentication and role-based access control.

---

## 🌐 Live & Source

- 🌍 Live Website: [Food Hub Frontend ](https://foodhub-client-tau.vercel.app/) 
- 🔗 Backend API: [Food Hub Backend Live](https://food-hub-server-black.vercel.app/)    


---

## 🛠️ Tech Stack (Backend)

- **Node.js** — Runtime environment  
- **Express.js** — REST API framework  
- **TypeScript** — Strong typing  
- **PostgreSQL** — Relational database  
- **Prisma ORM** — Database modeling & queries  
- **Better Auth** — Authentication & session handling 
- **Google OAuth** — Social login  
- **Vercel** — Backend deployment  

---

## ✨ Core Features (Backend)

### 🔐 Authentication
- User registration with role selection  
- Login with credentials  
- Google OAuth login  
- Secure session management  
- Seeded admin account  

### 📦 Orders
- Create orders  
- View order history  
- Track order status  
- Provider-controlled status updates  

### 🍽️ Meals & Categories
- Provider meal CRUD  
- Category management (Admin)  
- Meal filtering & searching  

### 🛡️ Admin Controls
- View all users  
- Suspend / activate users  
- View all orders  

---

## 🧱 Database Models
Managed using **Prisma ORM**:

- Users  
- ProviderProfiles  
- Categories  
- Meals  
- Orders  
- Reviews  

---

## ⚙️ Environment Variables (Backend)

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
PORT=5000
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=https://example-backend.vercel.app
APP_URL=https://example-frontend.vercel.app
APP_USER=example@gmail.com
APP_PASS=example_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret



## 🚀 Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev


Open [http://localhost:5000](http://localhost:5000) in your browser to see the result.