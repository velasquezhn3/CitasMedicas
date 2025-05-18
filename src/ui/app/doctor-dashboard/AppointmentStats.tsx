'use client';

import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AppointmentStatsData {
  specialty: string;
  count: number;
}

const AppointmentStats: React.FC = () => {
  const [stats, setStats] = useState<AppointmentStatsData[]>([]);

  useEffect(() => {
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
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Appointment Statistics by Specialty',
      },
    },
  };

  return (
    <div className="p-4 border rounded">
      <Bar data={data} options={options} />
    </div>
  );
};

export default AppointmentStats;
