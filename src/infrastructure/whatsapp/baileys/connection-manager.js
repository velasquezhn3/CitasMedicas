"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionManager = void 0;
/* eslint-disable @typescript-eslint/ban-ts-comment */
const qrcode_1 = __importDefault(require("qrcode"));
const pino_1 = __importDefault(require("pino"));
const baileys_1 = require("@adiwajshing/baileys");
const baileys_2 = __importDefault(require("@adiwajshing/baileys"));
const events_1 = require("events");
const promises_1 = __importDefault(require("fs/promises"));
class ConnectionManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.connections = new Map();
    }
    async authStateExists(id) {
        try {
            const files = await promises_1.default.readdir(`./auth/${id}`);
            return files.length > 0;
        }
        catch {
            return false;
        }
    }
    async createConnection(id) {
        if (this.connections.has(id)) {
            return this.connections.get(id);
        }
        const authExists = await this.authStateExists(id);
        if (!authExists) {
            console.warn(`Auth state directory does not exist for id: ${id}, creating new connection`);
            // Do not throw error, allow new connection creation without existing auth state
        }
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(`./auth/${id}`);
        console.log('Auth state keys:', Object.keys(state));
        // Do not throw error if state is empty, allow new connection creation
        if (!state) {
            console.warn(`Auth state is undefined for id: ${id}, proceeding with empty state`);
        }
        const socket = (0, baileys_2.default)({
            auth: state,
            printQRInTerminal: false, // disable default terminal QR printing
            logger: (0, pino_1.default)({ level: 'debug' }),
            // Add custom WebSocket options for debugging
            browser: ['Baileys', 'Chrome', '4.0.0'],
            // Optionally, add a custom WebSocket implementation or headers here if needed
        });
        const connectionInfo = {
            id,
            socket,
            connected: false,
            reconnectAttempts: 0,
        };
        this.connections.set(id, connectionInfo);
        socket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) {
                connectionInfo.qr = qr;
                // Generate base64 QR code image using qrcode package
                try {
                    const qrImage = await qrcode_1.default.toDataURL(qr);
                    connectionInfo.qrImage = qrImage;
                    this.emit('qr', { id, qr, qrImage });
                }
                catch (error) {
                    console.error('Failed to generate QR code image:', error);
                    this.emit('qr', { id, qr });
                }
            }
            if (connection === 'open') {
                connectionInfo.connected = true;
                connectionInfo.reconnectAttempts = 0;
                this.emit('connected', { id });
            }
            else if (connection === 'close') {
                connectionInfo.connected = false;
                if (lastDisconnect) {
                    console.error(`Connection closed for id ${id}:`, lastDisconnect.error);
                }
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== baileys_1.DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    this.emit('reconnecting', { id });
                    this.reconnect(id, connectionInfo.reconnectAttempts + 1);
                }
                else {
                    this.emit('disconnected', { id });
                    this.connections.delete(id);
                }
            }
        });
        socket.ev.on('creds.update', saveCreds);
        socket.ev.on('messages.upsert', async (event) => {
            const { messages, type } = event;
            if (type !== 'notify')
                return;
            const msg = messages[0];
            if (!msg.message || msg.key.fromMe)
                return;
            const sender = msg.key.remoteJid;
            const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
            if (messageContent === '/backup') {
                const phoneNumber = sender.split('@')[0];
                async function fetchMedicalHistory(phone) {
                    return [
                        'Consulta 1: Diagnóstico A, Tratamiento X',
                        'Consulta 2: Diagnóstico B, Tratamiento Y',
                        'Consulta 3: Diagnóstico C, Tratamiento Z',
                    ];
                }
                const historial = await fetchMedicalHistory(phoneNumber);
                const backupText = `Historial médico:\n${historial.join('\n')}`;
                await socket.sendMessage(sender, { text: backupText });
            }
            else if (messageContent === '/menu') {
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
            }
            else if (msg.message.listResponseMessage) {
                const selectedId = msg.message.listResponseMessage.singleSelectReply?.selectedRowId;
                if (selectedId) {
                    await socket.sendMessage(sender, { text: `Usted seleccionó la opción ${selectedId}` });
                }
            }
        });
        return connectionInfo;
    }
    async reconnect(id, attempt) {
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
    getConnection(id) {
        return this.connections.get(id);
    }
    getAllConnections() {
        return Array.from(this.connections.values());
    }
    async resetAuthState(id) {
        try {
            await promises_1.default.rm(`./auth/${id}`, { recursive: true, force: true });
            console.log(`Auth state reset for id: ${id}`);
            this.connections.delete(id);
        }
        catch (error) {
            console.error(`Failed to reset auth state for id ${id}:`, error);
        }
    }
}
exports.ConnectionManager = ConnectionManager;
