import { makeWALegacySocket, DisconnectReason, useMultiFileAuthState, LegacyAuthenticationCreds } from '@adiwajshing/baileys';
import pino from 'pino';
import Redis from 'ioredis';

const logger = pino({ level: 'info' });

class ConnectionManagerSingleton {
  private static instance: ConnectionManagerSingleton;
  private socket?: ReturnType<typeof makeWALegacySocket>;
  private redisClient: Redis;
  private connected: boolean = false;

  private constructor() {
    this.redisClient = new Redis();
  }

  public static getInstance(): ConnectionManagerSingleton {
    if (!ConnectionManagerSingleton.instance) {
      ConnectionManagerSingleton.instance = new ConnectionManagerSingleton();
    }
    return ConnectionManagerSingleton.instance;
  }

  public getRedisClient(): Redis {
    return this.redisClient;
  }

  public async connect() {
    if (this.connected) {
      logger.info('Already connected to WhatsApp');
      return;
    }

    const { state, saveCreds } = await useMultiFileAuthState('./auth/whatsapp');

    // Provide a minimal LegacyAuthenticationCreds object with required properties to satisfy type requirements
    const minimalLegacyCreds: LegacyAuthenticationCreds = {
      clientID: '',
      serverToken: '',
      clientToken: '',
      encKey: Buffer.alloc(0),
      macKey: Buffer.alloc(0),
    };

    // Bypass type checking by casting state.creds to any and merging with minimalLegacyCreds
    const authCreds = {
      ...minimalLegacyCreds,
      ...(state.creds as any),
    };

    const auth = {
      creds: authCreds,
      keys: state.keys,
    };

    this.socket = makeWALegacySocket({
      logger,
      printQRInTerminal: true,
      auth: auth as any,
    });

    this.socket.ev.on('creds.update', saveCreds);

    this.socket.ev.on('connection.update', (update: any) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'close') {
        const shouldReconnect =
          (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
        logger.info(`Connection closed, reconnecting: ${shouldReconnect}`);
        if (shouldReconnect) {
          this.connect();
        }
      } else if (connection === 'open') {
        this.connected = true;
        logger.info('WhatsApp connection opened');
      }
    });
  }

  public getSocket(): ReturnType<typeof makeWALegacySocket> | undefined {
    return this.socket;
  }
}

export default ConnectionManagerSingleton.getInstance();
