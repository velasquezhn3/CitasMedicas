"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const page_1 = __importDefault(require("../page"));
describe('DoctorDashboardPage', () => {
    it('renders calendar view', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(page_1.default, {}));
        const calendarElement = react_1.screen.getByTestId('calendar');
        expect(calendarElement).toBeInTheDocument();
    });
    it('allows drag and drop interaction', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(page_1.default, {}));
        const calendarElement = react_1.screen.getByTestId('calendar');
        // Simulate drag and drop events if implemented
        // For now, just check calendar presence
        expect(calendarElement).toBeInTheDocument();
    });
});
