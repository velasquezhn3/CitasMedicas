import { Worker } from 'bullmq';
import { socket, createConnection, isWhatsAppConnected } from '../../infrastructure/api/server';

interface RecordatorioPayload {
  pacienteId: string;
  mensaje: string;
  fecha: Date;
}

// Verificar conexión antes de enviar mensajes
const checkConnection = () => {
  if (!isWhatsAppConnected) {
    throw new Error('No active WhatsApp connections available');
  }
};

// Processor function for the worker
export const processor = async (job: any) => {
  try {
    const { pacienteId, mensaje } = job.data;

    // 1. Obtener número de WhatsApp del paciente (implementación real)
    const patientWhatsAppNumber = await obtenerNumeroWhatsApp(pacienteId); // Implementar esta función

    // 2. Verificar conexión
    checkConnection();

    // 3. Enviar mensaje
    await socket?.sendMessage(patientWhatsAppNumber, { text: mensaje });

    return { success: true };
  } catch (error: any) {
    console.error(`Job ${job.id} failed with error ${error.message}`);
    throw error;
  }
};

// Worker para procesar cola de recordatorios
export const worker = new Worker<RecordatorioPayload>(
  'recordatorios',
  processor,
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  }
);

// Implementación temporal para desarrollo
export async function obtenerNumeroWhatsApp(pacienteId: string): Promise<string> {
  // Implementar lógica real de base de datos aquí
  return '1234567890@s.whatsapp.net'; // Número de prueba oficial de WhatsApp
}
