import { EventEmitter } from 'events';

export interface ConnectionInfo {
  id: string;
  qr: string | null;
  connected: boolean;
}

export declare class ConnectionManager extends EventEmitter {
  private connections: ConnectionInfo[];

  constructor();

  createConnection(id: string): Promise<ConnectionInfo>;

  getAllConnections(): ConnectionInfo[];

  reset(): Promise<void>;
}
