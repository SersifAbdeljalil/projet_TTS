import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Login.css'; 
import { FaEnvelope, FaLock, FaGoogle, FaFacebook, FaTwitter, FaTimes } from 'react-icons/fa';

function Login({ onClose, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important pour les cookies
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Stocker le token dans localStorage
        localStorage.setItem('token', data.token);
        
        // Si l'utilisateur est connecté depuis la modal
        if (onClose) {
          onClose(); // Fermer la modal
          // Rediriger vers le dashboard après avoir fermé la modal
          setTimeout(() => navigate('/dashboard'), 100);
        } else {
          // Redirection directe si on est sur la page /login
          navigate('/dashboard');
        }
      } else {
        alert(data.message || 'Identifiants invalides');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      alert('Erreur lors de la connexion');
    }
  };

  // Pour gérer les redirections après auth OAuth
  useEffect(() => {
    // Vérifier si l'utilisateur est déjà authentifié
    const token = localStorage.getItem('token');
    if (token) {
      // Si modal, fermer puis rediriger
      if (onClose) {
        onClose();
        setTimeout(() => navigate('/dashboard'), 100);
      } else {
        navigate('/dashboard');
      }
    }
  }, [navigate, onClose]);

  const handleGoogleLogin = () => {
    console.log("Google login clicked");
    // Stocker l'URL de redirection souhaitée
    localStorage.setItem('redirectAfterAuth', '/dashboard');
    window.location.assign('http://localhost:5000/api/auth/google');
  };

  const handleFacebookLogin = () => {
    localStorage.setItem('redirectAfterAuth', '/dashboard');
    window.location.href = 'http://localhost:5000/api/auth/facebook';
  };

  const handleSwitchToSignup = (e) => {
    e.preventDefault();
    if (onSwitchToSignup) {
      onSwitchToSignup();
    } else {
      navigate('/signup');
    }
  };
  
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/');
    }
  };
  
  return (
    <div className="auth-modal">
      <div className="auth-container">
        <button className="close-button" onClick={handleClose}>
          <FaTimes />
        </button>
        <div className="auth-header">
          <h2>Connexion</h2>
          <p>Bienvenue ! Veuillez vous connecter pour continuer</p>
        </div>

        <div className="social-buttons">
          <button className="social-button" onClick={handleGoogleLogin} type="button">
            <FaGoogle />
          </button>
          <button className="social-button" onClick={handleFacebookLogin} type="button">
            <FaFacebook />
          </button>
          <button className="social-button" type="button">
            <FaTwitter />
          </button>
        </div>
        
        <div className="auth-divider">
          <span>OU</span>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Adresse email</label>
            <div className="input-icon-wrapper">
              <FaEnvelope className="input-icon" />
              <input 
                id="email"
                type="email" 
                className="input-with-icon"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <div className="input-icon-wrapper">
              <FaLock className="input-icon" />
              <input 
                id="password"
                type="password" 
                className="input-with-icon"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="remember-me">
            <input 
              type="checkbox" 
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me">Se souvenir de moi</label>
          </div>
          
          <div className="buttons-group">
            <button type="submit" className="btn btn-primary">Se connecter</button>
            <button type="button" className="btn btn-secondary" onClick={handleClose}>Annuler</button>
          </div>
        </form>
        
        <div className="form-footer">
          <p>Mot de passe oublié ? <a href="/reset-password">Réinitialiser</a></p>
          <p>Pas encore de compte ? <a href="#signup" onClick={handleSwitchToSignup}>S'inscrire</a></p>
        </div>
      </div>
    </div>
  );
}

export default Login;