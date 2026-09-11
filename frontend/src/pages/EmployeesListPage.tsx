import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pagination } from '../components/Pagination';
import { deleteEmployee, fetchEmployees } from '../api/employees';
import type { Employee } from '../api/employees';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function EmployeesListPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEmployees({
        search: debouncedSearch || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setEmployees(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      setError('No se pudo cargar el listado de empleados');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  async function handleDelete(employee: Employee) {
    const confirmed = window.confirm(
      `¿Eliminar a ${employee.apellido}${employee.nombre ? ', ' + employee.nombre : ''} (CI ${employee.ci})?`,
    );
    if (!confirmed) return;

    try {
      await deleteEmployee(employee.id);
      if (employees.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        loadEmployees();
      }
    } catch {
      window.alert('No se pudo eliminar el empleado');
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Empleados</h1>
        <Link to="/empleados/nuevo" className="btn btn-primary">
          Nuevo empleado
        </Link>
      </div>

      <input
        type="search"
        className="search-input"
        placeholder="Buscar por nombre, apellido, CI, empresa o profesión…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Buscar empleado"
      />

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p className="empty-state">Cargando…</p>
      ) : employees.length === 0 ? (
        <p className="empty-state">No se encontraron empleados.</p>
      ) : (
        <table className="employees-table">
          <thead>
            <tr>
              <th>CI</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Profesión</th>
              <th>Puesto</th>
              <th>Empresa</th>
              <th>Calificación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td data-label="CI">{employee.ci}</td>
                <td data-label="Nombre">{employee.nombre || '—'}</td>
                <td data-label="Apellido">{employee.apellido}</td>
                <td data-label="Profesión">{employee.profesion}</td>
                <td data-label="Puesto">{employee.puesto || '—'}</td>
                <td data-label="Empresa">{employee.empresa || '—'}</td>
                <td data-label="Calificación">
                  <span className="badge">{employee.calificacion}/10</span>
                </td>
                <td data-label="Acciones" className="actions-cell">
                  <Link to={`/empleados/${employee.id}/editar`} className="btn btn-secondary">
                    Editar
                  </Link>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDelete(employee)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
    </div>
  );
}
