import React, { useEffect, useState } from 'react';

const WhatsAppConnections: React.FC = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQrCode = async () => {
    try {
      const response = await fetch('/whatsapp/qr-codes');
      const data = await response.json();
      if (data.length > 0) {
        setQrCode(data[0].qr);
        setConnected(data[0].connected);
        setConnectionId(data[0].id);
      } else {
        setQrCode(null);
        setConnected(false);
        setConnectionId(null);
      }
    } catch (err) {
      setError('Failed to fetch QR code');
    }
  };

  const resetConnection = async () => {
    if (!connectionId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/whatsapp/reset-connections', {
        method: 'POST',
      });
      if (response.ok) {
        await fetchQrCode();
      } else {
        setError('Failed to reset connection');
      }
    } catch (err) {
      setError('Failed to reset connection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQrCode();
    const interval = setInterval(fetchQrCode, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>WhatsApp Connection</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {connected ? (
        <p>Connected (ID: {connectionId})</p>
      ) : qrCode ? (
        <div>
          <p>Scan this QR code with WhatsApp:</p>
          <img src={`data:image/png;base64,${qrCode}`} alt="WhatsApp QR Code" />
        </div>
      ) : (
        <p>No QR code available</p>
      )}
      <button onClick={resetConnection} disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Connection'}
      </button>
    </div>
  );
};

export default WhatsAppConnections;
