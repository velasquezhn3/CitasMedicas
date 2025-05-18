"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
/**
 * Muestra el código QR para autenticar WhatsApp y el estado de la sesión.
 */
const WhatsAppQrCode = () => {
    const [qr, setQr] = (0, react_1.useState)(null);
    const [status, setStatus] = (0, react_1.useState)("pending");
    // Simula la obtención del QR desde el backend
    (0, react_1.useEffect)(() => {
        // Aquí deberías hacer fetch a tu API real
        setTimeout(() => {
            setQr("/api/whatsapp/qr"); // Reemplaza por la URL real del QR
            setStatus("pending");
        }, 500);
    }, []);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "border p-4 rounded", children: [(0, jsx_runtime_1.jsx)("p", { children: "Escanea este c\u00F3digo QR con WhatsApp para autenticar." }), qr && (0, jsx_runtime_1.jsx)("img", { src: qr, alt: "QR de WhatsApp", className: "my-2" }), (0, jsx_runtime_1.jsxs)("div", { children: ["Estado de sesi\u00F3n:", " ", (0, jsx_runtime_1.jsxs)("span", { className: "font-semibold", children: [status === "active" && "Activa", status === "expired" && "Expirada", status === "pending" && "Pendiente"] })] })] }));
};
exports.default = WhatsAppQrCode;
