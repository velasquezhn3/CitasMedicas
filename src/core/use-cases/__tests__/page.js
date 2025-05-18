"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminPanelPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const WhatsAppQrCode_1 = __importDefault(require("@/ui/components/WhatsAppQrCode"));
const WhatsAppConnections_1 = __importDefault(require("@/ui/whatsapp/WhatsAppConnections"));
/**
 * Página principal del panel de administración.
 * Incluye autenticación por QR y gestión de múltiples números de WhatsApp.
 */
function AdminPanelPage() {
    return ((0, jsx_runtime_1.jsxs)("main", { className: "p-6 space-y-8", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold", children: "Panel de Administraci\u00F3n" }), (0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-2", children: "Autenticaci\u00F3n WhatsApp" }), (0, jsx_runtime_1.jsx)(WhatsAppQrCode_1.default, {})] }), (0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-2", children: "Gesti\u00F3n de N\u00FAmeros" }), (0, jsx_runtime_1.jsx)(WhatsAppConnections_1.default, {})] })] }));
}
