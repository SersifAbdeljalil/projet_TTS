import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Auth.css';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaFacebook, FaTwitter, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';

function Signup({ onClose, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Fonctions pour la gestion des mots de passe
  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength('');
      return;
    }
    
    if (password.length < 6) {
      setPasswordStrength('weak');
    } else if (password.length < 10) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  };
  
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Fonction d'inscription
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }
    
    if (!agreeTerms) {
      setError('Vous devez accepter les conditions d\'utilisation');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Annonce vocale pour confirmation
        const successMessage = 'Inscription réussie ! Vous pouvez maintenant vous connecter.';
        // Si disponible dans votre API TTS:
        // window.speechSynthesis.speak(new SpeechSynthesisUtterance(successMessage));
        
        if (onSwitchToLogin) {
          onSwitchToLogin();
        } else {
          navigate('/login');
        }
      } else {
        setError(data.message || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      setError('Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Navigation
  const handleSwitchToLogin = (e) => {
    e.preventDefault();
    if (onSwitchToLogin) {
      onSwitchToLogin();
    } else {
      navigate('/login');
    }
  };
  
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/');
    }
  };

  // Authentification sociale
  const handleGoogleLogin = () => {
    localStorage.setItem('redirectAfterAuth', '/dashboard');
    window.location.assign('http://localhost:5000/api/auth/google');
  };

  const handleFacebookLogin = () => {
    localStorage.setItem('redirectAfterAuth', '/dashboard');
    window.location.href = 'http://localhost:5000/api/auth/facebook';
  };

  const handleTwitterLogin = () => {
    // Implémentation à venir pour Twitter/X
    console.log("Twitter login clicked");
  };

  return (
    <div className="auth-modal" role="dialog" aria-labelledby="signup-title">
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
          <h2 id="signup-title">Créer un compte</h2>
          <p>Rejoignez-nous et commencez à explorer</p>
        </div>
        
        <div className="social-buttons" aria-label="Options de connexion avec réseaux sociaux">
          <button 
            className="social-button google" 
            onClick={handleGoogleLogin} 
            type="button"
            aria-label="S'inscrire avec Google"
            title="S'inscrire avec Google"
          >
            <FaGoogle />
            <span className="sr-only">Google</span>
          </button>
          <button 
            className="social-button facebook" 
            onClick={handleFacebookLogin} 
            type="button"
            aria-label="S'inscrire avec Facebook"
            title="S'inscrire avec Facebook"
          >
            <FaFacebook />
            <span className="sr-only">Facebook</span>
          </button>
          <button 
            className="social-button twitter" 
            type="button"
            onClick={handleTwitterLogin}
            aria-label="S'inscrire avec Twitter"
            title="S'inscrire avec Twitter"
          >
            <FaTwitter />
            <span className="sr-only">Twitter</span>
          </button>
        </div>
        
        <div className="auth-divider" role="separator">
          <span>OU</span>
        </div>
        
        {error && <div className="error-message" role="alert">{error}</div>}
        
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="name">Nom complet</label>
            <div className="input-icon-wrapper">
              <FaUser className="input-icon" aria-hidden="true" />
              <input 
                id="name"
                type="text" 
                className="input-with-icon"
                placeholder="Votre nom complet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-required="true"
                autoComplete="name"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="signup-email">Adresse email</label>
            <div className="input-icon-wrapper">
              <FaEnvelope className="input-icon" aria-hidden="true" />
              <input 
                id="signup-email"
                type="email" 
                className="input-with-icon"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
                autoComplete="email"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="signup-password">Mot de passe</label>
            <div className="input-icon-wrapper">
              <FaLock className="input-icon" aria-hidden="true" />
              <input 
                id="signup-password"
                type={showPassword ? "text" : "password"} 
                className="input-with-icon"
                placeholder="Créez un mot de passe fort"
                value={password}
                onChange={handlePasswordChange}
                required
                aria-required="true"
                autoComplete="new-password"
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {password && (
              <>
                <div className="password-strength" aria-live="polite">
                  <div 
                    className={`password-strength-bar strength-${passwordStrength}`}
                    aria-label={`Force du mot de passe : ${passwordStrength === 'weak' ? 'faible' : passwordStrength === 'medium' ? 'moyenne' : 'forte'}`}
                  ></div>
                </div>
                <div className="password-rules" aria-live="polite">
                  Le mot de passe doit contenir au moins 6 caractères.
                </div>
              </>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm-password">Confirmer le mot de passe</label>
            <div className="input-icon-wrapper">
              <FaLock className="input-icon" aria-hidden="true" />
              <input 
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"} 
                className="input-with-icon"
                placeholder="Confirmez votre mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                aria-required="true"
                autoComplete="new-password"
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={toggleConfirmPasswordVisibility}
                aria-label={showConfirmPassword ? "Masquer la confirmation de mot de passe" : "Afficher la confirmation de mot de passe"}
                title={showConfirmPassword ? "Masquer la confirmation de mot de passe" : "Afficher la confirmation de mot de passe"}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          <div className="remember-me">
            <input 
              type="checkbox" 
              id="agree-terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
              aria-required="true"
            />
            <label htmlFor="agree-terms">
              J'accepte les <a href="/terms">conditions d'utilisation</a> et la <a href="/privacy">politique de confidentialité</a>
            </label>
          </div>
          
          <div className="buttons-group">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose}
            >
              Annuler
            </button>
          </div>
        </form>
        
        <div className="form-footer">
          <p>Vous avez déjà un compte ? <a href="#login" onClick={handleSwitchToLogin} className="text-link">Se connecter</a></p>
        </div>
      </div>
    </div>
  );
}

export default Signup;