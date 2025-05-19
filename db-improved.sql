-- PostgreSQL schema for medical appointment system

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES ('admin'), ('doctor'), ('patient');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL REFERENCES roles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE specialties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(7) NOT NULL -- Hex color code for calendar event
);

CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE doctors (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id),
  specialty_id INT NOT NULL REFERENCES specialties(id),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  doctor_id INT NOT NULL REFERENCES doctors(id),
  patient_id INT NOT NULL REFERENCES patients(id),
  specialty_id INT NOT NULL REFERENCES specialties(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
