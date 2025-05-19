import request from 'supertest';
import express from 'express';
import appointmentRoutes from '../routes/appointments';
import { jwtAuthMiddleware } from '../../../auth/jwtAuthMiddleware';
import { roleAuthMiddleware } from '../../../auth/roleAuthMiddleware';

// Setup express app for testing
const app = express();
app.use(express.json());
app.use('/appointments', appointmentRoutes);

// Mock JWT middleware to bypass actual token verification for testing
jest.mock('../../../auth/jwtAuthMiddleware', () => ({
  jwtAuthMiddleware: (req: any, res: any, next: any) => {
    req.user = { userId: 'test-user', role: 'admin' };
    next();
  },
}));

// Mock role middleware to allow all roles for testing
jest.mock('../../../auth/roleAuthMiddleware', () => ({
  roleAuthMiddleware: () => (req: any, res: any, next: any) => next(),
}));

describe('Appointment API', () => {
  let appointmentId: string;

  it('should create a new appointment', async () => {
    const res = await request(app)
      .post('/appointments')
      .send({
        patientId: '11111111-1111-1111-1111-111111111111',
        doctorId: '22222222-2222-2222-2222-222222222222',
        date: '2024-07-01T10:00:00Z',
        description: 'Test appointment',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    appointmentId = res.body.id;
  });

  it('should get all appointments', async () => {
    const res = await request(app).get('/appointments');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get appointment by id', async () => {
    const res = await request(app).get(`/appointments/${appointmentId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', appointmentId);
  });

  it('should update appointment', async () => {
    const res = await request(app)
      .put(`/appointments/${appointmentId}`)
      .send({ status: 'completed' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'completed');
  });

  it('should delete appointment', async () => {
    const res = await request(app).delete(`/appointments/${appointmentId}`);
    expect(res.statusCode).toBe(204);
  });
});
