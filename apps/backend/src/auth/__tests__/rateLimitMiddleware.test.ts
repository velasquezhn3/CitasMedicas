import request from 'supertest';
import express from 'express';
import { rateLimitMiddleware } from '../rateLimitMiddleware';

const app = express();
app.use(rateLimitMiddleware);

app.get('/test', (req, res) => {
  res.status(200).json({ message: 'OK' });
});

describe('Rate Limiting Middleware', () => {
  it('should allow requests under the limit', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app).get('/test');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('OK');
    }
  });

  it('should block requests exceeding the limit', async () => {
    // Assuming the limit is 100 requests per minute, simulate 101 requests
    for (let i = 0; i < 100; i++) {
      await request(app).get('/test');
    }
    const res = await request(app).get('/test');
    expect(res.statusCode).toBe(429);
    expect(res.body.message).toMatch(/Too many requests/);
  });
});
