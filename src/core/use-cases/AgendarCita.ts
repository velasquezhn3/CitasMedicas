import { Cita } from '../entities/Cita';
import pool from '../../infrastructure/database';

export class AgendarCita {
  async tieneConflicto(nuevaCitaInicio: Date, nuevaCitaFin: Date, doctorId: number): Promise<boolean> {
    const res = await pool.query(
      `SELECT 1 FROM citas WHERE doctor_id = $1 AND (
        (fecha_hora >= $2 AND fecha_hora < $3) OR
        (fecha_hora + interval '30 minutes' > $2 AND fecha_hora + interval '30 minutes' <= $3) OR
        (fecha_hora <= $2 AND fecha_hora + interval '30 minutes' >= $3)
      ) LIMIT 1`,
      [doctorId, nuevaCitaInicio, nuevaCitaFin]
    );
    return res != null && res.rowCount != null && res.rowCount > 0;
  }

  async execute(data: { doctorId: number; pacienteId: string; fechaHoraInicio: Date; fechaHoraFin: Date; especialidad: string }) {
    const conflict = await this.tieneConflicto(data.fechaHoraInicio, data.fechaHoraFin, data.doctorId);
    if (conflict) {
      return { success: false, error: 'Conflicting appointment' };
    }
    await pool.query(
      `INSERT INTO citas (doctor_id, paciente_id, fecha_hora, especialidad) VALUES ($1, $2, $3, $4)`,
      [data.doctorId, data.pacienteId, data.fechaHoraInicio, data.especialidad]
    );
    return { success: true };
  }

  async obtenerCitas(): Promise<Cita[]> {
    const res = await pool.query('SELECT * FROM citas');
    return res.rows.map(row => new Cita(row.id, row.doctor_id, row.paciente_id, row.fecha_hora, row.especialidad));
  }
}
