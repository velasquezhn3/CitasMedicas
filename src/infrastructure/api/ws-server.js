"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocket = setupWebSocket;
const ws_1 = require("ws");
const server_1 = require("./server");
const qrcode_1 = __importDefault(require("qrcode"));
const wss = new ws_1.Server({ noServer: true });
wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    // Send current connection state and QR code on new connection
    if (server_1.socket !== null && server_1.socket.ev) {
        // Listen for connection updates to send QR code and connection status
        const onConnectionUpdate = async (update) => {
            const { qr, connection } = update;
            console.log('Connection update received:', update);
            if (qr) {
                try {
                    const svgString = await qrcode_1.default.toString(qr, { type: 'svg' });
                    console.log('Generated QR code SVG');
                    ws.send(JSON.stringify({ type: 'qr', qrSvg: svgString }));
                }
                catch (err) {
                    console.error('Failed to generate QR code SVG:', err);
                }
            }
            if (connection) {
                ws.send(JSON.stringify({ type: connection }));
            }
        };
        server_1.socket.ev.on('connection.update', onConnectionUpdate);
        ws.on('close', () => {
            console.log('WebSocket client disconnected');
            if (server_1.socket !== null && server_1.socket.ev) {
                server_1.socket.ev.off('connection.update', onConnectionUpdate);
            }
        });
    }
    else {
        ws.send(JSON.stringify({ type: 'disconnected' }));
    }
});
function setupWebSocket(server) {
    server.on('upgrade', (request, socket, head) => {
        if (request.url === '/ws') {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        }
        else {
            socket.destroy();
        }
    });
}
