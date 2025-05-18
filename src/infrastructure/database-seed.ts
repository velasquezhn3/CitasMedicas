import pool from './database';

async function seed() {
  try {
    // Insert 10 doctors
    for (let i = 1; i <= 10; i++) {
      await pool.query(
        `INSERT INTO doctores (nombre, especialidad, licencia_medica, telefono, email, horario_disponible)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          `Doctor ${i}`,
          i % 2 === 0 ? 'Cardiología' : 'Pediatría',
          `LIC${1000 + i}`,
          `555-000${i}`,
          `doctor${i}@hospital.com`,
          'Lunes-Viernes 8:00-18:00',
        ]
      );
    }

    // Insert 10 patients
    for (let i = 1; i <= 10; i++) {
      await pool.query(
        `INSERT INTO pacientes (nombre, email, telefono, fecha_nacimiento, direccion, genero)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          `Paciente ${i}`,
          `paciente${i}@mail.com`,
          `666-000${i}`,
          `1990-01-${i < 10 ? '0' + i : i}`,
          `Calle Falsa ${i}`,
          i % 2 === 0 ? 'Femenino' : 'Masculino',
        ]
      );
    }

    // Insert 10 appointments
    for (let i = 1; i <= 10; i++) {
      const pacienteId = i;
      const doctorId = i;
      const fechaHora = new Date();
      fechaHora.setDate(fechaHora.getDate() + i); // future dates
      await pool.query(
        `INSERT INTO citas (paciente_id, doctor_id, fecha_hora, estado, notas, especialidad)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          pacienteId,
          doctorId,
          fechaHora,
          'programada',
          `Nota para cita ${i}`,
          doctorId % 2 === 0 ? 'Cardiología' : 'Pediatría',
        ]
      );
    }

    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    pool.end();
  }
}

seed();
