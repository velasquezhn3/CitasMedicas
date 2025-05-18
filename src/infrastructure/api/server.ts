import jwtAuthMiddleware from '../../../auth/jwtAuthMiddleware';

import express, { Request, Response } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { AgendarCita } from '../../core/use-cases/AgendarCita';
import { Cita } from '../../core/entities/Cita';
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  delay,
} from '@adiwajshing/baileys';
import { useSingleFileAuthState } from '@adiwajshing/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { setupWebSocket } from './ws-server';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());

// Add JWT middleware for /api routes
app.use('/api', jwtAuthMiddleware);

const agendarCita = new AgendarCita();

// Logger
const logger = pino({
  level: 'debug',
  ...(process.env.NODE_ENV === 'test'
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        },
      }),
});

// Auth state
const authFile = path.resolve(__dirname, '../../auth/default-connection.json');

// Store
const store = makeInMemoryStore({ logger });
store.readFromFile(authFile);
setInterval(() => {
  store.writeToFile(authFile);
}, 10_000);

let sock: ReturnType<typeof makeWASocket> | null = null;
export let isWhatsAppConnected = false;

let state: any;
let saveCreds: any;

// Inicializa el estado de autenticación de forma asíncrona y correcta
async function startSock() {
  // useSingleFileAuthState returns { state, saveCreds }
  const { state: authState, saveState } = useSingleFileAuthState(authFile);
  saveCreds = saveState;
  state = authState;

  const { version, isLatest } = await fetchLatestBaileysVersion();
  logger.info(`Using WA version v${version.join('.')}, isLatest: ${isLatest}`);

  sock = makeWASocket({
    logger,
    printQRInTerminal: true,
    auth: state,
    version,
    browser: ['Chrome', 'Linux', '4.0.0'],
  });

  store.bind(sock.ev);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      logger.info('QR code received, scan please.');
    }

    if (connection === 'close') {
      isWhatsAppConnected = false;
      const shouldReconnect =
        (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
      logger.warn(
        `Connection closed due to ${lastDisconnect?.error}, reconnecting: ${shouldReconnect}`
      );
      if (shouldReconnect) {
        reconnectWithBackoff();
      }
    } else if (connection === 'open') {
      isWhatsAppConnected = true;
      logger.info('Connected to WhatsApp Web');
    } else if (connection === 'connecting') {
      isWhatsAppConnected = false;
      logger.warn(`Connection state: ${connection}, attempting reconnect`);
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

async function reconnectWithBackoff() {
  if (reconnectAttempts >= maxReconnectAttempts) {
    logger.error('Max reconnect attempts reached, giving up');
    return;
  }
  reconnectAttempts++;
  const delayMs = Math.min(1000 * 2 ** reconnectAttempts, 30000);
  logger.info(`Reconnecting in ${delayMs}ms (attempt ${reconnectAttempts})`);
  await delay(delayMs);
  await startSock();
}

async function deleteAuthState() {
  try {
    if (fs.existsSync(authFile)) {
      fs.unlinkSync(authFile);
      logger.info('Deleted auth state file');
    }
  } catch (error) {
    logger.error('Error deleting auth state file:', error);
  }
}

app.post('/whatsapp/delete-auth-state', async (_req: Request, res: Response) => {
  await deleteAuthState();
  res.json({ message: 'Auth state deleted' });
});

app.get('/whatsapp/qr-code', (_req: Request, res: Response) => {
  res.json({ message: 'Scan QR code in terminal' });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.post('/whatsapp/reset-connection', async (_req: Request, res: Response) => {
  try {
    if (sock) {
      await sock.logout();
      sock = null;
    }
    await startSock();
    reconnectAttempts = 0;
    res.json({ message: 'Connection reset, scan QR code in terminal' });
  } catch (error) {
    logger.error('Failed to reset connection:', error);
    res.status(500).json({ error: 'Failed to reset connection' });
  }
});

app.post('/whatsapp/logout', async (_req: Request, res: Response) => {
  try {
    if (sock) {
      await sock.logout();
      sock = null;
    }
    await deleteAuthState();
    await startSock();
    reconnectAttempts = 0;
    res.json({ message: 'Logged out and new QR code generated' });
  } catch (error) {
    logger.error('Failed to logout:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

const server = http.createServer(app);

setupWebSocket(server);

server.listen(port, undefined, () => {
  logger.info(`API server listening on port ${port}`);
});

import process from 'process';

// Add graceful shutdown handlers
let shuttingDown = false;

const shutdown = () => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info('Shutdown initiated, closing server');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force exit if not closed in 10 seconds
  setTimeout(() => {
    logger.error('Forcing shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export async function createConnection() {
  try {
    await startSock();
    isWhatsAppConnected = true;
  } catch (error) {
    isWhatsAppConnected = false;
    throw error;
  }
}

export { sock as socket };
