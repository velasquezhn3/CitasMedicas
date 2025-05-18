'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function DoctorDashboard() {
  const [events, setEvents] = useState([]);

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
      });
  }, []);

  const handleEventDrop = (info: any) => {
    // TODO: Update appointment date/time on drag-and-drop
    alert(`Cita movida a ${info.event.start}`);
  };

  return (
    <div>
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
    </div>
  );
}
