import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { pacienteSchema } from '../../../core/validation/pacienteSchemas';
import jwtAuthMiddleware from '../../auth/jwtAuthMiddleware';
import { roleAuthMiddleware } from '../../auth/roleAuthMiddleware';

// In-memory patients store for demonstration
let pacientes: Array<{ id: string; nombre: string; email: string; telefono: string }> = [];

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run JWT auth middleware
  await runMiddleware(req, res, jwtAuthMiddleware);
  // Run role auth middleware for admin and doctor roles
  await runMiddleware(req, res, roleAuthMiddleware(['admin', 'doctor']));

  const { method, body, query } = req;

  try {
    switch (method) {
      case 'GET':
        // List all patients
        res.status(200).json(pacientes);
        break;

      case 'POST':
        // Validate body
        const parsedPost = pacienteSchema.safeParse(body);
        if (!parsedPost.success) {
          return res.status(400).json({ error: parsedPost.error.errors });
        }
        // Create new patient
        const newPaciente = { id: Date.now().toString(), ...parsedPost.data };
        pacientes.push(newPaciente);
        res.status(201).json(newPaciente);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling pacientes API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function pacienteByIdHandler(req: NextApiRequest, res: NextApiResponse) {
  // Run JWT auth middleware
  await runMiddleware(req, res, jwtAuthMiddleware);
  // Run role auth middleware for admin and doctor roles
  await runMiddleware(req, res, roleAuthMiddleware(['admin', 'doctor']));

  const { method, body, query } = req;
  const { id } = query;

  try {
    const pacienteIndex = pacientes.findIndex((p) => p.id === id);
    if (pacienteIndex === -1) {
      return res.status(404).json({ error: 'Paciente not found' });
    }

    switch (method) {
      case 'GET':
        res.status(200).json(pacientes[pacienteIndex]);
        break;

      case 'PUT':
        // Validate body
        const parsedPut = pacienteSchema.safeParse(body);
        if (!parsedPut.success) {
          return res.status(400).json({ error: parsedPut.error.errors });
        }
        pacientes[pacienteIndex] = { id: id as string, ...parsedPut.data };
        res.status(200).json(pacientes[pacienteIndex]);
        break;

      case 'DELETE':
        pacientes.splice(pacienteIndex, 1);
        res.status(204).end();
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling paciente by ID API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
