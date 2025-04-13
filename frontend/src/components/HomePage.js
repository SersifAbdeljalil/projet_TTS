// frontend/src/components/HomePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Homepage.css';
import { 
  FaBook, 
  FaMicrophone, 
  FaVideo, 
  FaPlay, 
  FaChevronDown, 
  FaUser, 
  FaFileUpload,
  FaHistory,
  FaPlus,
  FaBars,
  FaTimes,
  FaFile,
  FaCog,
  FaRocket,
  FaLock,
  FaUnlock
} from 'react-icons/fa';
import { FiLogIn, FiUserPlus, FiLogOut } from 'react-icons/fi';

function HomePage({ onLogin, onSignup }) {
  const [inputText, setInputText] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [recentConversations, setRecentConversations] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  
  // Vérifier si l'utilisateur est connecté lors du chargement du composant
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      setIsAuthenticated(true);
      // Charger les conversations récentes et le profil utilisateur
      fetchRecentConversations();
      fetchUserProfile();
    } else {
      setIsAuthenticated(false);
    }
    
    // Initialiser l'état du drawer selon l'authentification et la taille de l'écran
    setShowDrawer(window.innerWidth > 768 && token != null);
    
    // Gérer le redimensionnement de la fenêtre
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setShowDrawer(width > 768 && localStorage.getItem('token') != null);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // S'exécute uniquement au montage
  
  // Simuler la récupération des conversations récentes
  const fetchRecentConversations = () => {
    // À remplacer par un appel API réel
    const mockConversations = [
      { id: 1, title: "Conversation sur l'IA", date: "2025-04-12", preview: "Discussion sur les applications de l'IA..." },
      { id: 2, title: "Narration histoire d'aventure", date: "2025-04-10", preview: "Il était une fois un voyageur..." },
      { id: 3, title: "Script de podcast tech", date: "2025-04-08", preview: "Bienvenue dans notre podcast sur..." },
    ];
    setRecentConversations(mockConversations);
  };
  
  // Simuler la récupération du profil utilisateur
  const fetchUserProfile = () => {
    // À remplacer par un appel API réel
    const mockProfile = {
      name: "Jean Dupont",
      email: "jean.dupont@example.com",
      avatar: "/images/avatar-placeholder.png"
    };
    setUserProfile(mockProfile);
  };

  // Navigation functions
  const navigateToLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      navigate('/login');
    }
  };
 
  const navigateToSignup = () => {
    if (onSignup) {
      onSignup();
    } else {
      navigate('/signup');
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserProfile(null);
    setRecentConversations([]);
    setShowDrawer(false);
    navigate('/');
  };
  
  const handleNewConversation = () => {
    setInputText('');
    setSelectedFile(null);
    // Logique pour créer une nouvelle conversation
  };
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Ajouter ici la logique pour traiter le fichier
    }
  };
  
  const handleSubmit = () => {
    // Logique pour traiter le texte saisi et/ou le fichier uploadé
    console.log("Texte soumis:", inputText);
    if (selectedFile) {
      console.log("Fichier soumis:", selectedFile.name);
    }
    
    // Rediriger en fonction du contexte
    if (!isAuthenticated) {
      // Si non authentifié, inciter à se connecter
      alert("Veuillez vous connecter pour continuer");
      navigateToLogin();
    } else {
      // Si authentifié, traiter la requête
      // Ici vous pourriez appeler votre API pour générer le contenu
      alert("Génération du contenu en cours...");
    }
  };
  
  const toggleDrawer = () => {
    setShowDrawer(!showDrawer);
  };
  
  // Composant pour le contenu utilisateur authentifié
  const AuthenticatedContent = () => (
    <>
      {/* Zone de saisie principale */}
      <div className="input-container">
        <textarea
          className="main-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          maxLength={500}
          placeholder="Entrez votre texte ici..."
        />
        <div className="input-actions">
          <div className="character-count">{inputText.length}/500</div>
          <label className="file-upload-label">
            <FaFileUpload className="upload-icon" />
            <span>Importer un fichier (TXT, PDF)</span>
            <input 
              type="file" 
              accept=".txt,.pdf" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }}
            />
          </label>
          {selectedFile && (
            <div className="selected-file">
              <FaFile /> {selectedFile.name}
              <button className="remove-file" onClick={() => setSelectedFile(null)}>
                <FaTimes />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Barre d'actions */}
      <div className="action-bar">
        <div className="language-selector">
          <button className="language-button">
            <img src="/images/us-flag.png" alt="US Flag" className="flag-icon" />
            <span>English</span>
            <FaChevronDown className="dropdown-icon" />
          </button>
        </div>
        
        <div className="generation-options">
          <h3>Générer du contenu</h3>
          <div className="action-buttons">
            <button className="action-button story-button">
              <FaBook className="icon" />
              <span>RÉCIT</span>
            </button>
            
            <button className="action-button podcast-button">
              <FaMicrophone className="icon" />
              <span>PODCAST</span>
            </button>
            
            <button className="action-button video-button">
              <FaVideo className="icon" />
              <span>VIDÉO</span>
            </button>
          </div>
        </div>
        
        <button className="submit-button" onClick={handleSubmit}>
          <FaPlay className="submit-icon" />
          <span>GÉNÉRER</span>
        </button>
      </div>
      
      {/* Zone de projets récents */}
      <div className="recent-projects-section">
        <h3 className="section-title">Vos projets récents</h3>
        <div className="projects-grid">
          {recentConversations.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-icon">
                {project.title.includes('podcast') ? <FaMicrophone /> : 
                 project.title.includes('vidéo') ? <FaVideo /> : <FaBook />}
              </div>
              <div className="project-details">
                <h4>{project.title}</h4>
                <p className="project-date">{project.date}</p>
                <p className="project-preview">{project.preview}</p>
              </div>
              <button className="project-action">Continuer</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
  
  // Composant pour le contenu utilisateur non authentifié
  const UnauthenticatedContent = () => (
    <>
      {/* Bannière principale */}
      <div className="welcome-banner">
        <div className="banner-content">
          <h2 className="banner-title">Transformez vos textes en médias avec l'IA</h2>
          <p className="banner-subtitle">Générez des récits, podcasts et vidéos à partir de simples textes</p>
          <div className="banner-cta">
            <button className="cta-button signup" onClick={navigateToSignup}>
              <FiUserPlus className="cta-icon" />
              COMMENCER GRATUITEMENT
            </button>
            <button className="cta-button login" onClick={navigateToLogin}>
              <FiLogIn className="cta-icon" />
              SE CONNECTER
            </button>
          </div>
        </div>
        <div className="banner-image">
          {/* Emplacement pour une image d'illustration */}
        </div>
      </div>
      
      {/* Fonctionnalités */}
      <div className="features-section">
        <h2 className="section-title">Nos fonctionnalités</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><FaBook /></div>
            <h3>Génération de récits</h3>
            <p>Transformez vos idées en histoires complètes avec différents styles narratifs.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FaMicrophone /></div>
            <h3>Création de podcasts</h3>
            <p>Convertissez vos textes en podcasts avec des voix naturelles et multiples narrateurs.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FaVideo /></div>
            <h3>Production vidéo</h3>
            <p>Générez des vidéos explicatives avec narration et animations basées sur votre contenu.</p>
          </div>
        </div>
      </div>
      
      {/* Démo limitée */}
      <div className="demo-section">
        <h2 className="section-title">Essayez notre démo</h2>
        <p className="demo-description">Testez nos fonctionnalités avec cette version limitée</p>
        <div className="demo-container">
          <div className="demo-input-container">
            <textarea
              className="demo-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={100}
              placeholder="Entrez un court texte d'exemple (limité à 100 caractères)..."
            />
            <div className="demo-input-actions">
              <div className="character-count">{inputText.length}/100</div>
            </div>
          </div>
          <div className="demo-options">
            <button className="demo-option-button">
              <FaBook className="demo-icon" />
              <span>Récit</span>
            </button>
            <button className="demo-option-button">
              <FaMicrophone className="demo-icon" />
              <span>Podcast</span>
            </button>
            <button className="demo-option-button">
              <FaVideo className="demo-icon" />
              <span>Vidéo</span>
            </button>
          </div>
          <button className="demo-submit-button" onClick={() => {
            if(inputText.trim().length === 0) {
              alert("Veuillez entrer du texte pour essayer la démo");
            } else {
              alert("Fonctionnalité limitée. Inscrivez-vous pour accéder à toutes les options!");
              navigateToSignup();
            }
          }}>
            <FaPlay className="demo-submit-icon" />
            <span>ESSAYER LA DÉMO</span>
          </button>
        </div>
      </div>
      
      {/* Comparaison des fonctionnalités */}
      <div className="pricing-section">
        <h2 className="section-title">Nos forfaits</h2>
        <div className="pricing-table">
          <div className="pricing-column demo">
            <div className="pricing-header">
              <h3>Démo</h3>
              <p className="price">Gratuit</p>
            </div>
            <ul className="pricing-features">
              <li><FaLock /> Limite de 100 caractères</li>
              <li><FaLock /> Qualité standard</li>
              <li><FaLock /> Sans sauvegarde</li>
              <li><FaLock /> Options limitées</li>
            </ul>
            <button className="pricing-cta demo" onClick={() => {
              document.querySelector('.demo-section').scrollIntoView({ behavior: 'smooth' });
            }}>Essayer maintenant</button>
          </div>
          <div className="pricing-column premium highlight">
            <div className="pricing-header">
              <h3>Premium</h3>
              <p className="price">19,99€ / mois</p>
            </div>
            <ul className="pricing-features">
              <li><FaUnlock /> Textes illimités</li>
              <li><FaUnlock /> Haute qualité</li>
              <li><FaUnlock /> Sauvegarde de projets</li>
              <li><FaUnlock /> Toutes les options</li>
              <li><FaUnlock /> Support prioritaire</li>
            </ul>
            <button className="pricing-cta premium" onClick={navigateToSignup}>S'inscrire</button>
          </div>
        </div>
      </div>
      
      {/* Call to action final */}
      <div className="final-cta-section">
        <h2>Prêt à transformer vos textes en contenu multimédia ?</h2>
        <p>Rejoignez des milliers d'utilisateurs qui créent du contenu professionnel en quelques clics</p>
        <button className="final-cta-button" onClick={navigateToSignup}>
          <FaRocket className="final-cta-icon" />
          COMMENCER MAINTENANT
        </button>
      </div>
    </>
  );
  
  // Rendu principal du composant
  return (
    <div className="home-page">
      {/* Bouton menu hamburger mobile - visible uniquement si authentifié */}
      {isAuthenticated && (
        <button className="mobile-menu-toggle" onClick={toggleDrawer}>
          {showDrawer ? <FaTimes /> : <FaBars />}
        </button>
      )}
      
      {/* Drawer gauche - visible uniquement si authentifié */}
      {isAuthenticated && (
        <div className={`drawer ${showDrawer ? 'drawer-open' : 'drawer-closed'}`}>
          {/* En-tête du drawer */}
          <div className="drawer-header">
            <h2>TTS Application</h2>
            <button className="new-conversation-button" onClick={handleNewConversation}>
              <FaPlus /> Nouvelle conversation
            </button>
          </div>
          
          {/* Conversations récentes */}
          <div className="recent-conversations">
            <h3><FaHistory /> Conversations récentes</h3>
            {recentConversations.length > 0 ? (
              <ul className="conversation-list">
                {recentConversations.map(conv => (
                  <li key={conv.id} className="conversation-item">
                    <div className="conversation-title">{conv.title}</div>
                    <div className="conversation-date">{conv.date}</div>
                    <div className="conversation-preview">{conv.preview}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-conversations">Aucune conversation récente</p>
            )}
          </div>
          
          {/* Profil utilisateur */}
          <div className="user-profile">
            {userProfile && (
              <>
                <div className="profile-avatar">
                  <img src={userProfile.avatar} alt="Avatar utilisateur" />
                </div>
                <div className="profile-info">
                  <div className="profile-name">{userProfile.name}</div>
                  <div className="profile-email">{userProfile.email}</div>
                </div>
                <div className="profile-actions">
                  <button className="profile-action-button" onClick={() => navigate('/profile')}>
                    <FaCog />
                  </button>
                  <button className="profile-action-button logout" onClick={handleLogout}>
                    <FiLogOut />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Contenu principal */}
      <div className={`main-content ${(showDrawer && isAuthenticated) ? 'with-drawer' : 'full-width'}`}>
        <div className="content-wrapper">
          {/* En-tête commun - BOUTONS SUPPRIMÉS */}
          <div className="app-header">
            <h1 className="app-title">Générateur de contenu audio et vidéo IA</h1>
            <p className="app-subtitle">Transformez vos textes en contenus médias professionnels</p>
          </div>
          
          {/* Contenu différent selon l'état d'authentification */}
          {isAuthenticated ? <AuthenticatedContent /> : <UnauthenticatedContent />}
          
          {/* Footer commun */}
          <div className="main-footer">
            <p>© 2025 TTS Application - Tous droits réservés</p>
            <div className="footer-links">
              <a href="/about">À propos</a>
              <a href="/contact">Contact</a>
              <a href="/privacy">Confidentialité</a>
              <a href="/terms">Conditions d'utilisation</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;