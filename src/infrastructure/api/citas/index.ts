import type { NextApiRequest, NextApiResponse } from 'next';
import { AgendarCita } from '../../../core/use-cases/AgendarCita';

const agendarCita = new AgendarCita();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;

  try {
    switch (method) {
      case 'GET':
        // List all appointments
        const citas = await agendarCita.obtenerCitas();
        res.status(200).json(citas);
        break;

      case 'POST':
        // Create new appointment
        const { doctorId, pacienteId, fechaHoraInicio, fechaHoraFin, especialidad } = body;
        if (!doctorId || !pacienteId || !fechaHoraInicio || !fechaHoraFin || !especialidad) {
          res.status(400).json({ error: 'Missing required fields' });
          return;
        }
        const result = await agendarCita.execute({
          doctorId: Number(doctorId),
          pacienteId,
          fechaHoraInicio: new Date(fechaHoraInicio),
          fechaHoraFin: new Date(fechaHoraFin),
          especialidad,
        });
        if (!result.success) {
          res.status(409).json({ error: result.error });
          return;
        }
        res.status(201).json({ message: 'Appointment created successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling citas API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
