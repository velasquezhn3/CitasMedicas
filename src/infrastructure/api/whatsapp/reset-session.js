"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const connection_manager_singleton_instance_1 = require("../../../whatsapp/connection-manager-singleton-instance");
async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end('Method ' + req.method + ' Not Allowed');
    }
    try {
        await connection_manager_singleton_instance_1.connectionManager.reset();
        res.status(200).json({ message: 'Session reset successfully' });
    }
    catch (error) {
        console.error('Failed to reset session:', error);
        res.status(500).json({ error: 'Failed to reset session' });
    }
}
