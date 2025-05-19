'use client';

import React, { useState, useEffect } from 'react';

interface Paciente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
}

export default function Pacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pacientes');
      const data = await res.json();
      setPacientes(data);
    } catch (error) {
      console.error('Failed to fetch pacientes', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update paciente
        await fetch(`/api/pacientes/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        // Create paciente
        await fetch('/api/pacientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      setForm({ nombre: '', email: '', telefono: '' });
      setEditingId(null);
      fetchPacientes();
    } catch (error) {
      console.error('Failed to save paciente', error);
    }
  };

  const handleEdit = (paciente: Paciente) => {
    setForm({ nombre: paciente.nombre, email: paciente.email, telefono: paciente.telefono });
    setEditingId(paciente.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este paciente?')) return;
    try {
      await fetch(`/api/pacientes/${id}`, { method: 'DELETE' });
      fetchPacientes();
    } catch (error) {
      console.error('Failed to delete paciente', error);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Pacientes</h1>
      {loading ? (
        <p>Cargando pacientes...</p>
      ) : (
        <table border={1} cellPadding={5} cellSpacing={0}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.email}</td>
                <td>{p.telefono}</td>
                <td>
                  <button onClick={() => handleEdit(p)}>Editar</button>
                  <button onClick={() => handleDelete(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h2>{editingId ? 'Editar Paciente' : 'Nuevo Paciente'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleInputChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleInputChange}
          required
        />
        <input
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleInputChange}
          required
        />
        <button type="submit">{editingId ? 'Actualizar' : 'Crear'}</button>
      </form>
    </div>
  );
}
