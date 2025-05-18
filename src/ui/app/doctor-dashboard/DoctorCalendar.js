"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_2 = __importDefault(require("@fullcalendar/react"));
const daygrid_1 = __importDefault(require("@fullcalendar/daygrid"));
const timegrid_1 = __importDefault(require("@fullcalendar/timegrid"));
const interaction_1 = __importDefault(require("@fullcalendar/interaction"));
const list_1 = __importDefault(require("@fullcalendar/list"));
require("@fullcalendar/common/main.css");
require("@fullcalendar/daygrid/main.css");
require("@fullcalendar/timegrid/main.css");
require("@fullcalendar/list/main.css");
const DoctorCalendar = () => {
    const [appointments, setAppointments] = (0, react_1.useState)([]);
    const calendarRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        // TODO: Fetch appointments from backend API
        // For now, use dummy data
        setAppointments([
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
    const handleEventDrop = (eventDropInfo) => {
        // TODO: Update appointment date/time in backend
        alert(`Appointment ${eventDropInfo.event.title} moved to ${eventDropInfo.event.start}`);
    };
    const handleDateSelect = (selectInfo) => {
        // TODO: Handle new appointment creation
        alert(`Selected from ${selectInfo.startStr} to ${selectInfo.endStr}`);
    };
    const eventContent = (eventContentArg) => {
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("b", { children: eventContentArg.timeText }), (0, jsx_runtime_1.jsxs)("i", { children: [" ", eventContentArg.event.title] })] }));
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "p-4 border rounded", children: (0, jsx_runtime_1.jsx)(react_2.default, { ref: calendarRef, plugins: [daygrid_1.default, timegrid_1.default, interaction_1.default, list_1.default], headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
            }, initialView: "timeGridWeek", editable: true, selectable: true, selectMirror: true, dayMaxEvents: true, weekends: true, events: appointments, select: handleDateSelect, eventDrop: handleEventDrop, eventContent: eventContent }) }));
};
exports.default = DoctorCalendar;
