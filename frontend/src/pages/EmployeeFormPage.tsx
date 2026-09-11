import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { createEmployee, fetchEmployee, updateEmployee } from '../api/employees';
import type { EmployeeFormValues } from '../api/employees';

const EMPTY_FORM: EmployeeFormValues = {
  ci: '',
  nombre: '',
  apellido: '',
  profesion: '',
  puesto: '',
  empresa: 'Imprenta Soliz',
  calificacion: 5,
  comentario: '',
};

export function EmployeeFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<EmployeeFormValues>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchEmployee(Number(id))
      .then((employee) => {
        setForm({
          ci: employee.ci,
          nombre: employee.nombre ?? '',
          apellido: employee.apellido,
          profesion: employee.profesion,
          puesto: employee.puesto ?? '',
          empresa: employee.empresa ?? '',
          calificacion: employee.calificacion,
          comentario: employee.comentario ?? '',
        });
      })
      .catch(() => setError('No se pudo cargar el empleado'))
      .finally(() => setLoading(false));
  }, [id]);

  function updateField<K extends keyof EmployeeFormValues>(key: K, value: EmployeeFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload: EmployeeFormValues = {
      ...form,
      nombre: form.nombre?.trim() || undefined,
      puesto: form.puesto?.trim() || undefined,
      empresa: form.empresa?.trim() || undefined,
      comentario: form.comentario?.trim() || undefined,
    };

    try {
      if (isEditing && id) {
        await updateEmployee(Number(id), payload);
      } else {
        await createEmployee(payload);
      }
      navigate('/empleados');
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setError('Ya existe un empleado con ese CI');
      } else if (isAxiosError(err) && err.response?.status === 400) {
        setError('Revisá los campos obligatorios: CI, Apellido, Profesión y Calificación (1-10)');
      } else {
        setError('No se pudo guardar el empleado');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <p className="empty-state">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{isEditing ? 'Editar empleado' : 'Nuevo empleado'}</h1>
      </div>

      <form className="employee-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>CI *</span>
            <input
              type="text"
              value={form.ci}
              onChange={(e) => updateField('ci', e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Nombre</span>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => updateField('nombre', e.target.value)}
            />
          </label>

          <label className="field">
            <span>Apellido *</span>
            <input
              type="text"
              value={form.apellido}
              onChange={(e) => updateField('apellido', e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Profesión *</span>
            <input
              type="text"
              value={form.profesion}
              onChange={(e) => updateField('profesion', e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Puesto de trabajo</span>
            <input
              type="text"
              value={form.puesto}
              onChange={(e) => updateField('puesto', e.target.value)}
            />
          </label>

          <label className="field">
            <span>Empresa</span>
            <input
              type="text"
              value={form.empresa}
              onChange={(e) => updateField('empresa', e.target.value)}
            />
          </label>

          <label className="field">
            <span>Calificación (1-10) *</span>
            <input
              type="number"
              min={1}
              max={10}
              value={form.calificacion}
              onChange={(e) => updateField('calificacion', Number(e.target.value))}
              required
            />
          </label>

          <label className="field field-full">
            <span>Comentario</span>
            <textarea
              value={form.comentario}
              onChange={(e) => updateField('comentario', e.target.value)}
              rows={4}
            />
          </label>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/empleados')}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
