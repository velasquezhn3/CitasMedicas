"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const WhatsAppConnections = () => {
    const [qrCode, setQrCode] = (0, react_1.useState)(null);
    const [connected, setConnected] = (0, react_1.useState)(false);
    const [connectionId, setConnectionId] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchQrCode = async () => {
        try {
            const response = await fetch('/whatsapp/qr-codes');
            const data = await response.json();
            if (data.length > 0) {
                setQrCode(data[0].qr);
                setConnected(data[0].connected);
                setConnectionId(data[0].id);
            }
            else {
                setQrCode(null);
                setConnected(false);
                setConnectionId(null);
            }
        }
        catch (err) {
            setError('Failed to fetch QR code');
        }
    };
    const resetConnection = async () => {
        if (!connectionId)
            return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/whatsapp/reset-connections', {
                method: 'POST',
            });
            if (response.ok) {
                await fetchQrCode();
            }
            else {
                setError('Failed to reset connection');
            }
        }
        catch (err) {
            setError('Failed to reset connection');
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        fetchQrCode();
        const interval = setInterval(fetchQrCode, 5000);
        return () => clearInterval(interval);
    }, []);
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { children: "WhatsApp Connection" }), error && (0, jsx_runtime_1.jsx)("p", { style: { color: 'red' }, children: error }), connected ? ((0, jsx_runtime_1.jsxs)("p", { children: ["Connected (ID: ", connectionId, ")"] })) : qrCode ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { children: "Scan this QR code with WhatsApp:" }), (0, jsx_runtime_1.jsx)("img", { src: `data:image/png;base64,${qrCode}`, alt: "WhatsApp QR Code" })] })) : ((0, jsx_runtime_1.jsx)("p", { children: "No QR code available" })), (0, jsx_runtime_1.jsx)("button", { onClick: resetConnection, disabled: loading, children: loading ? 'Resetting...' : 'Reset Connection' })] }));
};
exports.default = WhatsAppConnections;
