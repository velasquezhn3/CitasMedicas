-- Esquema mejorado para la base de datos del proyecto Medical Appointment System

-- Tabla de Pacientes
CREATE TABLE pacientes (
    paciente_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    direccion TEXT,
    genero VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Doctores
CREATE TABLE doctores (
    doctor_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100) NOT NULL, -- Ej: Cardiología, Pediatría
    licencia_medica VARCHAR(50) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    horario_disponible TEXT, -- Ej: "Lunes-Viernes 8:00-18:00"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Citas
CREATE TABLE citas (
    cita_id SERIAL PRIMARY KEY,
    paciente_id INT NOT NULL,
    doctor_id INT NOT NULL,
    fecha_hora TIMESTAMP NOT NULL,
    estado VARCHAR(20) DEFAULT 'programada', -- Ej: programada, completada, cancelada
    notas TEXT,
    especialidad VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(paciente_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctores(doctor_id) ON DELETE CASCADE
);

CREATE INDEX idx_fecha_hora ON citas(fecha_hora);

-- Tabla de Historial Médico
CREATE TABLE historial_medico (
    historial_id SERIAL PRIMARY KEY,
    paciente_id INT NOT NULL,
    doctor_id INT NOT NULL,
    cita_id INT,
    diagnostico TEXT,
    medicamentos TEXT,
    archivos BYTEA, -- Para almacenar PDFs o imágenes (opcional)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(paciente_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctores(doctor_id) ON DELETE SET NULL,
    FOREIGN KEY (cita_id) REFERENCES citas(cita_id) ON DELETE SET NULL
);

-- Tabla de Departamentos (Opcional para clínicas grandes)
CREATE TABLE departamentos (
    departamento_id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL, -- Ej: Urgencias, Laboratorio
    responsable_id INT,
    FOREIGN KEY (responsable_id) REFERENCES doctores(doctor_id) ON DELETE SET NULL
);
