import { AuthenticationCreds, AuthenticationState, SignalKeyStore } from '@adiwajshing/baileys';
import Redis from 'ioredis';

const redisClient = new Redis();

const redisKey = 'whatsapp_auth_state';

const emptySignalKeyStore: SignalKeyStore = {
  get: async () => ({}),
  set: async () => {},
};

export const saveState = async (state: AuthenticationState) => {
  await redisClient.set(redisKey, JSON.stringify(state));
};

export const loadState = async (): Promise<AuthenticationState | null> => {
  const data = await redisClient.get(redisKey);
  if (!data) return null;
  return JSON.parse(data) as AuthenticationState;
};

export const clearState = async () => {
  await redisClient.del(redisKey);
};

export const useRedisAuthState = () => {
  let state: AuthenticationState | null = null;

  const saveCreds = async (creds: AuthenticationCreds) => {
    if (!state) state = { creds, keys: emptySignalKeyStore };
    else state.creds = creds;
    await saveState(state);
  };

  const load = async () => {
    state = await loadState();
    if (!state) {
      state = { creds: {} as AuthenticationCreds, keys: emptySignalKeyStore };
      await saveState(state);
    }
    return state;
  };

  return { state: load(), saveCreds };
};
