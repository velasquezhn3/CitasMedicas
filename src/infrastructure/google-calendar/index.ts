import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

export async function listEvents(calendarId: string, timeMin: string, timeMax: string) {
  const res = await calendar.events.list({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
  });
  return res.data.items || [];
}

export async function insertEvent(calendarId: string, event: any) {
  const res = await calendar.events.insert({
    calendarId,
    requestBody: event,
  });
  return res.data;
}

export async function updateEvent(calendarId: string, eventId: string, event: any) {
  const res = await calendar.events.update({
    calendarId,
    eventId,
    requestBody: event,
  });
  return res.data;
}

export async function deleteEvent(calendarId: string, eventId: string) {
  await calendar.events.delete({
    calendarId,
    eventId,
  });
}

// Webhook handler implementation
import { Request, Response } from 'express';

export async function handleWebhook(req: Request, res: Response) {
  try {
    // Verify webhook authenticity (e.g., using headers or tokens)
    const validationToken = process.env.GOOGLE_WEBHOOK_TOKEN;
    if (validationToken && req.headers['x-goog-channel-token'] !== validationToken) {
      return res.status(403).send('Forbidden');
    }

    const resourceState = req.headers['x-goog-resource-state'];
    const resourceId = req.headers['x-goog-resource-id'];
    const channelId = req.headers['x-goog-channel-id'];

    // Process the webhook notification
    console.log(`Google Calendar webhook received: resourceState=${resourceState}, resourceId=${resourceId}, channelId=${channelId}`);

    // TODO: Fetch updated events and sync with local appointments

    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Error processing Google Calendar webhook:', error);
    res.status(500).send('Internal Server Error');
  }
}

// Map appointment specialty to colorId for calendar event
export function getColorIdBySpecialty(especialidad: string): string {
  const colorMap: Record<string, string> = {
    cardiologia: '11',
    dermatologia: '5',
    neurologia: '9',
    pediatria: '10',
    default: '1',
  };
  return colorMap[especialidad.toLowerCase()] || colorMap['default'];
}
