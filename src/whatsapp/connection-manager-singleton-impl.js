"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionManager = void 0;
const events_1 = require("events");
class ConnectionManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.connections = [];
    }
    async createConnection(id) {
        const connection = {
            id,
            qr: null,
            connected: false,
        };
        this.connections.push(connection);
        // Simulate QR code generation and connection open
        setTimeout(() => {
            connection.qr = 'FAKE_QR_CODE_' + id;
            connection.connected = true;
            this.emit('qr', { id: connection.id, qr: connection.qr, qrImage: null });
            this.emit('connected', { id: connection.id });
        }, 1000);
        return connection;
    }
    getAllConnections() {
        return this.connections;
    }
    async reset() {
        this.connections = [];
        this.emit('disconnected', { id: 'all' });
    }
}
exports.ConnectionManager = ConnectionManager;
