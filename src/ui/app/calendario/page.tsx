'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Calendario() {
  const [view, setView] = useState('dayGridMonth');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Fetch appointments from API
    fetch('/api/citas')
      .then((res) => res.json())
      .then((data) => {
        const mappedEvents = data.map((cita: any) => ({
          id: cita.id,
          title: `Cita con Dr. ${cita.doctorId}`,
          start: cita.fechaHora,
          end: cita.fechaHoraFin || new Date(new Date(cita.fechaHora).getTime() + 30 * 60000),
        }));
        setEvents(mappedEvents);
      });
  }, []);

  const handleViewChange = (newView: string) => {
    setView(newView);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Calendario</h1>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => handleViewChange('dayGridMonth')}>Mes</button>
        <button onClick={() => handleViewChange('timeGridWeek')}>Semana</button>
        <button onClick={() => handleViewChange('timeGridDay')}>Día</button>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={view}
        events={events}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '',
        }}
      />
    </div>
  );
}
