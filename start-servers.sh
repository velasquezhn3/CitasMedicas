#!/bin/bash
# Start backend API server
npx ts-node src/infrastructure/api/server.ts &

# Start frontend Next.js server
npx next dev src/ui
