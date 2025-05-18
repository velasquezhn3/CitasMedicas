"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const connection_manager_singleton_1 = require("../../../infrastructure/whatsapp/connection-manager-singleton");
async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
    try {
        const connectionId = req.body.connectionId || 'default-connection';
        await connection_manager_singleton_1.connectionManager.resetAuthState(connectionId);
        res.status(200).json({ message: 'Session reset successfully' });
    }
    catch (error) {
        console.error('Failed to reset session:', error);
        res.status(500).json({ error: 'Failed to reset session' });
    }
}
