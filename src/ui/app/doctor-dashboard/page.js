"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DoctorDashboard;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_2 = __importDefault(require("@fullcalendar/react"));
const daygrid_1 = __importDefault(require("@fullcalendar/daygrid"));
const timegrid_1 = __importDefault(require("@fullcalendar/timegrid"));
const interaction_1 = __importDefault(require("@fullcalendar/interaction"));
const ChartVisualization_1 = __importDefault(require("../../components/ChartVisualization"));
function DoctorDashboard() {
    const [events, setEvents] = (0, react_1.useState)([]);
    const [chartData, setChartData] = (0, react_1.useState)({
        labels: [],
        datasets: [
            {
                label: 'Appointments',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
        ],
    });
    (0, react_1.useEffect)(() => {
        // Fetch appointments from API
        fetch('/api/citas')
            .then((res) => res.json())
            .then((data) => {
            // Map appointments to FullCalendar events
            const mappedEvents = data.map((cita) => ({
                id: cita.id,
                title: `Cita con Dr. ${cita.doctorId}`,
                start: cita.fechaHora,
                end: cita.fechaHoraFin || new Date(new Date(cita.fechaHora).getTime() + 30 * 60000),
            }));
            setEvents(mappedEvents);
            // Prepare data for Chart.js
            const specialtyCount = {};
            data.forEach((cita) => {
                const specialty = cita.especialidad || 'General';
                specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1;
            });
            setChartData({
                labels: Object.keys(specialtyCount),
                datasets: [
                    {
                        label: 'Appointments by Specialty',
                        data: Object.values(specialtyCount),
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    },
                ],
            });
        });
    }, []);
    const handleEventDrop = (info) => {
        // TODO: Update appointment date/time on drag-and-drop
        alert(`Cita movida a ${info.event.start}`);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: '1rem' }, children: [(0, jsx_runtime_1.jsx)("h1", { children: "Doctor Dashboard" }), (0, jsx_runtime_1.jsx)(react_2.default, { plugins: [daygrid_1.default, timegrid_1.default, interaction_1.default], initialView: "timeGridWeek", editable: true, selectable: true, events: events, eventDrop: handleEventDrop, headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                } }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: '2rem' }, children: (0, jsx_runtime_1.jsx)(ChartVisualization_1.default, { data: chartData }) }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: '2rem' }, children: (0, jsx_runtime_1.jsx)("p", { children: "WebRTC video call integration coming soon..." }) }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: '2rem' }, children: (0, jsx_runtime_1.jsx)("p", { children: "Digital signature component coming soon..." }) })] }));
}
