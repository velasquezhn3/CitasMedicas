"use client";

import React, { useEffect, useState } from 'react';

interface ConnectionInfo {
  id: string;
  qr: string | null;
  connected: boolean;
}

const WhatsAppConnections: React.FC = () => {
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/whatsapp/qr-codes');
      if (!response.ok) {
        throw new Error('Failed to fetch QR codes');
      }
      const data: ConnectionInfo[] = await response.json();
      setConnections(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const resetConnections = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/whatsapp/reset-connections', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to reset connections');
      }
      // After reset, fetch new connections
      await fetchConnections();
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  return (
    <div>
      <h2>WhatsApp Connections</h2>
      <button onClick={resetConnections} disabled={loading}>
        {loading ? 'Processing...' : 'Reset WhatsApp Connections'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginTop: '1rem' }}>
        {connections.length === 0 && !loading && <p>No active connections.</p>}
        {connections.map((conn) => (
          <div key={conn.id} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
            <p><strong>ID:</strong> {conn.id}</p>
            <p><strong>Connected:</strong> {conn.connected ? 'Yes' : 'No'}</p>
            {conn.qr ? (
              <img src={conn.qr} alt={`QR code for connection ${conn.id}`} style={{ maxWidth: '200px' }} />
            ) : (
              <p>No QR code available</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhatsAppConnections;
