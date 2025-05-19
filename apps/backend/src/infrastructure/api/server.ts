import express from 'express';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import { jwtAuthMiddleware } from '../../../auth/jwtAuthMiddleware';
import { roleAuthMiddleware } from '../../../auth/roleAuthMiddleware';
import { rateLimitMiddleware } from '../../../auth/rateLimitMiddleware';

dotenv.config();

const app = express();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Rate limiting middleware
app.use(rateLimitMiddleware);

// Public route
app.get('/', (req, res) => {
  res.json({ message: 'Medical Appointment API is running' });
});

// Protected route example
app.get(
  '/admin',
  jwtAuthMiddleware,
  roleAuthMiddleware(['admin']),
  (req, res) => {
    res.json({ message: 'Welcome, admin user!' });
  }
);

// Appointment routes
import appointmentRoutes from './routes/appointments';
app.use('/appointments', appointmentRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
