/* eslint-disable @typescript-eslint/ban-ts-comment */
import QRCode from 'qrcode';
import pino from 'pino';

import { DisconnectReason, useMultiFileAuthState, proto } from '@adiwajshing/baileys';
import makeWASocket from '@adiwajshing/baileys';
import { Boom } from '@hapi/boom';
import { EventEmitter } from 'events';
import fs from 'fs/promises';


export interface ConnectionInfo {
  id: string;
  socket: ReturnType<typeof makeWASocket>;
  qr?: string;
  qrImage?: string; // base64 image string
  connected: boolean;
  reconnectAttempts: number;
}

export class ConnectionManager extends EventEmitter {
  private connections: Map<string, ConnectionInfo> = new Map();

  constructor() {
    super();
  }

  private async authStateExists(id: string): Promise<boolean> {
    try {
      const files = await fs.readdir(`./auth/${id}`);
      return files.length > 0;
    } catch {
      return false;
    }
  }

  async createConnection(id: string) {
    if (this.connections.has(id)) {
      return this.connections.get(id);
    }

    const authExists = await this.authStateExists(id);
    if (!authExists) {
      console.warn(`Auth state directory does not exist for id: ${id}, creating new connection`);
      // Do not throw error, allow new connection creation without existing auth state
    }

    const { state, saveCreds } = await useMultiFileAuthState(`./auth/${id}`);

    console.log('Auth state keys:', Object.keys(state));
    // Do not throw error if state is empty, allow new connection creation
    if (!state) {
      console.warn(`Auth state is undefined for id: ${id}, proceeding with empty state`);
    }

      const socket = makeWASocket({
        auth: state,
        printQRInTerminal: false, // disable default terminal QR printing
        logger: pino({ level: 'debug' }),
        // Add custom WebSocket options for debugging
        browser: ['Baileys', 'Chrome', '4.0.0'],
        // Optionally, add a custom WebSocket implementation or headers here if needed
      });

    const connectionInfo: ConnectionInfo = {
      id,
      socket,
      connected: false,
      reconnectAttempts: 0,
    };

    this.connections.set(id, connectionInfo);

    socket.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        connectionInfo.qr = qr;

        // Generate base64 QR code image using qrcode package
        try {
          const qrImage = await QRCode.toDataURL(qr);
          connectionInfo.qrImage = qrImage;
          this.emit('qr', { id, qr, qrImage });
        } catch (error) {
          console.error('Failed to generate QR code image:', error);
          this.emit('qr', { id, qr });
        }
      }
      if (connection === 'open') {
        connectionInfo.connected = true;
        connectionInfo.reconnectAttempts = 0;
        this.emit('connected', { id });
      } else if (connection === 'close') {
        connectionInfo.connected = false;
        if (lastDisconnect) {
          console.error(`Connection closed for id ${id}:`, lastDisconnect.error);
        }
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          this.emit('reconnecting', { id });
          this.reconnect(id, connectionInfo.reconnectAttempts + 1);
        } else {
          this.emit('disconnected', { id });
          this.connections.delete(id);
        }
      }
    });

    socket.ev.on('creds.update', saveCreds);

    socket.ev.on('messages.upsert', async (event: { messages: proto.IWebMessageInfo[]; type: string }) => {
      const { messages, type } = event;
      if (type !== 'notify') return;
      const msg = messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const sender = msg.key.remoteJid!;
      const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

      if (messageContent === '/backup') {
        const phoneNumber = sender.split('@')[0];

        async function fetchMedicalHistory(phone: string): Promise<string[]> {
          return [
            'Consulta 1: Diagnóstico A, Tratamiento X',
            'Consulta 2: Diagnóstico B, Tratamiento Y',
            'Consulta 3: Diagnóstico C, Tratamiento Z',
          ];
        }

        const historial = await fetchMedicalHistory(phoneNumber);
        const backupText = `Historial médico:\n${historial.join('\n')}`;

        await socket.sendMessage(sender, { text: backupText });
      } else if (messageContent === '/menu') {
        const buttons = [
          { buttonId: '1', buttonText: { displayText: 'Agendar Cita' }, type: 1 },
          { buttonId: '2', buttonText: { displayText: 'Mis Citas' }, type: 1 },
          { buttonId: '3', buttonText: { displayText: 'Contacto' }, type: 1 },
        ];
        const buttonMessage = {
          text: 'Seleccione una opción:',
          buttons,
          headerType: 1,
        };
        await socket.sendMessage(sender, buttonMessage);
      } else if (msg.message.listResponseMessage) {
        const selectedId = msg.message.listResponseMessage.singleSelectReply?.selectedRowId;
        if (selectedId) {
          await socket.sendMessage(sender, { text: `Usted seleccionó la opción ${selectedId}` });
        }
      }
    });

    return connectionInfo;
  }

  async reconnect(id: string, attempt: number) {
    const connectionInfo = this.connections.get(id);
    if (connectionInfo) {
      connectionInfo.reconnectAttempts = attempt;
    }
    this.connections.delete(id);

    const delay = Math.min(1000 * 2 ** attempt, 30000);
    console.log(`Reconnecting to ${id} in ${delay}ms (attempt ${attempt})`);
    await new Promise((resolve) => setTimeout(resolve, delay));

    await this.createConnection(id);
  }

  getConnection(id: string): ConnectionInfo | undefined {
    return this.connections.get(id);
  }

  getAllConnections(): ConnectionInfo[] {
    return Array.from(this.connections.values());
  }

  async resetAuthState(id: string) {
    try {
      await fs.rm(`./auth/${id}`, { recursive: true, force: true });
      console.log(`Auth state reset for id: ${id}`);
      this.connections.delete(id);
    } catch (error) {
      console.error(`Failed to reset auth state for id ${id}:`, error);
    }
  }
}
