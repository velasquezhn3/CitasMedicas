# Medical Appointment Management System

This is a monorepo project for managing medical appointments, built with:

- Turborepo monorepo
- Yarn 3
- Backend: Express + TypeScript
- Frontend: Next.js 14 with App Router
- Shared packages for config and types
- Integrations with WhatsApp, Google Calendar
- Queue system with BullMQ
- Logging with Pino
- Rate limiting
- Docker and docker-compose for infrastructure
- Testing with Jest and Cypress
- CI/CD with GitHub Actions

## Installation

1. Install Yarn 3 and Turborepo globally if not installed:

```bash
npm install -g yarn turbo
```

2. Install dependencies:

```bash
yarn install
```

3. Run development servers:

```bash
yarn dev:frontend
yarn dev:backend
```

## Project Structure

- `apps/frontend`: Next.js 14 frontend app
- `apps/backend`: Express backend API
- `packages/config`: shared ESLint and Prettier config
- `packages/types`: shared TypeScript types

## Scripts

- `yarn dev:frontend`: Run frontend dev server
- `yarn dev:backend`: Run backend dev server
- `yarn build`: Build all packages
- `yarn lint`: Run linting
- `yarn test`: Run tests

## Environment Variables

See `.env.example` files in respective apps for required environment variables.

## Documentation

See `ARCHITECTURE.md` and `TESTING.md` for more details.
