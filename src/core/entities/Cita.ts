export class Cita {
  id: string;
  doctorId: string;
  pacienteId: string;
  fechaHora: Date;
  especialidad: string;

  constructor(id: string, doctorId: string, pacienteId: string, fechaHora: Date, especialidad: string) {
    this.id = id;
    this.doctorId = doctorId;
    this.pacienteId = pacienteId;
    this.fechaHora = fechaHora;
    this.especialidad = especialidad;
  }
}
