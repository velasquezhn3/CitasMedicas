"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const AgendarCita_1 = require("../../core/use-cases/AgendarCita");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
const agendarCita = new AgendarCita_1.AgendarCita();
// Basic health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Endpoint to list all appointments
app.get('/citas', (req, res) => {
    const citas = agendarCita.obtenerCitas();
    res.json(citas);
});
// Endpoint to create a new appointment
app.post('/citas', (req, res) => {
    const nuevaCita = req.body;
    if (!nuevaCita.id || !nuevaCita.doctorId || !nuevaCita.pacienteId || !nuevaCita.fechaHora || !nuevaCita.especialidad) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    // Convert fechaHora string to Date object
    nuevaCita.fechaHora = new Date(nuevaCita.fechaHora);
    const exito = agendarCita.agendar(nuevaCita);
    if (!exito) {
        return res.status(409).json({ error: 'Conflicting appointment' });
    }
    res.status(201).json(nuevaCita);
});
app.listen(port, () => {
    console.log(`API server listening on port \${port}\`);
});
    );
});
