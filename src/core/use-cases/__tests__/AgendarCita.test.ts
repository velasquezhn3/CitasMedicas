import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { AgendarCita } from '../AgendarCita';
import pool from '../../../infrastructure/database';
// Mock the database pool
jest.mock('../../../infrastructure/database', () => ({
  query: jest.fn(),
}));

describe('AgendarCita Use Case', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should schedule an appointment without conflicts', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rowCount: 0 }); // No conflict
    (pool.query as jest.Mock).mockResolvedValueOnce({}); // Insert success
    const agendarCita = new AgendarCita();
    const result = await agendarCita.execute({
      doctorId: 1,
      pacienteId: '1',
      fechaHoraInicio: new Date('2024-06-01T10:00:00Z'),
      fechaHoraFin: new Date('2024-06-01T10:30:00Z'),
      especialidad: 'cardiologia',
    });
    expect(result.success).toBe(true);
  });

  it('should detect scheduling conflicts', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rowCount: 1 }); // Conflict found
    const agendarCita = new AgendarCita();
    const result = await agendarCita.execute({
      doctorId: 1,
      pacienteId: '3',
      fechaHoraInicio: new Date('2024-06-01T10:15:00Z'),
      fechaHoraFin: new Date('2024-06-01T10:45:00Z'),
      especialidad: 'cardiologia',
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Conflicting appointment');
  });

  it('should insert the appointment with correct parameters', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rowCount: 0 }); // No conflict
    (pool.query as jest.Mock).mockResolvedValueOnce({}); // Insert success
    const agendarCita = new AgendarCita();
    const data = {
      doctorId: 2,
      pacienteId: '5',
      fechaHoraInicio: new Date('2024-06-02T09:00:00Z'),
      fechaHoraFin: new Date('2024-06-02T09:30:00Z'),
      especialidad: 'dermatologia',
    };
    await agendarCita.execute(data);
    expect((pool.query as jest.Mock).mock.calls[1][0]).toContain('INSERT INTO citas');
    expect((pool.query as jest.Mock).mock.calls[1][1]).toEqual([
      data.doctorId,
      data.pacienteId,
      data.fechaHoraInicio,
      data.especialidad,
    ]);
  });

  it('should return all appointments from obtenerCitas', async () => {
    const fakeRows = [
      { id: 1, doctor_id: 1, paciente_id: '1', fecha_hora: new Date(), especialidad: 'cardiologia' },
      { id: 2, doctor_id: 2, paciente_id: '2', fecha_hora: new Date(), especialidad: 'dermatologia' },
    ];
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: fakeRows });
    const agendarCita = new AgendarCita();
    const citas = await agendarCita.obtenerCitas();
    expect(citas.length).toBe(2);
    expect(citas[0].doctorId).toBe(1);
    expect(citas[1].especialidad).toBe('dermatologia');
  });

  it('should handle database errors gracefully', async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
    const agendarCita = new AgendarCita();
    await expect(
      agendarCita.execute({
        doctorId: 1,
        pacienteId: '1',
        fechaHoraInicio: new Date(),
        fechaHoraFin: new Date(),
        especialidad: 'cardiologia',
      })
    ).rejects.toThrow('DB error');
  });
});
