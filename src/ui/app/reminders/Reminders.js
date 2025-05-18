"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const templates = {
    en: {
        confirm: 'Confirm',
        reschedule: 'Reschedule',
        cancel: 'Cancel',
    },
    es: {
        confirm: 'Confirmar',
        reschedule: 'Reprogramar',
        cancel: 'Cancelar',
    },
};
const Reminders = () => {
    const [reminders, setReminders] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        // TODO: Fetch reminders from backend API
        // For now, use dummy data
        setReminders([
            {
                id: '1',
                message: 'Appointment with Dr. Smith',
                date: new Date().toISOString(),
                language: 'en',
                status: 'pending',
            },
            {
                id: '2',
                message: 'Cita con Dr. Pérez',
                date: new Date().toISOString(),
                language: 'es',
                status: 'pending',
            },
        ]);
    }, []);
    const updateReminderStatus = (id, status) => {
        // TODO: Update reminder status in backend API
        setReminders((prev) => prev.map((reminder) => reminder.id === id ? { ...reminder, status } : reminder));
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-4 border rounded", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Reminders" }), (0, jsx_runtime_1.jsx)("ul", { children: reminders.map((reminder) => ((0, jsx_runtime_1.jsxs)("li", { style: { marginBottom: '1rem' }, children: [(0, jsx_runtime_1.jsx)("p", { children: reminder.message }), (0, jsx_runtime_1.jsx)("p", { children: new Date(reminder.date).toLocaleString() }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => updateReminderStatus(reminder.id, 'confirmed'), disabled: reminder.status !== 'pending', children: templates[reminder.language].confirm }), (0, jsx_runtime_1.jsx)("button", { onClick: () => updateReminderStatus(reminder.id, 'rescheduled'), disabled: reminder.status !== 'pending', style: { marginLeft: '0.5rem' }, children: templates[reminder.language].reschedule }), (0, jsx_runtime_1.jsx)("button", { onClick: () => updateReminderStatus(reminder.id, 'cancelled'), disabled: reminder.status !== 'pending', style: { marginLeft: '0.5rem' }, children: templates[reminder.language].cancel })] }), (0, jsx_runtime_1.jsxs)("p", { children: ["Status: ", reminder.status] })] }, reminder.id))) })] }));
};
exports.default = Reminders;
