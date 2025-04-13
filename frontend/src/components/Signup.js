import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Signup.css';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaFacebook, FaTwitter, FaTimes } from 'react-icons/fa';

function Signup({ onClose, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();
  
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
  
  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (!agreeTerms) {
      alert('Vous devez accepter les conditions d\'utilisation');
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
        alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        if (onSwitchToLogin) {
          onSwitchToLogin();
        } else {
          navigate('/login');
        }
      } else {
        alert(data.message || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      alert('Erreur lors de l\'inscription');
    }
  };
  
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

  const handleGoogleLogin = () => {
    console.log("Google login clicked"); // Debug log
    window.location.assign('http://localhost:5000/api/auth/google');
    
    // Alternative plus robuste :
    // window.open(
    //   'http://localhost:5000/api/auth/google',
    //   '_blank',
    //   'noopener,noreferrer'
    // );
  };

  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/facebook';
  };

  const handleTwitterLogin = () => {
    // Implémentation à venir pour Twitter/X
    console.log("Twitter login clicked");
    // window.location.href = 'http://localhost:5000/api/auth/twitter';
  };

  return (
    <div className="auth-modal">
      <div className="auth-container">
        <button className="close-button" onClick={handleClose}>
          <FaTimes />
        </button>
        
        <div className="auth-header">
          <h2>Créer un compte</h2>
          <p>Rejoignez-nous et commencez à explorer</p>
        </div>
        
        <div className="social-buttons">
          <button className="social-button" onClick={handleGoogleLogin} type="button">
            <FaGoogle />
          </button>
          <button className="social-button" onClick={handleFacebookLogin} type="button">
            <FaFacebook />
          </button>
          <button className="social-button" onClick={handleTwitterLogin} type="button">
            <FaTwitter />
          </button>
        </div>
        
        <div className="auth-divider">
          <span>OU</span>
        </div>
        
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="name">Nom complet</label>
            <div className="input-icon-wrapper">
              <FaUser className="input-icon" />
              <input 
                id="name"
                type="text" 
                className="input-with-icon"
                placeholder="Votre nom complet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="signup-email">Adresse email</label>
            <div className="input-icon-wrapper">
              <FaEnvelope className="input-icon" />
              <input 
                id="signup-email"
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
            <label htmlFor="signup-password">Mot de passe</label>
            <div className="input-icon-wrapper">
              <FaLock className="input-icon" />
              <input 
                id="signup-password"
                type="password" 
                className="input-with-icon"
                placeholder="Créez un mot de passe fort"
                value={password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            {password && (
              <>
                <div className="password-strength">
                  <div className={`password-strength-bar strength-${passwordStrength}`}></div>
                </div>
                <div className="password-rules">
                  Le mot de passe doit contenir au moins 6 caractères.
                </div>
              </>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm-password">Confirmer le mot de passe</label>
            <div className="input-icon-wrapper">
              <FaLock className="input-icon" />
              <input 
                id="confirm-password"
                type="password" 
                className="input-with-icon"
                placeholder="Confirmez votre mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="remember-me">
            <input 
              type="checkbox" 
              id="agree-terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />
            <label htmlFor="agree-terms">
              J'accepte les <a href="/terms">conditions d'utilisation</a> et la <a href="/privacy">politique de confidentialité</a>
            </label>
          </div>
          
          <div className="buttons-group">
            <button type="submit" className="btn btn-primary">S'inscrire</button>
            <button type="button" className="btn btn-secondary" onClick={handleClose}>Annuler</button>
          </div>
        </form>
        
        <div className="form-footer">
          <p>Vous avez déjà un compte ? <a href="#login" onClick={handleSwitchToLogin}>Se connecter</a></p>
        </div>
      </div>
    </div>
  );
}

export default Signup;