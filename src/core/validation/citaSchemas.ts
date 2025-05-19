import { z } from 'zod';

export const createAppointmentSchema = z.object({
  doctorId: z.number().int().positive(),
  pacienteId: z.string().min(1),
  fechaHoraInicio: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start date',
  }),
  fechaHoraFin: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid end date',
  }),
  especialidad: z.string().min(1),
});
