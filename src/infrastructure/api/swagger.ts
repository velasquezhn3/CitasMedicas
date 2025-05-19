import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import express from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Medical Appointment System API',
      version: '1.0.0',
      description: 'API documentation for the Medical Appointment System',
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
      },
    ],
  },
  apis: ['./src/infrastructure/api/**/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

const router = express.Router();

router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;
