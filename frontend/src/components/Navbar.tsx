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
      <div className="navbar-brand-container" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px' }}>
        <img src="/icam.jpeg" alt="Logo ICAM" className="navbar-brand" style={{ width: '80px', height: '80px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
          <span className="navbar-brand">Bolsa de Trabajo ICAM</span>
          <span className="navbar-brand" style={{ fontSize: '14px' }}>Vota por Marcelo Gamboa</span>
        </div>
      </div>


      <div className="navbar-user">
        <span className="navbar-username">{username}</span>
        <button type="button" className="btn btn-secondary" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
