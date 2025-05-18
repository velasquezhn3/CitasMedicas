"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cita = void 0;
class Cita {
    constructor(id, doctorId, pacienteId, fechaHora, especialidad) {
        this.id = id;
        this.doctorId = doctorId;
        this.pacienteId = pacienteId;
        this.fechaHora = fechaHora;
        this.especialidad = especialidad;
    }
}
exports.Cita = Cita;
