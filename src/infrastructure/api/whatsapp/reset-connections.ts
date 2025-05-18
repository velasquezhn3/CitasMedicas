import type { NextApiRequest, NextApiResponse } from 'next';
import { connectionManager } from '../../../whatsapp/connection-manager-singleton-instance';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method ' + req.method + ' Not Allowed');
  }

  try {
    await connectionManager.reset();
    res.status(200).json({ message: 'Connections reset successfully' });
  } catch (error) {
    console.error('Failed to reset connections:', error);
    res.status(500).json({ error: 'Failed to reset connections' });
  }
}
