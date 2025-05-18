"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const AdminPanel = () => {
    const [connection, setConnection] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    // Backend WebSocket URL (adjust port if needed)
    const backendUrl = 'ws://localhost:3001/ws';
    (0, react_1.useEffect)(() => {
        const ws = new WebSocket(backendUrl);
        ws.onopen = () => {
            setError(null);
            ws.send(JSON.stringify({ action: 'getConnection' }));
        };
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'connection') {
                    setConnection(data.connection);
                }
                else if (data.type === 'error') {
                    setError(data.message);
                }
            }
            catch (err) {
                setError('Error parsing message from backend');
            }
        };
        ws.onerror = (err) => {
            setError('WebSocket error');
            console.error('WebSocket error:', err);
        };
        ws.onclose = () => {
            // Optionally handle close
        };
        return () => {
            ws.close();
        };
    }, []);
    const resetConnection = async () => {
        if (!connection)
            return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/whatsapp/reset-session?id=${connection.id}`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Failed to reset session');
            }
            // Refresh connection after reset
            const ws = new WebSocket(backendUrl);
            ws.onopen = () => {
                ws.send(JSON.stringify({ action: 'getConnection' }));
                ws.close();
            };
        }
        catch (err) {
            setError(err.message || 'Error resetting session');
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: '2rem', fontFamily: 'Arial, sans-serif' }, children: [(0, jsx_runtime_1.jsx)("h1", { children: "WhatsApp Admin Panel" }), error && (0, jsx_runtime_1.jsxs)("p", { style: { color: 'red' }, children: ["Error: ", error] }), !connection && (0, jsx_runtime_1.jsx)("p", { children: "No active WhatsApp connection." }), connection && ((0, jsx_runtime_1.jsxs)("div", { style: { border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }, children: [(0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "ID:" }), " ", connection.id] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Connected:" }), " ", connection.connected ? 'Yes' : 'No'] }), connection.qr ? ((0, jsx_runtime_1.jsx)("img", { src: connection.qr, alt: `QR code for connection ${connection.id}`, style: { maxWidth: '200px' } })) : ((0, jsx_runtime_1.jsx)("p", { children: "No QR code available" })), (0, jsx_runtime_1.jsx)("button", { onClick: resetConnection, disabled: loading, style: { marginTop: '0.5rem' }, children: loading ? 'Resetting...' : 'Reset Session / Generate New QR Code' })] }))] }));
};
exports.default = AdminPanel;
