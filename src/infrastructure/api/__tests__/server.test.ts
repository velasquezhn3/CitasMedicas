import request from 'supertest';
import app from '../app';
import pool from '../../../infrastructure/database';

beforeAll(async () => {
  await pool.query('DELETE FROM citas');
});

describe('API /citas endpoints', () => {
  it('GET /citas should return empty array initially', async () => {
    const res = await request(app).get('/citas');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /citas should create a new appointment', async () => {
    const newCita = {
      doctorId: 1,
      pacienteId: 1,
      fechaHora: new Date().toISOString(),
      especialidad: 'cardiologia',
    };
    const res = await request(app).post('/citas').send(newCita);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      doctorId: 1,
      pacienteId: 1,
      especialidad: 'cardiologia',
    });
  });

  it('POST /citas should reject conflicting appointment', async () => {
    const cita1 = {
      doctorId: 1,
      pacienteId: 2,
      fechaHora: new Date().toISOString(),
      especialidad: 'cardiologia',
    };
    await request(app).post('/citas').send(cita1);

    const cita2 = {
      doctorId: 1,
      pacienteId: 3,
      fechaHora: new Date().toISOString(),
      especialidad: 'cardiologia',
    };
    const res = await request(app).post('/citas').send(cita2);
    expect(res.status).toBe(409);
  });
});
