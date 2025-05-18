'use client';

import React, { useEffect, useState } from 'react';

interface ConnectionInfo {
  id: string;
  qr: string | null;
  connected: boolean;
}

const AdminPanel: React.FC = () => {
  const [connection, setConnection] = useState<ConnectionInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Backend WebSocket URL (adjust port if needed)
  const backendUrl = 'ws://localhost:3001/ws';

  useEffect(() => {
    const ws = new WebSocket(backendUrl);

    ws.onopen = () => {
      setError(null);
      ws.send(JSON.stringify({ action: 'getConnection' }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'connection') {
          setConnection(data.connection);
        } else if (data.type === 'error') {
          setError(data.message);
        }
      } catch (err) {
        setError('Error parsing message from backend');
      }
    };

    ws.onerror = (err) => {
      setError('WebSocket error');
      console.error('WebSocket error:', err);
    };

    ws.onclose = () => {
      // Optionally handle close
    };

    return () => {
      ws.close();
    };
  }, []);

  const resetConnection = async () => {
    if (!connection) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/whatsapp/reset-session?id=${connection.id}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to reset session');
      }
      // Refresh connection after reset
      const ws = new WebSocket(backendUrl);
      ws.onopen = () => {
        ws.send(JSON.stringify({ action: 'getConnection' }));
        ws.close();
      };
    } catch (err: any) {
      setError(err.message || 'Error resetting session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>WhatsApp Admin Panel</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!connection && <p>No active WhatsApp connection.</p>}
      {connection && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
          <p><strong>ID:</strong> {connection.id}</p>
          <p><strong>Connected:</strong> {connection.connected ? 'Yes' : 'No'}</p>
          {connection.qr ? (
            <img src={connection.qr} alt={`QR code for connection ${connection.id}`} style={{ maxWidth: '200px' }} />
          ) : (
            <p>No QR code available</p>
          )}
          <button onClick={resetConnection} disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Resetting...' : 'Reset Session / Generate New QR Code'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
