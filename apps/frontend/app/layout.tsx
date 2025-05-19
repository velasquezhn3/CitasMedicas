import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';

export const metadata = {
  title: 'Medical Appointment System',
  description: 'Manage your medical appointments efficiently',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
