"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = __importStar(require("@adiwajshing/baileys"));
const pino_1 = __importDefault(require("pino"));
const qrcode_1 = __importDefault(require("qrcode"));
let qrcodeTerminal;
try {
    qrcodeTerminal = require('qrcode-terminal');
}
catch {
    qrcodeTerminal = null;
}
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const events_1 = require("events");
const AgendarCita_1 = require("../../core/use-cases/AgendarCita");
const dataDir = path_1.default.join(__dirname, '../../../auth/clinic-session');
class ClinicWhatsAppBot extends events_1.EventEmitter {
    constructor() {
        super();
        this.socket = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.agendarCita = new AgendarCita_1.AgendarCita();
    }
    async start() {
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(dataDir);
        this.socket = (0, baileys_1.default)({
            auth: state,
            printQRInTerminal: false,
            logger: (0, pino_1.default)({ level: 'info' }),
            browser: ['ClinicBot', 'Chrome', '1.0.0'],
        });
        this.socket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) {
                qrcodeTerminal.generate(qr, { small: true });
                try {
                    const qrImage = await qrcode_1.default.toDataURL(qr);
                    this.emit('qr', { qr, qrImage });
                }
                catch (err) {
                    this.emit('qr', { qr });
                }
            }
            if (connection === 'open') {
                this.connected = true;
                this.reconnectAttempts = 0;
                console.log('WhatsApp connection opened');
                this.emit('connected');
            }
            else if (connection === 'close') {
                this.connected = false;
                console.log('WhatsApp connection closed');
                if (lastDisconnect) {
                    const statusCode = lastDisconnect.error?.output?.statusCode || lastDisconnect.statusCode;
                    if (statusCode === baileys_1.DisconnectReason.loggedOut) {
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
        this.socket.ev.on('messages.upsert', async (event) => {
            if (event.type !== 'notify')
                return;
            const msg = event.messages[0];
            if (!msg.message || msg.key.fromMe)
                return;
            const sender = msg.key.remoteJid;
            const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
            await this.processMessage(sender, messageContent);
        });
        console.log('Clinic WhatsApp bot started. Scan the QR code to connect.');
    }
    async resetAuthState() {
        try {
            await fs_1.default.promises.rm(dataDir, { recursive: true, force: true });
            console.log('Auth state reset');
        }
        catch (error) {
            console.error('Failed to reset auth state:', error);
        }
    }
    async processMessage(sender, message) {
        const text = message.trim().toLowerCase();
        if (text === '/menu') {
            await this.sendMenu(sender);
        }
        else if (text === '1' || text === 'agendar cita') {
            await this.sendMessage(sender, 'Por favor, envíe los detalles de la cita en el formato:\nDoctorId, PacienteId, FechaHora(ISO), Especialidad');
        }
        else if (text.includes(',')) {
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
                }
                else {
                    await this.sendMessage(sender, `Error al agendar cita: ${result.error}`);
                }
            }
            else {
                await this.sendMessage(sender, 'Formato incorrecto. Por favor envíe: DoctorId, PacienteId, FechaHora(ISO), Especialidad');
            }
        }
        else {
            await this.sendMessage(sender, 'Comando no reconocido. Escriba /menu para ver opciones.');
        }
    }
    async sendMenu(sender) {
        const menu = 'Bienvenido al sistema de citas médicas.\nOpciones:\n1. Agendar cita\nEscriba el número o el comando.';
        await this.sendMessage(sender, menu);
    }
    async sendMessage(to, message) {
        if (!this.socket)
            return;
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
exports.default = clinicBot;
