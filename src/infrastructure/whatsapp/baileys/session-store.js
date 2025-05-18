"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRedisAuthState = exports.RedisSessionStore = void 0;
const baileys_1 = require("@adiwajshing/baileys");
const redis_1 = __importDefault(require("redis"));
const redisClient = redis_1.default.createClient();
redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});
redisClient.connect();
class RedisSessionStore {
    constructor() {
        this.prefix = 'baileys-auth:';
    }
    async get(id) {
        const data = await redisClient.get(this.prefix + id);
        if (!data)
            return null;
        return JSON.parse(data);
    }
    async set(id, state) {
        await redisClient.set(this.prefix + id, JSON.stringify(state));
    }
    async remove(id) {
        await redisClient.del(this.prefix + id);
    }
}
exports.RedisSessionStore = RedisSessionStore;
const useRedisAuthState = (id) => {
    const store = new RedisSessionStore();
    const getState = async () => {
        const state = await store.get(id);
        if (state)
            return state;
        return (0, baileys_1.useSingleFileAuthState)(`./auth/${id}`);
    };
    return {
        state: getState(),
        saveCreds: (creds) => store.set(id, creds),
    };
};
exports.useRedisAuthState = useRedisAuthState;
