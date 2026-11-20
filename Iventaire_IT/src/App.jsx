import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Materiel from './pages/materiel/Ajout';
import Modifier from './pages/materiel/modifier';
import Affectation from './pages/mouvement/mouvement';
import Historique from './pages/mouvement/Affectations';
import Menu from './pages/Menu';
import DASH from './pages/Dashboard';
import LISTE from './pages/materiel/LISTE';
import ListeAffect from './pages/Archive/Affectation';
import ListeMaine from './pages/Archive/Maintenance';
import ListeMain from './components/maintenanceliste';
import CreateMain from './components/maintenanceCreation';
import { BiMenu, BiBox, BiLogOut, BiUser, BiMagnet } from 'react-icons/bi';
import PrivateRoute from './pages/login/PrivateRoute';
import LoginPage from './pages/login/Login';
import User from './pages/User/ajoutUser';
import dstLogo from './images/dst_logo.png';
// Fonction manuelle pour décoder le JWT
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Erreur de décodage du JWT:', e);
    return null;
  }
};

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState(null);
  const [notifCount, setNotifCount] = useState(0);
  const token = localStorage.getItem('token');
  const location = useLocation();

  // Mapping des routes aux titres de page
  const pageTitles = {
    '/dash': 'Accueil',
    '/ajout': 'Ajout Matériel',
    '/ajout/edit/:id': 'Modifier Matériel',
    '/Equi': 'Affectation',
    '/HIstoire': 'Historique',
    '/ListeMain': 'Maintenance',
    '/creationMain': 'Créer  Maintenance',
    '/liste': 'Rapports de Materiel',
    '/Raport': 'Rapports',
    '/listeAffecte': 'Historique Affectation',
    '/listeMaine': 'Historique Maintenance'
  };

  // Obtenir le titre de la page actuelle
  const getPageTitle = () => {
    const path = Object.keys(pageTitles).find(key => 
      key.includes(':id') ? location.pathname.startsWith('/ajout/edit/') : location.pathname === key
    );
    return pageTitles[path] || 'Gestion Matériel';
  };

  useEffect(() => {
    if (token) {
      const decoded = decodeJwt(token);
      if (decoded) {
        setUserType(decoded.type_user);
        setUserName(decoded.nom_user || 'Utilisateur');
        
        // Fetch full profile to get avatar
        import('axios').then(axios => {
          axios.default.get('http://localhost:3000/user/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
          .then(res => {
            if (res.data && res.data.avatar) {
              setUserAvatar(res.data.avatar);
            }
          })
          .catch(err => console.error("Erreur avatar:", err));

          // Fetch notifications (Panne)
          axios.default.get('http://localhost:3000/nombrePanne')
          .then(res => {
            if (res.data && res.data.count !== undefined) {
              setNotifCount(res.data.count);
            }
          })
          .catch(err => console.error("Erreur notif:", err));
        });
      }
    } else {
      setUserType(null);
      setUserName('');
      setUserAvatar(null);
      setNotifCount(0);
    }

    const handleResize = () => {
      const mobile = window.innerWidth <= 992;
      setIsMobile(mobile);
      setSidebarVisible(!mobile && location.pathname !== '/login');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [token, location.pathname]);

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const isLoginPage = location.pathname === '/login';

  return (
    <div className="d-flex flex-column">
      {!isLoginPage && (
        <header className="header">
          <div className="header-left" style={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && token && (
              <button
                className="toggle-mobile-btn"
                onClick={toggleSidebar}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  border: 'none',
                  padding: '0.5rem',
                  marginRight: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <BiMenu size={24} />
              </button>
            )}
            <img
              src={dstLogo}
              alt="DST Logo"
              style={{ height: '42px', width: '42px', borderRadius: '50%', marginRight: '10px', objectFit: 'cover' }}
            />
            {/* Drapeau de Madagascar CSS */}
            <div style={{ display: 'flex', height: '28px', width: '42px', marginRight: '15px', border: '1px solid #e0e0e0', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: 'white', flex: 1 }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 2 }}>
                    <div style={{ backgroundColor: '#FC3D32', flex: 1 }}></div>
                    <div style={{ backgroundColor: '#007E3A', flex: 1 }}></div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
              <h1 className="header-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                Direction de Service Topographique
              </h1>
              <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                <span style={{ color: '#007E3A' }}>Mada</span><span style={{ color: '#555' }}>gas</span><span style={{ color: '#FC3D32' }}>car</span>
                <span style={{ color: 'var(--text-secondary, #6c757d)', fontWeight: 400 }}> — Gestion Matière Informatique</span>
              </span>
            </div>
          </div>
          <div className="header-right" style={{ display: 'flex', alignItems: 'center' }}>
            {/* Notification Icon */}
            {token && (
                <div style={{ position: 'relative', marginRight: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title={`${notifCount} matériels en panne/maintenance`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#555' }}>notifications</span>
                    {notifCount > 0 && (
                        <span style={{ 
                            position: 'absolute', top: '-4px', right: '-6px', 
                            backgroundColor: '#FC3D32', color: 'white', 
                            fontSize: '11px', fontWeight: 'bold', 
                            borderRadius: '10px', padding: '2px 6px',
                            border: '2px solid white'
                        }}>
                            {notifCount}
                        </span>
                    )}
                </div>
            )}
            
            {token && (
              <div className="user-profile-menu">
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="user-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div className="user-avatar d-flex align-items-center justify-content-center bg-success text-white fw-bold">
                    {getInitials(userName)}
                  </div>
                )}
                <div className="user-info-text d-none d-md-flex">
                  <span className="user-display-name">{userName}</span>
                  <span className="user-role-badge">{userType}</span>
                </div>
                <div className="profile-dropdown-list">
                  <div className="px-3 py-2 border-bottom d-md-none">
                    <div className="fw-bold" style={{ fontSize: '0.85rem' }}>{userName}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{userType}</div>
                  </div>
                  <button className="dropdown-link-item" onClick={handleLogout}>
                    <BiLogOut size={16} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
      )}
      <div className="main-container d-flex">
        {!isLoginPage && token && (
          <Menu
            sidebarVisible={sidebarVisible}
            toggleSidebar={toggleSidebar}
            isMobile={isMobile}
            userType={userType}
          />
        )}
        <div className="main-content" style={{ flex: 1 }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={<Navigate to={token ? '/dash' : '/login'} />}
            />
            <Route path="/dash" element={<DASH />} />
            <Route
              path="/ajout"
              element={
              
                  <Materiel />
             
              }
            />
            <Route
              path="/ajout/edit/:id"
              element={
                <PrivateRoute>
                  <Modifier />
                </PrivateRoute>
              }
            />
            <Route
              path="/Equi"
              element={
                <PrivateRoute requiredRole="admin">
                  <Affectation />
                </PrivateRoute>
              }
            />
            <Route
              path="/HIstoire"
              element={
                <PrivateRoute requiredRole="admin">
                  <Historique />
                </PrivateRoute>
              }
            />
            <Route
              path="/ListeMain"
              element={
                <PrivateRoute requiredRole="admin">
                  <ListeMain />
                </PrivateRoute>
              }
            />
            <Route
              path="/creationMain"
              element={
                <PrivateRoute requiredRole="admin">
                  <CreateMain />
                </PrivateRoute>
              }
            />
            <Route
              path="/liste"
              element={
                <PrivateRoute>
                  <LISTE />
                </PrivateRoute>
              }
            />
            {/* /Raport redirige vers /liste (même composant, évite la duplication) */}
            <Route path="/Raport" element={<Navigate to="/liste" replace />} />
            <Route
              path="/listeAffecte"
              element={
                <PrivateRoute>
                  <ListeAffect />
                </PrivateRoute>
              }
            />
            <Route
              path="/listeMaine"
              element={
                <PrivateRoute>
                  <ListeMaine />
                </PrivateRoute>
              }
            />
            <Route
              path="/user"
              element={
                <PrivateRoute>
                  <User />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}