import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

function AuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("Authentification réussie, redirection en cours...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const processAuthentication = async () => {
      try {
        // Animation de progression
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) clearInterval(progressInterval);
            return Math.min(prev + 10, 90);
          });
        }, 300);

        console.log("Récupération des données utilisateur...");
        
        // Récupérer les données utilisateur depuis le backend
        const response = await fetch('http://localhost:5000/api/auth/user', {
          method: 'GET',
          credentials: 'include', // Important pour inclure les cookies de session
          headers: {
            'Content-Type': 'application/json'
          },
        });

        console.log("Réponse reçue:", response.status);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Données reçues:", data);
        
        if (!data.success) {
          throw new Error(data.message || "Erreur lors de la récupération des données utilisateur");
        }
        
        // Stocker le token JWT
        if (data.token) {
          localStorage.setItem('token', data.token);
          console.log("Token stocké dans localStorage");
          
          // Stocker les informations utilisateur si nécessaire
          if (data.user) {
            localStorage.setItem('user', JSON.stringify({
              id: data.user.id,
              name: data.user.name,
              email: data.user.email
            }));
            console.log("Données utilisateur stockées dans localStorage");
          }
          
          // Mettre à jour le message
          setMessage("Authentification réussie! Redirection vers le tableau de bord...");
          
          // Progresser à 100%
          clearInterval(progressInterval);
          setProgress(100);
          
          // Récupérer la destination après redirection
          const redirectPath = localStorage.getItem('redirectAfterAuth') || '/dashboard';
          localStorage.removeItem('redirectAfterAuth'); // Nettoyer après usage
          
          console.log("Redirection vers:", redirectPath);
          
          // Rediriger vers le dashboard ou la page demandée
          setTimeout(() => navigate(redirectPath), 1500);
        } else {
          throw new Error("Aucun token reçu du serveur");
        }
      } catch (error) {
        console.error("Erreur d'authentification:", error);
        setError(error.message || "Erreur lors de l'authentification");
        
        // Rediriger vers la page de connexion en cas d'erreur
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processAuthentication();
  }, [navigate, location]);

  return (
    <div className="auth-success" aria-live="polite" role="status">
      <div className="auth-success-container">
        {error ? (
          <>
            <div className="auth-error-icon">❌</div>
            <h2>Échec de l'authentification</h2>
            <p>{error}</p>
            <p>Redirection vers la page de connexion...</p>
          </>
        ) : (
          <>
            <div className="auth-success-spinner">
              <FaSpinner className="spinning-icon" aria-hidden="true" />
            </div>
            <h2>Authentification réussie</h2>
            <p>{message}</p>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${progress}%` }}
                role="progressbar" 
                aria-valuenow={progress} 
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
            </div>
          </>
        )}
      </div>
      
      <style jsx="true">{`
        .auth-success {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #f5f5f5;
        }
        
        .auth-success-container {
          background-color: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 400px;
          width: 90%;
        }
        
        .auth-success-spinner, .auth-error-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: center;
        }
        
        .auth-error-icon {
          color: #e53935;
        }
        
        .spinning-icon {
          animation: spin 1.5s linear infinite;
          color: #4285F4;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        h2 {
          color: #333;
          margin-bottom: 1rem;
        }
        
        p {
          color: #666;
          margin-bottom: 1rem;
        }

        .progress-bar-container {
          width: 100%;
          height: 6px;
          background-color: #f0f0f0;
          border-radius: 3px;
          margin-top: 1.5rem;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background-color: #4285F4;
          border-radius: 3px;
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
}

export default AuthSuccess;