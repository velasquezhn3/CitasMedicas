import ClinicWhatsAppBotController from '../../whatsapp/clinic-whatsapp-bot-controller';

describe('Redis Persistence Error Handling', () => {
  let botController: typeof ClinicWhatsAppBotController;

  beforeAll(() => {
    botController = ClinicWhatsAppBotController;
  });

  it('should handle Redis errors gracefully in handleMyAppointments', async () => {
    const sendMessageMock = jest.spyOn(botController as any, 'sendMessage').mockImplementation(async () => {});
    (botController as any).redisClient = {
      lrange: jest.fn().mockRejectedValue(new Error('Redis error')),
    };
    await (botController as any).handleMyAppointments('test-sender');
    expect(sendMessageMock).toHaveBeenCalledWith('test-sender', 'Error al obtener tus citas.');
    sendMessageMock.mockRestore();
  });

  it('should handle Redis errors gracefully in handleCancelAppointment', async () => {
    const sendMessageMock = jest.spyOn(botController as any, 'sendMessage').mockImplementation(async () => {});
    (botController as any).redisClient = {
      lrange: jest.fn().mockResolvedValue([
        JSON.stringify({ id: '1', date: '2024-07-01T10:00:00Z', description: 'desc', status: 'scheduled' }),
      ]),
      lrem: jest.fn().mockRejectedValue(new Error('Redis error')),
    };
    await (botController as any).handleCancelAppointment('test-sender', '/cancelar 1');
    expect(sendMessageMock).toHaveBeenCalledWith('test-sender', 'Error al obtener tus citas.');
    sendMessageMock.mockRestore();
  });
});
