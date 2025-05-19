# Medical Appointment System

## Overview

This project is a complete medical appointment management system with WhatsApp integration, Google Calendar sync, and admin dashboards. It includes backend services, frontend UI, and infrastructure setup.

## Features

- Backend API with Express (TypeScript), JWT authentication with roles, Zod validation, rate limiting, and structured logging.
- WhatsApp integration using Baileys with Redis session persistence, hierarchical menus, and commands.
- Google Calendar synchronization with OAuth2 and webhook push notifications.
- Reminder system using BullMQ with priority queues and retry logic.
- Frontend built with Next.js, Shadcn/ui, and Chart.js, including doctor dashboard, calendar views, patients CRUD, telemedicine with WebRTC, and digital signature editor.
- Dark/light theme support.
- Infrastructure with Docker Compose, PostgreSQL, Redis, Nginx reverse proxy with SSL, and PM2 cluster mode.

## Installation

### Prerequisites

- Docker and Docker Compose installed
- SSL certificates for Nginx placed in `nginx/certs/`

### Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and configure environment variables
3. Build and start containers:

```bash
docker-compose up --build
```

4. Access the frontend at `https://yourdomain.com` (or `http://localhost` if SSL not configured)
5. Backend API runs on port 3001 internally
6. PostgreSQL and Redis run as services within Docker

## Database

- PostgreSQL schema is in `db-improved.sql`
- Run migrations or import schema as needed

## Development

- Backend source code in `src/infrastructure/api`
- Frontend source code in `src/ui/app`
- Use `npm run dev` scripts for local development

## Deployment

- Use Docker Compose for production deployment
- PM2 manages backend process in cluster mode
- Nginx handles SSL termination and reverse proxy

## API Documentation

- Swagger/OpenAPI documentation to be added

## License

MIT License
