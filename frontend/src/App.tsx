import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { EmployeesListPage } from './pages/EmployeesListPage';
import { EmployeeFormPage } from './pages/EmployeeFormPage';

export function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/empleados"
            element={
              <ProtectedRoute>
                <EmployeesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/empleados/nuevo"
            element={
              <ProtectedRoute>
                <EmployeeFormPage mode="create" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/empleados/:id/editar"
            element={
              <ProtectedRoute>
                <EmployeeFormPage mode="edit" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/empleados/:id/ver"
            element={
              <ProtectedRoute>
                <EmployeeFormPage mode="view" />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/empleados" replace />} />
          <Route path="*" element={<Navigate to="/empleados" replace />} />
        </Routes>
      </main>
    </AuthProvider>
  );
}
