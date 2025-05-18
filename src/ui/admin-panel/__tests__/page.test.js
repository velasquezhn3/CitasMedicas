"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
require("@testing-library/jest-dom");
const page_1 = __importDefault(require("../page"));
describe('AdminPanelPage', () => {
    it('renders admin panel UI', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(page_1.default, {}));
        const adminPanelElement = react_1.screen.getByTestId('admin-panel');
        expect(adminPanelElement).toBeInTheDocument();
    });
});
