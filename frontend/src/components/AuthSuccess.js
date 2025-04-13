import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/AuthSuccess.css'; // Assurez-vous d'avoir ce fichier CSS pour le style
function AuthSuccess() {
  const [message, setMessage] = useState('Authentification réussie, redirection en cours...');
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier l'état de l'authentification
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/user', {
          method: 'GET',
          credentials: 'include', // Important pour envoyer les cookies de session
        });

        const data = await response.json();
        
        if (data.success) {
          // Stocker les informations utilisateur si nécessaire
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Rediriger vers le tableau de bord après un court délai
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          setMessage('Échec de l\'authentification. Redirection vers la page de connexion...');
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        setMessage('Une erreur est survenue. Redirection vers la page d\'accueil...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  return (
    <div className="auth-success-container">
      <div className="auth-success-content">
        <h2>Authentification</h2>
        <div className="loading-spinner"></div>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default AuthSuccess;