"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendarCita = void 0;
const Cita_1 = require("../entities/Cita");
const database_1 = __importDefault(require("../../infrastructure/database"));
class AgendarCita {
    async tieneConflicto(nuevaCitaInicio, nuevaCitaFin, doctorId) {
        const res = await database_1.default.query(`SELECT 1 FROM citas WHERE doctor_id = $1 AND (
        (fecha_hora >= $2 AND fecha_hora < $3) OR
        (fecha_hora + interval '30 minutes' > $2 AND fecha_hora + interval '30 minutes' <= $3) OR
        (fecha_hora <= $2 AND fecha_hora + interval '30 minutes' >= $3)
      ) LIMIT 1`, [doctorId, nuevaCitaInicio, nuevaCitaFin]);
        return res != null && res.rowCount != null && res.rowCount > 0;
    }
    async execute(data) {
        const conflict = await this.tieneConflicto(data.fechaHoraInicio, data.fechaHoraFin, data.doctorId);
        if (conflict) {
            return { success: false, error: 'Conflicting appointment' };
        }
        await database_1.default.query(`INSERT INTO citas (doctor_id, paciente_id, fecha_hora, especialidad) VALUES ($1, $2, $3, $4)`, [data.doctorId, data.pacienteId, data.fechaHoraInicio, data.especialidad]);
        return { success: true };
    }
    async obtenerCitas() {
        const res = await database_1.default.query('SELECT * FROM citas');
        return res.rows.map(row => new Cita_1.Cita(row.id, row.doctor_id, row.paciente_id, row.fecha_hora, row.especialidad));
    }
}
exports.AgendarCita = AgendarCita;
