"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const database_1 = __importDefault(require("../../../infrastructure/database"));
beforeAll(async () => {
    await database_1.default.query('DELETE FROM citas');
});
describe('API /citas endpoints', () => {
    it('GET /citas should return empty array initially', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/citas');
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
        const res = await (0, supertest_1.default)(app_1.default).post('/citas').send(newCita);
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
        await (0, supertest_1.default)(app_1.default).post('/citas').send(cita1);
        const cita2 = {
            doctorId: 1,
            pacienteId: 3,
            fechaHora: new Date().toISOString(),
            especialidad: 'cardiologia',
        };
        const res = await (0, supertest_1.default)(app_1.default).post('/citas').send(cita2);
        expect(res.status).toBe(409);
    });
});
