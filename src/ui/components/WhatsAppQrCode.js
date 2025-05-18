"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const react_hot_toast_1 = __importStar(require("react-hot-toast"));
const socket = (0, socket_io_client_1.default)('/ws');
const WhatsAppQrCode = () => {
    const [qrSvg, setQrSvg] = (0, react_1.useState)(null);
    const [connectionStatus, setConnectionStatus] = (0, react_1.useState)('disconnected');
    const [loading, setLoading] = (0, react_1.useState)(true);
    const isMounted = (0, react_1.useRef)(true);
    (0, react_1.useEffect)(() => {
        isMounted.current = true;
        socket.on('connect', () => {
            if (isMounted.current) {
                setConnectionStatus('connecting');
                setLoading(true);
            }
        });
        socket.on('qr', (data) => {
            if (isMounted.current) {
                setQrSvg(data.qrSvg);
                setLoading(false);
                setConnectionStatus('qr');
            }
        });
        socket.on('connected', () => {
            if (isMounted.current) {
                setConnectionStatus('connected');
                setQrSvg(null);
                setLoading(false);
                react_hot_toast_1.default.success('WhatsApp connected');
            }
        });
        socket.on('disconnected', () => {
            if (isMounted.current) {
                setConnectionStatus('disconnected');
                setQrSvg(null);
                setLoading(false);
                react_hot_toast_1.default.error('WhatsApp disconnected');
            }
        });
        socket.on('connect_error', () => {
            if (isMounted.current) {
                react_hot_toast_1.default.error('WebSocket connection error');
            }
        });
        return () => {
            isMounted.current = false;
            socket.off('connect');
            socket.off('qr');
            socket.off('connected');
            socket.off('disconnected');
            socket.off('connect_error');
        };
    }, []);
    const handleLogout = async () => {
        setLoading(true);
        try {
            const response = await fetch('/whatsapp/logout', { method: 'POST' });
            if (!response.ok) {
                throw new Error('Logout failed');
            }
            setQrSvg(null);
            setConnectionStatus('disconnected');
            react_hot_toast_1.default.success('Logged out successfully');
        }
        catch (error) {
            react_hot_toast_1.default.error(error.message);
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(react_hot_toast_1.Toaster, {}), (0, jsx_runtime_1.jsx)("h2", { children: "Scan this WhatsApp QR Code" }), loading && (0, jsx_runtime_1.jsx)("div", { children: "Loading QR code..." }), !loading && qrSvg && ((0, jsx_runtime_1.jsx)("div", { dangerouslySetInnerHTML: { __html: qrSvg }, style: { maxWidth: '300px', height: 'auto' } })), !loading && !qrSvg && (0, jsx_runtime_1.jsx)("div", { children: "No QR code available at the moment." }), (0, jsx_runtime_1.jsx)("button", { onClick: handleLogout, className: "mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700", disabled: loading, children: "Log Out" })] }));
};
exports.default = WhatsAppQrCode;
