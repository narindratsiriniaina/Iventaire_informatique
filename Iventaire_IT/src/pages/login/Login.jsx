import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MdLogin } from 'react-icons/md';
import { BiUser, BiLockAlt } from 'react-icons/bi';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { dstLogoBase64 } from '../../utils/logoBase64';
import './login.css';

const LoginPage = () => {
  const [nom_user, setNomUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:3000/login', { 
        nom_user, 
        password 
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dash', { replace: true });
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(
        err.response?.data?.message || 
        'Identifiants invalides. Vérifiez vos informations.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Panneau gauche - Branding DST Madagascar */}
        <div className="login-left">
          <div className="login-logo-wrapper">
            <img src={dstLogoBase64} alt="Logo DST Madagascar" className="login-logo" />
          </div>
          
          <div className="login-country">
            <FaMapMarkerAlt className="country-icon" />
            <span>Madagascar</span>
          </div>
          
          <h1 className="login-title">DST Inventaire</h1>
          <p className="login-subtitle">
            Direction des Services Topographiques
          </p>
          
          <div className="login-features">
            <div className="login-feature-item">
              <span className="login-feature-dot"></span>
              <span>Suivi en temps réel</span>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-dot"></span>
              <span>Gestion des affectations</span>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-dot"></span>
              <span>Rapports et exports</span>
            </div>
          </div>
        </div>

        {/* Panneau droit - Formulaire */}
        <div className="login-right">
          <div className="login-form-header">
            <h2>Connexion</h2>
            <p className="login-desc">
              Connectez-vous à votre espace de travail
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="nom_user">
                Nom d'utilisateur
              </label>
              <div className="input-icon-group">
                <BiUser className="input-icon" />
                <input
                  type="text"
                  id="nom_user"
                  className="form-control"
                  value={nom_user}
                  onChange={(e) => setNomUser(e.target.value)}
                  placeholder="Entrez votre nom d'utilisateur"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Mot de passe
              </label>
              <div className="input-icon-group">
                <BiLockAlt className="input-icon" />
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-danger">
                <span className="alert-icon">⚠️</span>
                {error}
              </div>
            )}

            <button
              className="btn-login"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span>
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <MdLogin size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;