import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { username, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return null;
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="navbar">
      <span className="navbar-brand">Registro de Empleados</span>
      <div className="navbar-user">
        <span className="navbar-username">{username}</span>
        <button type="button" className="btn btn-secondary" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
