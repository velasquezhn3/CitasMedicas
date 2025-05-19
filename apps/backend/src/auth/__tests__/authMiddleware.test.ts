import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { jwtAuthMiddleware } from '../jwtAuthMiddleware';
import { roleAuthMiddleware } from '../roleAuthMiddleware';

jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());

app.get('/protected', jwtAuthMiddleware, roleAuthMiddleware(['admin']), (req, res) => {
  res.status(200).json({ message: 'Access granted' });
});

describe('Authentication and Authorization Middleware', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return 401 if Authorization header is missing', async () => {
    const res = await request(app).get('/protected');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Authorization header missing');
  });

  it('should return 401 if token is missing', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer ');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Token missing');
  });

  it('should return 401 if token is invalid', async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid token');
  });

  it('should return 403 if user role is not authorized', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user1', role: 'patient' });
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer validtoken');
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Access forbidden: insufficient role');
  });

  it('should allow access if user role is authorized', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user1', role: 'admin' });
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer validtoken');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Access granted');
  });
});
