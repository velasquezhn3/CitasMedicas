"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const WhatsAppConnections = () => {
    const [connections, setConnections] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchConnections = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/whatsapp/qr-codes');
            if (!response.ok) {
                throw new Error('Failed to fetch QR codes');
            }
            const data = await response.json();
            setConnections(data);
        }
        catch (err) {
            setError(err.message || 'Unknown error');
        }
        finally {
            setLoading(false);
        }
    };
    const resetConnections = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/whatsapp/reset-connections', {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Failed to reset connections');
            }
            // After reset, fetch new connections
            await fetchConnections();
        }
        catch (err) {
            setError(err.message || 'Unknown error');
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        fetchConnections();
    }, []);
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { children: "WhatsApp Connections" }), (0, jsx_runtime_1.jsx)("button", { onClick: resetConnections, disabled: loading, children: loading ? 'Processing...' : 'Reset WhatsApp Connections' }), error && (0, jsx_runtime_1.jsx)("p", { style: { color: 'red' }, children: error }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '1rem' }, children: [connections.length === 0 && !loading && (0, jsx_runtime_1.jsx)("p", { children: "No active connections." }), connections.map((conn) => ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }, children: [(0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "ID:" }), " ", conn.id] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Connected:" }), " ", conn.connected ? 'Yes' : 'No'] }), conn.qr ? ((0, jsx_runtime_1.jsx)("img", { src: conn.qr, alt: `QR code for connection ${conn.id}`, style: { maxWidth: '200px' } })) : ((0, jsx_runtime_1.jsx)("p", { children: "No QR code available" }))] }, conn.id)))] })] }));
};
exports.default = WhatsAppConnections;
