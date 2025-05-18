import express, { Request, Response, NextFunction } from 'express';
import { AgendarCita } from '../../core/use-cases/AgendarCita';
import { Cita } from '../../core/entities/Cita';
import { ConnectionManager } from '../../whatsapp/connection-manager-singleton';

const app = express();
app.use(express.json());

const agendarCita = new AgendarCita();

const connectionManager = new ConnectionManager();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return function (req: Request, res: Response, next: NextFunction) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

app.get('/citas', async (req: Request, res: Response) => {
  const citas = await agendarCita.obtenerCitas();
  res.json(citas);
});

app.post('/citas', asyncHandler(async (req: Request, res: Response) => {
  const nuevaCita: Cita = req.body;

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
      fechaHoraFin: (nuevaCita as any).fechaHoraFin || new Date(nuevaCita.fechaHora.getTime() + 30 * 60000),
      especialidad: nuevaCita.especialidad,
    });
  } catch (error) {
    console.error('Error executing agendarCita:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

  if (!result.success) {
    return res.status(409).json({ error: result.error });
  }

  res.status(201).json(nuevaCita);
}));

// New endpoint to get QR codes for all active WhatsApp connections
app.get('/whatsapp/qr-codes', (req: Request, res: Response) => {
  const connections = connectionManager.getAllConnections();
  const qrCodes = connections.map((conn: any) => ({
    id: conn.id,
    qr: conn.qr || null,
    connected: conn.connected,
  }));
  res.json(qrCodes);
});

app.post('/whatsapp/reset-connections', async (req: Request, res: Response) => {
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset connections' });
  }
});

export default app;
