"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Lista y gestiona múltiples conexiones de WhatsApp.
 * Puedes expandir este componente para agregar/eliminar números.
 */
const WhatsAppConnections = () => {
    // TODO: Traer la lista real de números desde el backend
    const numbers = [
        { id: 1, number: "+5491112345678", status: "active" },
        { id: 2, number: "+5491198765432", status: "pending" },
    ];
    return ((0, jsx_runtime_1.jsx)("div", { className: "border p-4 rounded", children: (0, jsx_runtime_1.jsx)("ul", { children: numbers.map((n) => ((0, jsx_runtime_1.jsxs)("li", { className: "flex justify-between items-center my-2", children: [(0, jsx_runtime_1.jsx)("span", { children: n.number }), (0, jsx_runtime_1.jsx)("span", { className: n.status === "active"
                            ? "text-green-600"
                            : n.status === "pending"
                                ? "text-yellow-600"
                                : "text-red-600", children: n.status })] }, n.id))) }) }));
};
exports.default = WhatsAppConnections;
