import { EventEmitter } from 'events';

export class Notificaciones extends EventEmitter {
  constructor() {
    super();
  }

  enviarNotificacion(tipo: string, payload: any) {
    this.emit(tipo, payload);
  }

  suscribir(tipo: string, listener: (payload: any) => void) {
    this.on(tipo, listener);
  }

  desuscribir(tipo: string, listener: (payload: any) => void) {
    this.off(tipo, listener);
  }
}
