import { z } from 'zod';

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  description: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }).optional(),
  description: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
});
