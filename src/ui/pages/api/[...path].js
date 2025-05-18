"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const API_URL = 'http://localhost:3000';
async function handler(req, res) {
    const path = req.query.path ? (Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path) : '';
    const url = `${API_URL}/${path}`;
    try {
        const response = await fetch(url, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: ['GET', 'HEAD'].includes(req.method || '') ? null : JSON.stringify(req.body),
        });
        const data = await response.json();
        res.status(response.status).json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Error proxying request' });
    }
}
