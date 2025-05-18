import { AuthState, useSingleFileAuthState } from '@adiwajshing/baileys';
import Redis from 'redis';

const redisClient = Redis.createClient();

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient.connect();

export class RedisSessionStore {
  private prefix = 'baileys-auth:';

  async get(id: string): Promise<AuthState | null> {
    const data = await redisClient.get(this.prefix + id);
    if (!data) return null;
    return JSON.parse(data) as AuthState;
  }

  async set(id: string, state: AuthState): Promise<void> {
    await redisClient.set(this.prefix + id, JSON.stringify(state));
  }

  async remove(id: string): Promise<void> {
    await redisClient.del(this.prefix + id);
  }
}

export const useRedisAuthState = (id: string) => {
  const store = new RedisSessionStore();

  const getState = async () => {
    const state = await store.get(id);
    if (state) return state;
    return useSingleFileAuthState(`./auth/${id}`);
  };

  return {
    state: getState(),
    saveCreds: (creds: any) => store.set(id, creds),
  };
};
