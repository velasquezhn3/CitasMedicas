import './globals.css';
import { ThemeProvider } from './theme/ThemeProvider';

export const metadata = {
  title: 'Medical Appointment System',
  description: 'Doctor Dashboard and Admin Panel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
