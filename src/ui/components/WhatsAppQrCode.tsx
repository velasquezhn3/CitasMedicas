import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';

const whatsappSocket = io('ws://localhost:3001/ws');

const WhatsAppQrCode: React.FC = () => {
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [loading, setLoading] = useState<boolean>(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    whatsappSocket.on('connect', () => {
      if (isMounted.current) {
        setConnectionStatus('connecting');
        setLoading(true);
      }
    });

    whatsappSocket.on('qr', (data: { qrSvg: string }) => {
      if (isMounted.current) {
        setQrSvg(data.qrSvg);
        setLoading(false);
        setConnectionStatus('qr');
      }
    });

    whatsappSocket.on('connected', () => {
      if (isMounted.current) {
        setConnectionStatus('connected');
        setQrSvg(null);
        setLoading(false);
        toast.success('WhatsApp connected');
      }
    });

    whatsappSocket.on('disconnected', () => {
      if (isMounted.current) {
        setConnectionStatus('disconnected');
        setQrSvg(null);
        setLoading(false);
        toast.error('WhatsApp disconnected');
      }
    });

    whatsappSocket.on('connect_error', () => {
      if (isMounted.current) {
        toast.error('WebSocket connection error');
      }
    });

    return () => {
      isMounted.current = false;
      whatsappSocket.off('connect');
      whatsappSocket.off('qr');
      whatsappSocket.off('connected');
      whatsappSocket.off('disconnected');
      whatsappSocket.off('connect_error');
    };
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/whatsapp/logout', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      setQrSvg(null);
      setConnectionStatus('disconnected');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Toaster />
      <h2>Scan this WhatsApp QR Code</h2>
      {loading && <div>Loading QR code...</div>}
      {!loading && qrSvg && (
        <div
          dangerouslySetInnerHTML={{ __html: qrSvg }}
          style={{ maxWidth: '300px', height: 'auto' }}
        />
      )}
      {!loading && !qrSvg && <div>No QR code available at the moment.</div>}
      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        disabled={loading}
      >
        Log Out
      </button>
    </div>
  );
};

export default WhatsAppQrCode;
