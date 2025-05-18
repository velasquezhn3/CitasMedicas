import express from 'express';
import dotenv from 'dotenv';
import { AgendarCita } from '../../core/use-cases/AgendarCita';
import { Cita } from '../../core/entities/Cita';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const agendarCita = new AgendarCita();

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
  const nuevaCita: Cita = req.body;

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
  console.log(\`API server listening on port \${port}\`);
});
