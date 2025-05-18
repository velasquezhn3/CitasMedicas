"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker = void 0;
exports.obtenerNumeroWhatsApp = obtenerNumeroWhatsApp;
const bullmq_1 = require("bullmq");
const server_1 = require("../../infrastructure/api/server");
// Verificar conexión antes de enviar mensajes
const checkConnection = () => {
    if (!server_1.isWhatsAppConnected) {
        throw new Error('No active WhatsApp connections available');
    }
};
// Worker para procesar cola de recordatorios
exports.worker = new bullmq_1.Worker('recordatorios', async (job) => {
    try {
        const { pacienteId, mensaje } = job.data;
        // 1. Obtener número de WhatsApp del paciente (implementación real)
        const patientWhatsAppNumber = await obtenerNumeroWhatsApp(pacienteId); // Implementar esta función
        // 2. Verificar conexión
        checkConnection();
        // 3. Enviar mensaje
        await server_1.socket?.sendMessage(patientWhatsAppNumber, { text: mensaje });
        return { success: true };
    }
    catch (error) {
        console.error(`Job ${job.id} failed with error ${error.message}`);
        throw error;
    }
}, {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    },
});
// Implementación temporal para desarrollo
async function obtenerNumeroWhatsApp(pacienteId) {
    // Implementar lógica real de base de datos aquí
    return '1234567890@s.whatsapp.net'; // Número de prueba oficial de WhatsApp
}
