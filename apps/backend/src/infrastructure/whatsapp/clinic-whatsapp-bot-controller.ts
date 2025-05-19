import { proto, WASocket, makeWALegacySocket } from '@adiwajshing/baileys';
import ConnectionManagerSingleton from './connection-manager-singleton';
import pino from 'pino';

const logger = pino({ level: 'info' });

class ClinicWhatsAppBotController {
  private socket?: ReturnType<typeof makeWALegacySocket>;
  private redisClient;

  constructor() {
    this.redisClient = ConnectionManagerSingleton.getRedisClient();
    this.socket = ConnectionManagerSingleton.getSocket();
    if (!this.socket) {
      ConnectionManagerSingleton.connect().then(() => {
        this.socket = ConnectionManagerSingleton.getSocket();
        this.setupListeners();
      });
    } else {
      this.setupListeners();
    }
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.ev.on('messages.upsert', async (m: any) => {
      const messages = m.messages;
      for (const msg of messages) {
        if (!msg.message) continue;
        const messageType = Object.keys(msg.message)[0];
        const sender = msg.key.remoteJid;
        logger.info(`Received message of type ${messageType} from ${sender}`);

        // Handle commands
        if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
          const text = messageType === 'conversation' ? msg.message.conversation : msg.message.extendedTextMessage?.text;
          if (!text) return;

          if (text.startsWith('/nuevacita')) {
            await this.handleNewAppointment(sender!, text);
          } else if (text.startsWith('/micitas')) {
            await this.handleMyAppointments(sender!);
          } else if (text.startsWith('/cancelar')) {
            await this.handleCancelAppointment(sender!, text);
          } else if (text.startsWith('/historial')) {
            await this.handleHistory(sender!);
          } else {
            await this.sendMessage(sender!, 'Comando no reconocido. Por favor use /nuevacita, /micitas, /cancelar, o /historial.');
          }
        }
      }
    });
  }

  private async handleNewAppointment(sender: string, text: string) {
    try {
      // Parse command: /nuevacita YYYY-MM-DD HH:mm description
      const parts = text.split(' ');
      if (parts.length < 3) {
        await this.sendMessage(sender, 'Uso: /nuevacita YYYY-MM-DD HH:mm [descripcion]');
        return;
      }
      const dateStr = parts[1] + 'T' + parts[2] + ':00Z';
      const description = parts.slice(3).join(' ') || '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        await this.sendMessage(sender, 'Fecha u hora inválida. Formato esperado: YYYY-MM-DD HH:mm');
        return;
      }

      // Save appointment in Redis list keyed by sender
      const appointment = {
        id: Date.now().toString(),
        date: date.toISOString(),
        description,
        status: 'scheduled',
      };
      await this.redisClient.lpush(`appointments:${sender}`, JSON.stringify(appointment));
      await this.sendMessage(sender, `Cita creada para ${date.toISOString()} con descripción: ${description}`);
    } catch (error) {
      await this.sendMessage(sender, 'Error al crear la cita. Intente nuevamente.');
    }
  }

  private async handleMyAppointments(sender: string) {
    try {
      const appointmentsData = await this.redisClient.lrange(`appointments:${sender}`, 0, -1);
      if (!appointmentsData || appointmentsData.length === 0) {
        await this.sendMessage(sender, 'No tienes citas programadas.');
        return;
      }
      const appointments = appointmentsData.map((a: any) => JSON.parse(a));
      let message = 'Tus citas programadas:\n';
      appointments.forEach((a: any, i: number) => {
        message += `${i + 1}. ${a.date} - ${a.description} (Estado: ${a.status})\n`;
      });
      await this.sendMessage(sender, message);
    } catch (error) {
      await this.sendMessage(sender, 'Error al obtener tus citas.');
    }
  }

  private async handleCancelAppointment(sender: string, text: string) {
    try {
      // Parse command: /cancelar <appointment_id>
      const parts = text.split(' ');
      if (parts.length < 2) {
        await this.sendMessage(sender, 'Uso: /cancelar <id_de_cita>');
        return;
      }
      const idToCancel = parts[1];
      const appointmentsData = await this.redisClient.lrange(`appointments:${sender}`, 0, -1);
      if (!appointmentsData || appointmentsData.length === 0) {
        await this.sendMessage(sender, 'No tienes citas para cancelar.');
        return;
      }
      let found = false;
      for (let i = 0; i < appointmentsData.length; i++) {
        const appointment = JSON.parse(appointmentsData[i]);
        if (appointment.id === idToCancel) {
          appointmentsData.splice(i, 1);
          found = true;
          break;
        }
      }
      if (!found) {
        await this.sendMessage(sender, 'Cita no encontrada.');
        return;
      }
      // Replace list with updated appointments
      await this.redisClient.del(`appointments:${sender}`);
      if (appointmentsData.length > 0) {
        await this.redisClient.rpush(`appointments:${sender}`, ...appointmentsData);
      }
      await this.sendMessage(sender, `Cita con id ${idToCancel} cancelada.`);
    } catch (error) {
      await this.sendMessage(sender, 'Error al cancelar la cita.');
    }
  }

  private async handleHistory(sender: string) {
    try {
      const appointmentsData = await this.redisClient.lrange(`appointments:${sender}`, 0, -1);
      if (!appointmentsData || appointmentsData.length === 0) {
        await this.sendMessage(sender, 'No tienes historial de citas.');
        return;
      }
      const appointments = appointmentsData.map((a: any, i: number) => JSON.parse(a));
      let message = 'Historial de tus citas:\n';
      appointments.forEach((a: any, i: number) => {
        message += `${i + 1}. ${a.date} - ${a.description} (Estado: ${a.status})\n`;
      });
      await this.sendMessage(sender, message);
    } catch (error) {
      await this.sendMessage(sender, 'Error al obtener el historial de citas.');
    }
  }

  private async sendMessage(jid: string, text: string) {
    if (!this.socket) return;
    await this.socket.sendMessage(jid, { text });
  }
}

export default new ClinicWhatsAppBotController();
