import ClinicWhatsAppBotController from '../clinic-whatsapp-bot-controller';

describe('ClinicWhatsAppBotController', () => {
  let botController: typeof ClinicWhatsAppBotController;

  beforeAll(() => {
    botController = ClinicWhatsAppBotController;
  });

  it('should respond with usage message for invalid /nuevacita command', async () => {
    const sendMessageMock = jest.spyOn(botController as any, 'sendMessage').mockImplementation(async () => {});
    await (botController as any).handleNewAppointment('test-sender', '/nuevacita');
    expect(sendMessageMock).toHaveBeenCalledWith('test-sender', 'Uso: /nuevacita YYYY-MM-DD HH:mm [descripcion]');
    sendMessageMock.mockRestore();
  });

  it('should respond with error message for invalid date in /nuevacita command', async () => {
    const sendMessageMock = jest.spyOn(botController as any, 'sendMessage').mockImplementation(async () => {});
    await (botController as any).handleNewAppointment('test-sender', '/nuevacita 2024-13-01 10:00');
    expect(sendMessageMock).toHaveBeenCalledWith('test-sender', 'Fecha u hora inválida. Formato esperado: YYYY-MM-DD HH:mm');
    sendMessageMock.mockRestore();
  });

  it('should respond with no appointments message for /micitas when no appointments', async () => {
    const sendMessageMock = jest.spyOn(botController as any, 'sendMessage').mockImplementation(async () => {});
    (botController as any).redisClient = {
      lrange: jest.fn().mockResolvedValue([]),
    };
    await (botController as any).handleMyAppointments('test-sender');
    expect(sendMessageMock).toHaveBeenCalledWith('test-sender', 'No tienes citas programadas.');
    sendMessageMock.mockRestore();
  });

  // Additional tests for /cancelar and /historial can be added similarly
});
