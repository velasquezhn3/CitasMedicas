"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WhatsAppPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const WhatsAppConnections_1 = __importDefault(require("../../whatsapp/WhatsAppConnections"));
function WhatsAppPage() {
    return ((0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(WhatsAppConnections_1.default, {}) }));
}
