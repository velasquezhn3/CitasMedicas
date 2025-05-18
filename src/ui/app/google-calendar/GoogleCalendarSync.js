"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const specialtyColors = {
    Cardiology: '#FF6384',
    Dermatology: '#36A2EB',
    Neurology: '#FFCE56',
    // Add more specialties and colors as needed
};
const GoogleCalendarSync = () => {
    const [events, setEvents] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        // TODO: Fetch Google Calendar events mapped to appointments from backend API
        // For now, use dummy data
        setEvents([
            {
                id: '1',
                title: 'Consultation - Cardiology',
                start: new Date().toISOString(),
                end: new Date(new Date().getTime() + 30 * 60000).toISOString(),
                specialty: 'Cardiology',
            },
            {
                id: '2',
                title: 'Follow-up - Dermatology',
                start: new Date(new Date().getTime() + 3600000).toISOString(),
                end: new Date(new Date().getTime() + 5400000).toISOString(),
                specialty: 'Dermatology',
            },
        ]);
    }, []);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-4 border rounded", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Google Calendar Sync" }), (0, jsx_runtime_1.jsx)("ul", { children: events.map((event) => ((0, jsx_runtime_1.jsxs)("li", { style: { color: specialtyColors[event.specialty] || '#000' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: event.title }), " (", new Date(event.start).toLocaleString(), " - ", new Date(event.end).toLocaleString(), ")"] }, event.id))) })] }));
};
exports.default = GoogleCalendarSync;
