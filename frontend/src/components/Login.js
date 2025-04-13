import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Auth.css';
import { FaEnvelope, FaLock, FaGoogle, FaFacebook, FaTwitter, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';

function Login({ onClose, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        
        if (onClose) {
          onClose();
          setTimeout(() => navigate('/dashboard'), 100);
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Identifiants invalides');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Vérifier la validité du token
      fetch('http://localhost:5000/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Token valide, rediriger vers le tableau de bord
          if (onClose) {
            onClose();
            setTimeout(() => navigate('/dashboard'), 100);
          } else {
            navigate('/dashboard');
          }
        } else {
          // Token invalide, le supprimer
          localStorage.removeItem('token');
        }
      })
      .catch(err => {
        console.error('Erreur de vérification du token:', err);
        localStorage.removeItem('token');
      });
    }
  }, [navigate, onClose]);

  const handleGoogleLogin = () => {
    // Stocker l'information de redirection dans localStorage
    localStorage.setItem('redirectAfterAuth', '/dashboard');
    
    // Afficher l'indicateur de chargement
    setIsLoading(true);
    
    // Rediriger vers l'endpoint d'authentification Google
    setTimeout(() => {
      window.location.assign('http://localhost:5000/api/auth/google');
    }, 500);
  };

  const handleFacebookLogin = () => {
    // Stocker l'information de redirection dans localStorage
    localStorage.setItem('redirectAfterAuth', '/dashboard');
    
    // Afficher l'indicateur de chargement
    setIsLoading(true);
    
    // Rediriger vers l'endpoint d'authentification Facebook
    setTimeout(() => {
      window.location.href = 'http://localhost:5000/api/auth/facebook';
    }, 500);
  };

  const handleTwitterLogin = () => {
    // Afficher une alerte visuelle
    setError("L'authentification via Twitter n'est pas encore disponible. Veuillez utiliser Google ou Facebook.");
    
    // Alternative: rediriger vers la documentation
    // window.location.href = 'http://localhost:5000/api/auth/twitter';
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
    <div className="auth-modal" role="dialog" aria-labelledby="login-title">
      <div className="auth-container">
        <button 
          className="close-button" 
          onClick={handleClose} 
          aria-label="Fermer"
          title="Fermer"
        >
          <FaTimes />
        </button>
        
        <div className="auth-header">
          <h2 id="login-title">Connexion</h2>
          <p>Bienvenue ! Veuillez vous connecter pour continuer</p>
        </div>

        <div className="social-buttons" aria-label="Options de connexion avec réseaux sociaux">
          <button 
            className="social-button google" 
            onClick={handleGoogleLogin} 
            type="button"
            aria-label="Se connecter avec Google"
            title="Se connecter avec Google"
            disabled={isLoading}
          >
            <FaGoogle />
            <span className="sr-only">Google</span>
          </button>
          <button 
            className="social-button facebook" 
            onClick={handleFacebookLogin} 
            type="button"
            aria-label="Se connecter avec Facebook"
            title="Se connecter avec Facebook"
            disabled={isLoading}
          >
            <FaFacebook />
            <span className="sr-only">Facebook</span>
          </button>
          <button 
            className="social-button twitter" 
            type="button"
            onClick={handleTwitterLogin}
            aria-label="Se connecter avec Twitter"
            title="Se connecter avec Twitter"
            disabled={isLoading}
          >
            <FaTwitter />
            <span className="sr-only">Twitter</span>
          </button>
        </div>
        
        <div className="auth-divider" role="separator">
          <span>OU</span>
        </div>
        
        {error && (
          <div className="error-message" role="alert" aria-live="assertive">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Adresse email</label>
            <div className="input-icon-wrapper">
              <FaEnvelope className="input-icon" aria-hidden="true" />
              <input 
                id="email"
                type="email" 
                className="input-with-icon"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <div className="input-icon-wrapper">
              <FaLock className="input-icon" aria-hidden="true" />
              <input 
                id="password"
                type={showPassword ? "text" : "password"}
                className="input-with-icon"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required="true"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                disabled={isLoading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          <div className="remember-me">
            <input 
              type="checkbox" 
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
            />
            <label htmlFor="remember-me">Se souvenir de moi</label>
          </div>
          
          <div className="buttons-group">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </button>
            </div>
        </form>
        
        <div className="form-footer">
          <p><a href="/reset-password" className="text-link">Mot de passe oublié ?</a></p>
          <p>Pas encore de compte ? <a href="#signup" className="text-link" onClick={handleSwitchToSignup}>S'inscrire</a></p>
        </div>
      </div>
    </div>
  );
}

export default Login;