import type { NextApiRequest, NextApiResponse } from 'next';
import { connectionManager } from '../../../whatsapp/connection-manager-singleton-instance';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method ' + req.method + ' Not Allowed');
  }

  try {
    const connections = connectionManager.getAllConnections();
    res.status(200).json(connections);
  } catch (error) {
    console.error('Failed to get connections:', error);
    res.status(500).json({ error: 'Failed to get connections' });
  }
}
