import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminPanelPage from '../page';

describe('AdminPanelPage', () => {
  it('renders admin panel UI', () => {
    render(<AdminPanelPage />);
    const adminPanelElement = screen.getByTestId('admin-panel');
    expect(adminPanelElement).toBeInTheDocument();
  });
});
