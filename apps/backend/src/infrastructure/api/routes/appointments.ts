import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createAppointmentSchema, updateAppointmentSchema } from '../../../core/validation/appointmentSchemas';
import { jwtAuthMiddleware } from '../../../auth/jwtAuthMiddleware';
import { roleAuthMiddleware } from '../../../auth/roleAuthMiddleware';

const router = Router();

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  description?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const appointments: Appointment[] = [];

// Create appointment
router.post(
  '/',
  jwtAuthMiddleware,
  roleAuthMiddleware(['patient', 'doctor', 'admin']),
  (req: Request, res: Response) => {
    try {
      const parsed = createAppointmentSchema.parse(req.body);
      const newAppointment: Appointment = {
        id: (Math.random() * 1000000).toFixed(0),
        ...parsed,
        status: 'scheduled',
      };
      appointments.push(newAppointment);
      res.status(201).json(newAppointment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Read all appointments
router.get(
  '/',
  jwtAuthMiddleware,
  roleAuthMiddleware(['patient', 'doctor', 'admin']),
  (req: Request, res: Response) => {
    res.json(appointments);
  }
);

// Read appointment by id
router.get(
  '/:id',
  jwtAuthMiddleware,
  roleAuthMiddleware(['patient', 'doctor', 'admin']),
  (req: Request, res: Response) => {
    const appointment = appointments.find((a) => a.id === req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  }
);

// Update appointment
router.put(
  '/:id',
  jwtAuthMiddleware,
  roleAuthMiddleware(['doctor', 'admin']),
  (req: Request, res: Response) => {
    try {
      const parsed = updateAppointmentSchema.parse(req.body);
      const index = appointments.findIndex((a) => a.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      appointments[index] = { ...appointments[index], ...parsed };
      res.json(appointments[index]);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Delete appointment
router.delete(
  '/:id',
  jwtAuthMiddleware,
  roleAuthMiddleware(['admin']),
  (req: Request, res: Response) => {
    const index = appointments.findIndex((a) => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    appointments.splice(index, 1);
    res.status(204).send();
  }
);

export default router;
