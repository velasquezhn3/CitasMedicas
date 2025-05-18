'use client';

import React, { useEffect, useState } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  specialty: string;
}

const specialtyColors: Record<string, string> = {
  Cardiology: '#FF6384',
  Dermatology: '#36A2EB',
  Neurology: '#FFCE56',
  // Add more specialties and colors as needed
};

const GoogleCalendarSync: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
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

  return (
    <div className="p-4 border rounded">
      <h2>Google Calendar Sync</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id} style={{ color: specialtyColors[event.specialty] || '#000' }}>
            <strong>{event.title}</strong> ({new Date(event.start).toLocaleString()} - {new Date(event.end).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GoogleCalendarSync;
