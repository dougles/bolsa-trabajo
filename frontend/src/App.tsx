import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { EmployeesListPage } from './pages/EmployeesListPage';
import { EmployeeFormPage } from './pages/EmployeeFormPage';

// Página pública: /empleados y sus sub-rutas ya no requieren login (2026-09-11).
export function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/empleados" element={<EmployeesListPage />} />
          <Route path="/empleados/nuevo" element={<EmployeeFormPage mode="create" />} />
          <Route path="/empleados/:id/editar" element={<EmployeeFormPage mode="edit" />} />
          <Route path="/empleados/:id/ver" element={<EmployeeFormPage mode="view" />} />
          <Route path="/" element={<Navigate to="/empleados" replace />} />
          <Route path="*" element={<Navigate to="/empleados" replace />} />
        </Routes>
      </main>
    </AuthProvider>
  );
}
