'use client';

import React, { useEffect, useState } from 'react';

interface Reminder {
  id: string;
  message: string;
  date: string;
  language: 'en' | 'es';
  status: 'pending' | 'confirmed' | 'rescheduled' | 'cancelled';
}

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

const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
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

  const updateReminderStatus = (id: string, status: Reminder['status']) => {
    // TODO: Update reminder status in backend API
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id ? { ...reminder, status } : reminder
      )
    );
  };

  return (
    <div className="p-4 border rounded">
      <h2>Reminders</h2>
      <ul>
        {reminders.map((reminder) => (
          <li key={reminder.id} style={{ marginBottom: '1rem' }}>
            <p>{reminder.message}</p>
            <p>{new Date(reminder.date).toLocaleString()}</p>
            <div>
              <button
                onClick={() => updateReminderStatus(reminder.id, 'confirmed')}
                disabled={reminder.status !== 'pending'}
              >
                {templates[reminder.language].confirm}
              </button>
              <button
                onClick={() => updateReminderStatus(reminder.id, 'rescheduled')}
                disabled={reminder.status !== 'pending'}
                style={{ marginLeft: '0.5rem' }}
              >
                {templates[reminder.language].reschedule}
              </button>
              <button
                onClick={() => updateReminderStatus(reminder.id, 'cancelled')}
                disabled={reminder.status !== 'pending'}
                style={{ marginLeft: '0.5rem' }}
              >
                {templates[reminder.language].cancel}
              </button>
            </div>
            <p>Status: {reminder.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reminders;
