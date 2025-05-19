import ClinicWhatsAppBotController from '../clinic-whatsapp-bot-controller';

describe('ClinicWhatsAppBotController Extended Tests', () => {
  let botController: typeof ClinicWhatsAppBotController;

  beforeAll(() => {
    botController = ClinicWhatsAppBotController;
  });

  it('should respond with usage message for invalid /cancelar command', async () => {
    const sendMessageMock = jest.spyOn(botController as any, 'sendMessage').mockImplementation(async () => {});
    await (botController as any).handleCancelAppointment('test-sender', '/cancelar');
    expect(sendMessageMock).toHaveBeenCalledWith('test-sender', 'Uso: /cancelar <id_de_cita>');
    sendMessageMock.mockRestore();
  });

  it('should respond with "Cita no encontrada." for non-existent appointment id in /cancelar', async () => {
    const sendMessageMock = jest.spyOn(botController as any, 'sendMessage').mockImplementation(async () => {});
    (botController as any).redisClient = {
      lrange: jest.fn().mockResolvedValue([
        JSON.stringify({ id: '1', date: '2024-07-01T10:00:00Z', description: 'desc', status: 'scheduled' }),
      ]),
    };
    await (botController as any).handleCancelAppointment('test-sender', '/cancelar 999');
    expect(sendMessageMock).toHaveBeenCalledWith('test-sender', 'Cita no encontrada.');
    sendMessageMock.mockRestore();
  });

  it('should respond with no historial message for /historial when no appointments', async () => {
    const sendMessageMock = jest.spyOn(botController as any, 'sendMessage').mockImplementation(async () => {});
    (botController as any).redisClient = {
      lrange: jest.fn().mockResolvedValue([]),
    };
    await (botController as any).handleHistory('test-sender');
    expect(sendMessageMock).toHaveBeenCalledWith('test-sender', 'No tienes historial de citas.');
    sendMessageMock.mockRestore();
  });

  // Additional tests for auth middleware, rate limiting, and Redis error handling can be added here
});
