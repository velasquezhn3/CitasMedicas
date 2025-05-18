"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const AgendarCita_1 = require("../AgendarCita");
const database_1 = __importDefault(require("../../../infrastructure/database"));
// Mock the database pool
jest.mock('../../../infrastructure/database', () => ({
    query: jest.fn(),
}));
(0, globals_1.describe)('AgendarCita Use Case', () => {
    (0, globals_1.beforeEach)(() => {
        jest.clearAllMocks();
    });
    (0, globals_1.it)('should schedule an appointment without conflicts', async () => {
        database_1.default.query.mockResolvedValueOnce({ rowCount: 0 }); // No conflict
        database_1.default.query.mockResolvedValueOnce({}); // Insert success
        const agendarCita = new AgendarCita_1.AgendarCita();
        const result = await agendarCita.execute({
            doctorId: 1,
            pacienteId: '1',
            fechaHoraInicio: new Date('2024-06-01T10:00:00Z'),
            fechaHoraFin: new Date('2024-06-01T10:30:00Z'),
            especialidad: 'cardiologia',
        });
        (0, globals_1.expect)(result.success).toBe(true);
    });
    (0, globals_1.it)('should detect scheduling conflicts', async () => {
        database_1.default.query.mockResolvedValueOnce({ rowCount: 1 }); // Conflict found
        const agendarCita = new AgendarCita_1.AgendarCita();
        const result = await agendarCita.execute({
            doctorId: 1,
            pacienteId: '3',
            fechaHoraInicio: new Date('2024-06-01T10:15:00Z'),
            fechaHoraFin: new Date('2024-06-01T10:45:00Z'),
            especialidad: 'cardiologia',
        });
        (0, globals_1.expect)(result.success).toBe(false);
        (0, globals_1.expect)(result.error).toBe('Conflicting appointment');
    });
    (0, globals_1.it)('should insert the appointment with correct parameters', async () => {
        database_1.default.query.mockResolvedValueOnce({ rowCount: 0 }); // No conflict
        database_1.default.query.mockResolvedValueOnce({}); // Insert success
        const agendarCita = new AgendarCita_1.AgendarCita();
        const data = {
            doctorId: 2,
            pacienteId: '5',
            fechaHoraInicio: new Date('2024-06-02T09:00:00Z'),
            fechaHoraFin: new Date('2024-06-02T09:30:00Z'),
            especialidad: 'dermatologia',
        };
        await agendarCita.execute(data);
        (0, globals_1.expect)(database_1.default.query.mock.calls[1][0]).toContain('INSERT INTO citas');
        (0, globals_1.expect)(database_1.default.query.mock.calls[1][1]).toEqual([
            data.doctorId,
            data.pacienteId,
            data.fechaHoraInicio,
            data.especialidad,
        ]);
    });
    (0, globals_1.it)('should return all appointments from obtenerCitas', async () => {
        const fakeRows = [
            { id: 1, doctor_id: 1, paciente_id: '1', fecha_hora: new Date(), especialidad: 'cardiologia' },
            { id: 2, doctor_id: 2, paciente_id: '2', fecha_hora: new Date(), especialidad: 'dermatologia' },
        ];
        database_1.default.query.mockResolvedValueOnce({ rows: fakeRows });
        const agendarCita = new AgendarCita_1.AgendarCita();
        const citas = await agendarCita.obtenerCitas();
        (0, globals_1.expect)(citas.length).toBe(2);
        (0, globals_1.expect)(citas[0].doctorId).toBe(1);
        (0, globals_1.expect)(citas[1].especialidad).toBe('dermatologia');
    });
    (0, globals_1.it)('should handle database errors gracefully', async () => {
        database_1.default.query.mockRejectedValueOnce(new Error('DB error'));
        const agendarCita = new AgendarCita_1.AgendarCita();
        await (0, globals_1.expect)(agendarCita.execute({
            doctorId: 1,
            pacienteId: '1',
            fechaHoraInicio: new Date(),
            fechaHoraFin: new Date(),
            especialidad: 'cardiologia',
        })).rejects.toThrow('DB error');
    });
});
