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
exports.socket = exports.isWhatsAppConnected = void 0;
exports.createConnection = createConnection;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const AgendarCita_1 = require("../../core/use-cases/AgendarCita");
const baileys_1 = __importStar(require("@adiwajshing/baileys"));
const baileys_2 = require("@adiwajshing/baileys");
const pino_1 = __importDefault(require("pino"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ws_server_1 = require("./ws-server");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use(express_1.default.json());
const agendarCita = new AgendarCita_1.AgendarCita();
// Logger
const logger = (0, pino_1.default)({
    level: 'debug',
    transport: process.env.NODE_ENV === 'test' ? undefined : {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
        },
    },
});
// Auth state
const authFile = path_1.default.resolve(__dirname, '../../auth/default-connection.json');
// Store
const store = (0, baileys_1.makeInMemoryStore)({ logger });
store.readFromFile(authFile);
setInterval(() => {
    store.writeToFile(authFile);
}, 10000);
let sock = null;
exports.socket = sock;
exports.isWhatsAppConnected = false;
let state;
let saveCreds;
// Inicializa el estado de autenticación de forma asíncrona y correcta
async function startSock() {
    // useSingleFileAuthState returns { state, saveCreds }
    const { state: authState, saveState } = (0, baileys_2.useSingleFileAuthState)(authFile);
    saveCreds = saveState;
    state = authState;
    const { version, isLatest } = await (0, baileys_1.fetchLatestBaileysVersion)();
    logger.info(`Using WA version v${version.join('.')}, isLatest: ${isLatest}`);
    exports.socket = sock = (0, baileys_1.default)({
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
            exports.isWhatsAppConnected = false;
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== baileys_1.DisconnectReason.loggedOut;
            logger.warn(`Connection closed due to ${lastDisconnect?.error}, reconnecting: ${shouldReconnect}`);
            if (shouldReconnect) {
                reconnectWithBackoff();
            }
        }
        else if (connection === 'open') {
            exports.isWhatsAppConnected = true;
            logger.info('Connected to WhatsApp Web');
        }
        else if (connection === 'connecting') {
            exports.isWhatsAppConnected = false;
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
    await (0, baileys_1.delay)(delayMs);
    await startSock();
}
async function deleteAuthState() {
    try {
        if (fs_1.default.existsSync(authFile)) {
            fs_1.default.unlinkSync(authFile);
            logger.info('Deleted auth state file');
        }
    }
    catch (error) {
        logger.error('Error deleting auth state file:', error);
    }
}
app.post('/whatsapp/delete-auth-state', async (_req, res) => {
    await deleteAuthState();
    res.json({ message: 'Auth state deleted' });
});
app.get('/whatsapp/qr-code', (_req, res) => {
    res.json({ message: 'Scan QR code in terminal' });
});
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.post('/whatsapp/reset-connection', async (_req, res) => {
    try {
        if (sock) {
            await sock.logout();
            exports.socket = sock = null;
        }
        await startSock();
        reconnectAttempts = 0;
        res.json({ message: 'Connection reset, scan QR code in terminal' });
    }
    catch (error) {
        logger.error('Failed to reset connection:', error);
        res.status(500).json({ error: 'Failed to reset connection' });
    }
});
app.post('/whatsapp/logout', async (_req, res) => {
    try {
        if (sock) {
            await sock.logout();
            exports.socket = sock = null;
        }
        await deleteAuthState();
        await startSock();
        reconnectAttempts = 0;
        res.json({ message: 'Logged out and new QR code generated' });
    }
    catch (error) {
        logger.error('Failed to logout:', error);
        res.status(500).json({ error: 'Failed to logout' });
    }
});
const server = http_1.default.createServer(app);
(0, ws_server_1.setupWebSocket)(server);
server.listen(port, () => {
    logger.info(`API server listening on port ${port}`);
});
async function createConnection() {
    try {
        await startSock();
        exports.isWhatsAppConnected = true;
    }
    catch (error) {
        exports.isWhatsAppConnected = false;
        throw error;
    }
}
