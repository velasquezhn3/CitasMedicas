import { EventEmitter } from 'events';

export interface ConnectionInfo {
  id: string;
  qr: string | null;
  connected: boolean;
}

export class ConnectionManager extends EventEmitter {
  private connections: ConnectionInfo[] = [];

  constructor() {
    super();
  }

  async createConnection(id: string): Promise<ConnectionInfo> {
    const connection: ConnectionInfo = {
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

  getAllConnections(): ConnectionInfo[] {
    return this.connections;
  }

  async reset(): Promise<void> {
    this.connections = [];
    this.emit('disconnected', { id: 'all' });
  }
}
