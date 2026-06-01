# Smart Restaurant

Smart Restaurant is a full-stack restaurant management system built as a monorepo with a React frontend and Node/Express backend.

It demonstrates end-to-end application architecture: authenticated user flows, dashboards, API design, real-time features, form validation, internationalized frontend patterns, and backend security controls.

## What It Shows

- React dashboard UI for restaurant operations
- Node.js and Express backend API
- JWT authentication and protected routes
- Role-oriented application structure
- MongoDB/Mongoose data layer
- Socket.IO real-time communication patterns
- Groq SDK integration for AI-assisted restaurant workflows
- API validation with Zod and express-validator
- Security middleware including Helmet, rate limiting, compression, and CORS
- File/media handling with Multer, Sharp, and Cloudinary

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- DaisyUI
- React Query
- Zustand
- React Hook Form
- Zod
- i18next
- Socket.IO Client

### Backend

- Node.js
- Express
- MongoDB / Mongoose
- JWT
- bcryptjs
- Socket.IO
- Groq SDK
- Winston logging
- Helmet
- express-rate-limit
- Cloudinary

## Local Development

Install dependencies for the root workspace, frontend, and backend:

```bash
npm run install:all
```

Run frontend and backend together:

```bash
npm run dev
```

## Why This Project Matters

This project shows full-stack ownership beyond a static frontend: backend APIs, authentication, validation, operational dashboards, real-time communication, and security-oriented middleware. It is a useful complement to the AI-focused projects because it shows the application engineering foundation needed to ship AI features inside real software.

## Related Work

For an AI Builder / agentic workflow prototype, see ConsultIQ:

https://consultiq.vercel.app
