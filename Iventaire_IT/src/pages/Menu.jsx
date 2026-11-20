// Menu.jsx (ou Sidebar.jsx)
import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
  BiListUl, BiPlus, BiTransfer, BiArchive, BiChevronLeft, BiChevronRight, BiLogOut, BiUser, BiHome
} from 'react-icons/bi';

function Menu({ sidebarVisible, toggleSidebar, isMobile, userType }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mouvementOpen, setMouvementOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const toggleMouvement = () => setMouvementOpen(!mouvementOpen);
  const toggleArchive = () => setArchiveOpen(!archiveOpen);

  const handleToggleSidebar = () => {
    if (isMobile) {
      toggleSidebar();
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Menu restreint pour 'User' : seulement Accueil, Rapports (listes avec export), Déconnexion
  if (userType === 'User') {
    return (
      <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${isMobile && !sidebarVisible ? 'hidden' : ''} ${isMobile && sidebarVisible ? 'mobile-open' : ''}`}>
        <div className="sidebar-nav-container">
          <Nav className="sidebar-nav flex-column mb-auto">
            <Nav.Link as={Link} to="/dash" className={`nav-item d-flex align-items-center ${isActive('/dash')}`} onClick={isMobile ? toggleSidebar : undefined}>
              <BiHome size={20} className="nav-icon" />
              {!collapsed && <span>Accueil</span>}
            </Nav.Link>
            
            <button className="nav-item d-flex align-items-center w-100" onClick={toggleArchive}>
              <BiArchive size={20} className="nav-icon" />
              {!collapsed && <span>Rapports</span>}
            </button>
            
            {archiveOpen && !collapsed && (
              <div className="nav-dropdown">
                <Nav.Link as={Link} to="/liste" className={`dropdown-item ${isActive('/liste')}`} onClick={isMobile ? toggleSidebar : undefined}>
                  <span>Matériels</span>
                </Nav.Link>
                <Nav.Link as={Link} to="/listeAffecte" className={`dropdown-item ${isActive('/listeAffecte')}`} onClick={isMobile ? toggleSidebar : undefined}>
                  <span>Affectation</span>
                </Nav.Link>
                <Nav.Link as={Link} to="/listeMaine" className={`dropdown-item ${isActive('/listeMaine')}`} onClick={isMobile ? toggleSidebar : undefined}>
                  <span>Maintenance</span>
                </Nav.Link>
              </div>
            )}
            
            <button onClick={handleLogout} className="nav-item d-flex align-items-center w-100 mt-auto">
              <BiLogOut size={20} className="nav-icon" />
              {!collapsed && <span>Déconnexion</span>}
            </button>
          </Nav>
        </div>
        {!isMobile && (
          <button className="collapse-toggle-btn" onClick={handleToggleSidebar}>
            {collapsed ? <BiChevronRight size={20} /> : <BiChevronLeft size={20} />}
          </button>
        )}
      </div>
    );
  }

  // Menu pour 'editor' : Accueil, Ajout (matériel), Rapports, Déconnexion
  if (userType === 'editeur') {
    return (
      <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${isMobile && !sidebarVisible ? 'hidden' : ''} ${isMobile && sidebarVisible ? 'mobile-open' : ''}`}>
        <div className="sidebar-nav-container">
          <Nav className="sidebar-nav flex-column mb-auto">
            <Nav.Link as={Link} to="/dash" className={`nav-item d-flex align-items-center ${isActive('/dash')}`} onClick={isMobile ? toggleSidebar : undefined}>
              <BiHome size={20} className="nav-icon" />
              {!collapsed && <span>Accueil</span>}
            </Nav.Link>
            
            <Nav.Link as={Link} to="/ajout" className={`nav-item d-flex align-items-center ${isActive('/ajout')}`} onClick={isMobile ? toggleSidebar : undefined}>
              <BiPlus size={20} className="nav-icon" />
              {!collapsed && <span>Ajout Matériel</span>}
            </Nav.Link>
            
            <button className="nav-item d-flex align-items-center w-100" onClick={toggleArchive}>
              <BiArchive size={20} className="nav-icon" />
              {!collapsed && <span>Rapports</span>}
            </button>
            
            {archiveOpen && !collapsed && (
              <div className="nav-dropdown">
                <Nav.Link as={Link} to="/liste" className={`dropdown-item ${isActive('/liste')}`} onClick={isMobile ? toggleSidebar : undefined}>
                  <span>Matériels</span>
                </Nav.Link>
                <Nav.Link as={Link} to="/listeAffecte" className={`dropdown-item ${isActive('/listeAffecte')}`} onClick={isMobile ? toggleSidebar : undefined}>
                  <span>Affectation</span>
                </Nav.Link>
                <Nav.Link as={Link} to="/listeMaine" className={`dropdown-item ${isActive('/listeMaine')}`} onClick={isMobile ? toggleSidebar : undefined}>
                  <span>Maintenance</span>
                </Nav.Link>
              </div>
            )}
            
            <button onClick={handleLogout} className="nav-item d-flex align-items-center w-100 mt-auto">
              <BiLogOut size={20} className="nav-icon" />
              {!collapsed && <span>Déconnexion</span>}
            </button>
          </Nav>
        </div>
        {!isMobile && (
          <button className="collapse-toggle-btn" onClick={handleToggleSidebar}>
            {collapsed ? <BiChevronRight size={20} /> : <BiChevronLeft size={20} />}
          </button>
        )}
      </div>
    );
  }

  // Menu complet pour 'admin'
  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${isMobile && !sidebarVisible ? 'hidden' : ''} ${isMobile && sidebarVisible ? 'mobile-open' : ''}`}>
      <div className="sidebar-nav-container">
        <Nav className="sidebar-nav flex-column mb-auto">
          <Nav.Link as={Link} to="/dash" className={`nav-item d-flex align-items-center ${isActive('/dash')}`} onClick={isMobile ? toggleSidebar : undefined}>
            <BiHome size={20} className="nav-icon" />
            {!collapsed && <span>Accueil</span>}
          </Nav.Link>
          
          <Nav.Link as={Link} to="/ajout" className={`nav-item d-flex align-items-center ${isActive('/ajout')}`} onClick={isMobile ? toggleSidebar : undefined}>
            <BiPlus size={20} className="nav-icon" />
            {!collapsed && <span>Matériel</span>}
          </Nav.Link>
          
          <button className="nav-item d-flex align-items-center w-100" onClick={toggleMouvement}>
            <BiTransfer size={20} className="nav-icon" />
            {!collapsed && <span>Mouvement</span>}
          </button>
          
          {mouvementOpen && !collapsed && (
            <div className="nav-dropdown">
              <Nav.Link as={Link} to="/Equi" className={`dropdown-item ${isActive('/Equi')}`} onClick={isMobile ? toggleSidebar : undefined}>
                <span>Affectation</span>
              </Nav.Link>
              <Nav.Link as={Link} to="/ListeMain" className={`dropdown-item ${isActive('/ListeMain')}`} onClick={isMobile ? toggleSidebar : undefined}>
                <span>Maintenance</span>
              </Nav.Link>
            </div>
          )}
          
          <button className="nav-item d-flex align-items-center w-100" onClick={toggleArchive}>
            <BiArchive size={20} className="nav-icon" />
            {!collapsed && <span>Rapports</span>}
          </button>
          
          {archiveOpen && !collapsed && (
            <div className="nav-dropdown">
              <Nav.Link as={Link} to="/liste" className={`dropdown-item ${isActive('/liste')}`} onClick={isMobile ? toggleSidebar : undefined}>
                <span>Matériels</span>
              </Nav.Link>
              <Nav.Link as={Link} to="/listeAffecte" className={`dropdown-item ${isActive('/listeAffecte')}`} onClick={isMobile ? toggleSidebar : undefined}>
                <span>Affectation</span>
              </Nav.Link>
              <Nav.Link as={Link} to="/listeMaine" className={`dropdown-item ${isActive('/listeMaine')}`} onClick={isMobile ? toggleSidebar : undefined}>
                <span>Maintenance</span>
              </Nav.Link>
            </div>
          )}

          <Nav.Link as={Link} to="/user" className={`nav-item d-flex align-items-center ${isActive('/user')}`} onClick={isMobile ? toggleSidebar : undefined}>
            <BiUser size={20} className="nav-icon" />
            {!collapsed && <span>Utilisateurs</span>}
          </Nav.Link>

          <button onClick={handleLogout} className="nav-item d-flex align-items-center w-100 mt-auto">
            <BiLogOut size={20} className="nav-icon" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </Nav>
      </div>
      {!isMobile && (
        <button className="collapse-toggle-btn" onClick={handleToggleSidebar}>
          {collapsed ? <BiChevronRight size={20} /> : <BiChevronLeft size={20} />}
        </button>
      )}
    </div>
  );
}

export default Menu;