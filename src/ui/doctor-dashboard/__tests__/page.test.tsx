import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DoctorDashboardPage from '../page';

describe('DoctorDashboardPage', () => {
  it('renders calendar view', () => {
    render(<DoctorDashboardPage />);
    const calendarElement = screen.getByTestId('calendar');
    expect(calendarElement).toBeInTheDocument();
  });

  it('allows drag and drop interaction', () => {
    render(<DoctorDashboardPage />);
    const calendarElement = screen.getByTestId('calendar');
    // Simulate drag and drop events if implemented
    // For now, just check calendar presence
    expect(calendarElement).toBeInTheDocument();
  });
});
