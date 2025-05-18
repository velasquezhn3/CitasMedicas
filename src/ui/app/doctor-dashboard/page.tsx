
'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ChartVisualization from '../../components/ChartVisualization';
import { ChartData } from 'chart.js';

export default function DoctorDashboard() {
  const [events, setEvents] = useState([]);

  const [chartData, setChartData] = useState<ChartData<'bar'>>({
    labels: [],
    datasets: [
      {
        label: 'Appointments',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  });

  useEffect(() => {
    // Fetch appointments from API
    fetch('/api/citas')
      .then((res) => res.json())
      .then((data) => {
        // Map appointments to FullCalendar events
        const mappedEvents = data.map((cita: any) => ({
          id: cita.id,
          title: `Cita con Dr. ${cita.doctorId}`,
          start: cita.fechaHora,
          end: cita.fechaHoraFin || new Date(new Date(cita.fechaHora).getTime() + 30 * 60000),
        }));
        setEvents(mappedEvents);

        // Prepare data for Chart.js
        const specialtyCount: Record<string, number> = {};
        data.forEach((cita: any) => {
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

  const handleEventDrop = (info: any) => {
    // TODO: Update appointment date/time on drag-and-drop
    alert(`Cita movida a ${info.event.start}`);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Doctor Dashboard</h1>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        editable={true}
        selectable={true}
        events={events}
        eventDrop={handleEventDrop}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
      />
      <div style={{ marginTop: '2rem' }}>
        <ChartVisualization data={chartData} />
      </div>
      <div style={{ marginTop: '2rem' }}>
        {/* TODO: Add WebRTC video call integration here */}
        <p>WebRTC video call integration coming soon...</p>
      </div>
      <div style={{ marginTop: '2rem' }}>
        {/* TODO: Add digital signature component here */}
        <p>Digital signature component coming soon...</p>
      </div>
    </div>
  );
}
