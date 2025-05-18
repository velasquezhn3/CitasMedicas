"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AgendarCita_1 = require("../../core/use-cases/AgendarCita");
const connection_manager_singleton_1 = require("../../whatsapp/connection-manager-singleton");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const agendarCita = new AgendarCita_1.AgendarCita();
const connectionManager = new connection_manager_singleton_1.ConnectionManager();
function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
app.get('/citas', async (req, res) => {
    const citas = await agendarCita.obtenerCitas();
    res.json(citas);
});
app.post('/citas', asyncHandler(async (req, res) => {
    const nuevaCita = req.body;
    if (!nuevaCita.doctorId || !nuevaCita.pacienteId || !nuevaCita.fechaHora || !nuevaCita.especialidad) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    nuevaCita.fechaHora = new Date(nuevaCita.fechaHora);
    let result;
    try {
        result = await agendarCita.execute({
            doctorId: Number(nuevaCita.doctorId),
            pacienteId: nuevaCita.pacienteId,
            fechaHoraInicio: nuevaCita.fechaHora,
            fechaHoraFin: nuevaCita.fechaHoraFin || new Date(nuevaCita.fechaHora.getTime() + 30 * 60000),
            especialidad: nuevaCita.especialidad,
        });
    }
    catch (error) {
        console.error('Error executing agendarCita:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    if (!result.success) {
        return res.status(409).json({ error: result.error });
    }
    res.status(201).json(nuevaCita);
}));
// New endpoint to get QR codes for all active WhatsApp connections
app.get('/whatsapp/qr-codes', (req, res) => {
    const connections = connectionManager.getAllConnections();
    const qrCodes = connections.map((conn) => ({
        id: conn.id,
        qr: conn.qr || null,
        connected: conn.connected,
    }));
    res.json(qrCodes);
});
app.post('/whatsapp/reset-connections', async (req, res) => {
    try {
        // Close all existing connections by deleting them
        const connections = connectionManager.getAllConnections();
        for (const conn of connections) {
            connectionManager.emit('disconnected', { id: conn.id });
            connectionManager.getAllConnections().splice(connectionManager.getAllConnections().indexOf(conn), 1);
        }
        // Optionally, create a new connection with a new ID to generate a new QR code
        const newId = `conn-${Date.now()}`;
        await connectionManager.createConnection(newId);
        res.status(200).json({ message: 'Connections reset and new QR code generated', newId });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to reset connections' });
    }
});
exports.default = app;
