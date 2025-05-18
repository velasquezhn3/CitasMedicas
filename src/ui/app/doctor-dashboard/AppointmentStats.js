"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_chartjs_2_1 = require("react-chartjs-2");
const chart_js_1 = require("chart.js");
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.BarElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
const AppointmentStats = () => {
    const [stats, setStats] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        // TODO: Fetch appointment statistics from backend API
        // For now, use dummy data
        setStats([
            { specialty: 'Cardiology', count: 12 },
            { specialty: 'Dermatology', count: 8 },
            { specialty: 'Neurology', count: 5 },
        ]);
    }, []);
    const data = {
        labels: stats.map((item) => item.specialty),
        datasets: [
            {
                label: 'Number of Appointments',
                data: stats.map((item) => item.count),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Appointment Statistics by Specialty',
            },
        },
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "p-4 border rounded", children: (0, jsx_runtime_1.jsx)(react_chartjs_2_1.Bar, { data: data, options: options }) }));
};
exports.default = AppointmentStats;
