import { Server, WebSocket } from 'ws';
import { socket as sock } from './server';
import http from 'http';
import QRCode from 'qrcode';

const wss = new Server({ noServer: true });

wss.on('connection', (ws: WebSocket) => {
  console.log('WebSocket client connected');

  // Send current connection state and QR code on new connection
  if (sock !== null && sock.ev) {
    // Listen for connection updates to send QR code and connection status
    const onConnectionUpdate = async (update: any) => {
      const { qr, connection } = update;
      console.log('Connection update received:', update);
      if (qr) {
        try {
          const svgString = await QRCode.toString(qr, { type: 'svg' });
          console.log('Generated QR code SVG');
          ws.send(JSON.stringify({ type: 'qr', qrSvg: svgString }));
        } catch (err) {
          console.error('Failed to generate QR code SVG:', err);
        }
      }
      if (connection) {
        ws.send(JSON.stringify({ type: connection }));
      }
    };

    sock.ev.on('connection.update', onConnectionUpdate);

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      if (sock !== null && sock.ev) {
        sock.ev.off('connection.update', onConnectionUpdate);
      }
    });
  } else {
    ws.send(JSON.stringify({ type: 'disconnected' }));
  }
});

export function setupWebSocket(server: http.Server) {
  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });
}
