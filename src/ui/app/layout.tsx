import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
