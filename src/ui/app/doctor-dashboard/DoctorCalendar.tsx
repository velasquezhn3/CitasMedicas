'use client';

import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import '@fullcalendar/common/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';
import '@fullcalendar/list/main.css';

interface Appointment {
  id: string;
  title: string;
  start: string;
  end: string;
  specialty: string;
}

const DoctorCalendar: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
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

  const handleEventDrop = (eventDropInfo: any) => {
    // TODO: Update appointment date/time in backend
    alert(`Appointment ${eventDropInfo.event.title} moved to ${eventDropInfo.event.start}`);
  };

  const handleDateSelect = (selectInfo: any) => {
    // TODO: Handle new appointment creation
    alert(`Selected from ${selectInfo.startStr} to ${selectInfo.endStr}`);
  };

  const eventContent = (eventContentArg: any) => {
    return (
      <>
        <b>{eventContentArg.timeText}</b>
        <i> {eventContentArg.event.title}</i>
      </>
    );
  };

  return (
    <div className="p-4 border rounded">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        initialView="timeGridWeek"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={appointments}
        select={handleDateSelect}
        eventDrop={handleEventDrop}
        eventContent={eventContent}
      />
    </div>
  );
};

export default DoctorCalendar;
