import { apiClient } from './client';

export interface Employee {
  id: number;
  ci: string;
  nombre: string | null;
  apellido: string;
  profesion: string;
  puesto: string | null;
  empresa: string | null;
  calificacion: number;
  comentario: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedEmployees {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EmployeeFormValues {
  ci: string;
  nombre?: string;
  apellido: string;
  profesion: string;
  puesto?: string;
  empresa?: string;
  calificacion: number;
  comentario?: string;
}

export function fetchEmployees(params: { search?: string; page?: number; limit?: number }) {
  return apiClient
    .get<PaginatedEmployees>('/employees', { params })
    .then((res) => res.data);
}

export function fetchEmployee(id: number) {
  return apiClient.get<Employee>(`/employees/${id}`).then((res) => res.data);
}

export function createEmployee(values: EmployeeFormValues) {
  return apiClient.post<Employee>('/employees', values).then((res) => res.data);
}

export function updateEmployee(id: number, values: EmployeeFormValues) {
  return apiClient.patch<Employee>(`/employees/${id}`, values).then((res) => res.data);
}

export function deleteEmployee(id: number) {
  return apiClient.delete(`/employees/${id}`);
}
