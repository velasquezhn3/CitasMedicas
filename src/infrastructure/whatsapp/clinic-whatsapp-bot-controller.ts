import makeWASocket, { useMultiFileAuthState, DisconnectReason, proto } from '@adiwajshing/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
let qrcodeTerminal: any;
try {
  qrcodeTerminal = require('qrcode-terminal');
} catch {
  qrcodeTerminal = null;
}
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { AgendarCita } from '../../core/use-cases/AgendarCita';

const dataDir = path.join(__dirname, '../../../auth/clinic-session');

class ClinicWhatsAppBot extends EventEmitter {
  private socket: ReturnType<typeof makeWASocket> | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private agendarCita: AgendarCita;

  constructor() {
    super();
    this.agendarCita = new AgendarCita();
  }

  async start() {
    const { state, saveCreds } = await useMultiFileAuthState(dataDir);

    this.socket = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'info' }),
      browser: ['ClinicBot', 'Chrome', '1.0.0'],
    });

    this.socket.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrcodeTerminal.generate(qr, { small: true });
        try {
          const qrImage = await QRCode.toDataURL(qr);
          this.emit('qr', { qr, qrImage });
        } catch (err) {
          this.emit('qr', { qr });
        }
      }

      if (connection === 'open') {
        this.connected = true;
        this.reconnectAttempts = 0;
        console.log('WhatsApp connection opened');
        this.emit('connected');
      } else if (connection === 'close') {
        this.connected = false;
        console.log('WhatsApp connection closed');
        if (lastDisconnect) {
          const statusCode = lastDisconnect.error?.output?.statusCode || lastDisconnect.statusCode;
          if (statusCode === DisconnectReason.loggedOut) {
            console.log('Logged out, deleting session and restarting...');
            await this.resetAuthState();
            setTimeout(() => this.start(), 3000);
            return;
          }
        }
        this.reconnectAttempts++;
        const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
        console.log(`Reconnecting in ${delay}ms`);
        setTimeout(() => this.start(), delay);
      }
    });

    this.socket.ev.on('creds.update', saveCreds);

    this.socket.ev.on('messages.upsert', async (event: { messages: proto.IWebMessageInfo[]; type: string }) => {
      if (event.type !== 'notify') return;
      const msg = event.messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const sender = msg.key.remoteJid!;
      const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

      await this.processMessage(sender, messageContent);
    });

    console.log('Clinic WhatsApp bot started. Scan the QR code to connect.');
  }

  async resetAuthState() {
    try {
      await fs.promises.rm(dataDir, { recursive: true, force: true });
      console.log('Auth state reset');
    } catch (error) {
      console.error('Failed to reset auth state:', error);
    }
  }

  async processMessage(sender: string, message: string) {
    const text = message.trim().toLowerCase();

    if (text === '/menu') {
      await this.sendMenu(sender);
    } else if (text === '1' || text === 'agendar cita') {
      await this.sendMessage(sender, 'Por favor, envíe los detalles de la cita en el formato:\nDoctorId, PacienteId, FechaHora(ISO), Especialidad');
    } else if (text.includes(',')) {
      // Try to parse appointment details
      const parts = message.split(',');
      if (parts.length >= 4) {
        const doctorId = Number(parts[0].trim());
        const pacienteId = parts[1].trim();
        const fechaHoraStr = parts[2].trim();
        const especialidad = parts[3].trim();

        if (isNaN(doctorId)) {
          await this.sendMessage(sender, 'DoctorId inválido. Debe ser un número.');
          return;
        }

        const fechaHora = new Date(fechaHoraStr);
        if (isNaN(fechaHora.getTime())) {
          await this.sendMessage(sender, 'FechaHora inválida. Por favor use formato ISO, por ejemplo: 2023-07-01T15:00:00');
          return;
        }

        const fechaHoraFin = new Date(fechaHora.getTime() + 30 * 60000);

        const result = await this.agendarCita.execute({
          doctorId,
          pacienteId,
          fechaHoraInicio: fechaHora,
          fechaHoraFin,
          especialidad,
        });

        if (result.success) {
          await this.sendMessage(sender, 'Cita agendada exitosamente.');
        } else {
          await this.sendMessage(sender, `Error al agendar cita: ${result.error}`);
        }
      } else {
        await this.sendMessage(sender, 'Formato incorrecto. Por favor envíe: DoctorId, PacienteId, FechaHora(ISO), Especialidad');
      }
    } else {
      await this.sendMessage(sender, 'Comando no reconocido. Escriba /menu para ver opciones.');
    }
  }

  async sendMenu(sender: string) {
    const menu = 'Bienvenido al sistema de citas médicas.\nOpciones:\n1. Agendar cita\nEscriba el número o el comando.';
    await this.sendMessage(sender, menu);
  }

  async sendMessage(to: string, message: string) {
    if (!this.socket) return;
    await this.socket.sendMessage(to, { text: message });
  }
}

const clinicBot = new ClinicWhatsAppBot();

clinicBot.on('qr', ({ qr, qrImage }) => {
  console.log('QR code received. Scan it with WhatsApp.');
  // Optionally, save or serve the QR image
});

clinicBot.on('connected', () => {
  console.log('WhatsApp bot connected and ready.');
});

clinicBot.start().catch(console.error);

export default clinicBot;
