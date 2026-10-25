import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { Sidebar } from '../Sidebar/Sidebar';

export function Layout() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <header className="topbar">
          <div className="muted">
            {profile ? `${profile.email}` : 'Signed in'}
          </div>
          <button type="button" className="secondary" onClick={() => void onLogout()}>
            Logout
          </button>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
