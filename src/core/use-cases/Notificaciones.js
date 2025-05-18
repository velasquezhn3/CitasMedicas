"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notificaciones = void 0;
const events_1 = require("events");
class Notificaciones extends events_1.EventEmitter {
    constructor() {
        super();
    }
    enviarNotificacion(tipo, payload) {
        this.emit(tipo, payload);
    }
    suscribir(tipo, listener) {
        this.on(tipo, listener);
    }
    desuscribir(tipo, listener) {
        this.off(tipo, listener);
    }
}
exports.Notificaciones = Notificaciones;
