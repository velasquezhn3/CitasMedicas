"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEvents = listEvents;
exports.insertEvent = insertEvent;
exports.updateEvent = updateEvent;
exports.deleteEvent = deleteEvent;
exports.handleWebhook = handleWebhook;
exports.getColorIdBySpecialty = getColorIdBySpecialty;
const googleapis_1 = require("googleapis");
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const oAuth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
oAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});
const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oAuth2Client });
async function listEvents(calendarId, timeMin, timeMax) {
    const res = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
    });
    return res.data.items || [];
}
async function insertEvent(calendarId, event) {
    const res = await calendar.events.insert({
        calendarId,
        requestBody: event,
    });
    return res.data;
}
async function updateEvent(calendarId, eventId, event) {
    const res = await calendar.events.update({
        calendarId,
        eventId,
        requestBody: event,
    });
    return res.data;
}
async function deleteEvent(calendarId, eventId) {
    await calendar.events.delete({
        calendarId,
        eventId,
    });
}
async function handleWebhook(req, res) {
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
    }
    catch (error) {
        console.error('Error processing Google Calendar webhook:', error);
        res.status(500).send('Internal Server Error');
    }
}
// Map appointment specialty to colorId for calendar event
function getColorIdBySpecialty(especialidad) {
    const colorMap = {
        cardiologia: '11',
        dermatologia: '5',
        neurologia: '9',
        pediatria: '10',
        default: '1',
    };
    return colorMap[especialidad.toLowerCase()] || colorMap['default'];
}
