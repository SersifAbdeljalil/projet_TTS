import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer le token de l'URL si présent
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      // Stocker le token dans localStorage
      localStorage.setItem('token', token);
    }
    
    // Récupérer la destination souhaitée ou utiliser dashboard par défaut
    const redirectTo = localStorage.getItem('redirectAfterAuth') || '/dashboard';
    
    // Nettoyer
    localStorage.removeItem('redirectAfterAuth');
    
    // Rediriger vers la destination
    navigate(redirectTo);
  }, [navigate]);

  return (
    <div className="auth-success">
      <h2>Authentification réussie</h2>
      <p>Redirection en cours...</p>
    </div>
  );
}

export default AuthSuccess;