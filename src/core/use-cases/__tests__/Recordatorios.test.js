"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Recordatorios_1 = require("../../use-cases/Recordatorios");
const server_1 = require("../../../infrastructure/api/server");
const globals_1 = require("@jest/globals");
// Mock de WhatsApp
globals_1.jest.mock('../../../infrastructure/api/server', () => {
    const originalModule = globals_1.jest.requireActual('../../../infrastructure/api/server');
    return {
        __esModule: true,
        ...originalModule,
        createConnection: globals_1.jest.fn(),
        socket: {
            sendMessage: globals_1.jest.fn(),
        },
        isWhatsAppConnected: true,
    };
});
// Mock de base de datos
globals_1.jest.mock('../../use-cases/Recordatorios', () => {
    const actual = globals_1.jest.requireActual('../../use-cases/Recordatorios');
    return {
        __esModule: true,
        ...actual,
        obtenerNumeroWhatsApp: globals_1.jest.fn(),
    };
});
(0, globals_1.test)('Envía recordatorio correctamente', async () => {
    server_1.createConnection.mockResolvedValue();
    // Mock job data
    const jobData = {
        id: 'test-job',
        data: {
            pacienteId: '123',
            mensaje: 'Recordatorio de prueba',
            fecha: new Date(),
        },
    };
    // Mock job object
    const job = {
        id: jobData.id,
        data: jobData.data,
    };
    // Call the worker's processor function directly
    const result = await Recordatorios_1.worker.processor(job);
    (0, globals_1.expect)(result.success).toBe(true);
    (0, globals_1.expect)(server_1.socket?.sendMessage).toHaveBeenCalled();
});
(0, globals_1.test)('Maneja errores de conexión', async () => {
    server_1.createConnection.mockRejectedValue(new Error('Connection failed'));
    const jobData = {
        id: 'test-error',
        data: {
            pacienteId: '456',
            mensaje: 'Recordatorio fallido',
            fecha: new Date(),
        },
    };
    const job = {
        id: jobData.id,
        data: jobData.data,
    };
    await (0, globals_1.expect)(Recordatorios_1.worker.processor(job)).rejects.toThrow('No active WhatsApp connections available');
});
