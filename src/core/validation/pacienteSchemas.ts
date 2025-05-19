import { z } from 'zod';

export const pacienteSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  telefono: z.string().min(1),
});
