import type { NextApiRequest, NextApiResponse } from 'next';
import { connectionManager } from '../../../infrastructure/whatsapp/connection-manager-singleton';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const connectionId = req.body.connectionId || 'default-connection';

    await connectionManager.resetAuthState(connectionId);

    res.status(200).json({ message: 'Session reset successfully' });
  } catch (error) {
    console.error('Failed to reset session:', error);
    res.status(500).json({ error: 'Failed to reset session' });
  }
}
