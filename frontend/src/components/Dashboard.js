// frontend/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Dashboard.css';
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
  FaSpinner
} from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';

function Dashboard() {
  const [inputText, setInputText] = useState('');
  const [showDrawer, setShowDrawer] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [recentProjects, setRecentProjects] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('text'); // 'text' ou 'history'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectsFilter, setProjectsFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  
  // Vérifier si l'utilisateur est connecté et charger ses données
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Rediriger vers la page de connexion si non authentifié
      navigate('/login');
      return;
    }
    
    // Récupérer le profil de l'utilisateur et ses projets
    fetchUserData(token);
    
    // Gérer le redimensionnement de la fenêtre
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setShowDrawer(width > 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); 
  
  // Fonction pour récupérer les données de l'utilisateur
  const fetchUserData = async (token) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Récupération du profil utilisateur
      const profileResponse = await fetch('http://localhost:5000/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!profileResponse.ok) {
        throw new Error('Erreur lors de la récupération du profil');
      }
      
      const profileData = await profileResponse.json();
      setUserProfile(profileData.user);
      
      // Récupération des projets récents
      const projectsResponse = await fetch('http://localhost:5000/api/tts/projects', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!projectsResponse.ok) {
        throw new Error('Erreur lors de la récupération des projets');
      }
      
      const projectsData = await projectsResponse.json();
      
      // Formater les projets pour l'affichage
      const formattedProjects = projectsData.projects.map(project => ({
        id: project.id,
        title: project.title,
        date: new Date(project.created_at).toLocaleDateString('fr-FR'),
        preview: project.text_content.substring(0, 100) + '...',
        type: determineProjectType(project.title),
        content: project.text_content,
        voiceSettings: project.voice_settings ? JSON.parse(project.voice_settings) : null
      }));
      
      setRecentProjects(formattedProjects);
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.message);
      
      // Si une erreur d'authentification survient, rediriger vers la connexion
      if (error.message.includes('non autorisé') || error.message.includes('token')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Déterminer le type de projet en fonction du titre
  const determineProjectType = (title) => {
    title = title.toLowerCase();
    if (title.includes('podcast')) return 'podcast';
    if (title.includes('vidéo') || title.includes('video')) return 'video';
    return 'story'; // Par défaut, c'est un récit
  };
  
  // Filtre des projets en fonction du terme de recherche et du filtre
  const filteredProjects = recentProjects.filter(project => {
    // Filtre par type
    if (projectsFilter !== 'all' && project.type !== projectsFilter) {
      return false;
    }
    
    // Filtre par terme de recherche
    if (searchTerm && !project.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Appel au backend pour déconnecter la session
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Supprimer le token côté client
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Rediriger vers la page d'accueil
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Même en cas d'erreur, nettoyer le localStorage et rediriger
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };
  
  const handleNewConversation = () => {
    setInputText('');
    setSelectedFile(null);
    setActiveTab('text');
  };
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Lecture du fichier si c'est un fichier texte
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setInputText(e.target.result);
        };
        reader.readAsText(file);
      }
    }
  };
  
  const handleSubmit = async () => {
    if (inputText.trim() === '' && !selectedFile) {
      alert("Veuillez entrer du texte ou importer un fichier.");
      return;
    }
    
    // Créer un titre par défaut basé sur le contenu
    const defaultTitle = inputText.split('\n')[0].substring(0, 50) || "Nouveau projet";
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tts/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: defaultTitle,
          text_content: inputText,
          voice_settings: JSON.stringify({
            type: document.querySelector('.content-type-button.active')?.getAttribute('data-type') || 'story',
            language: document.querySelector('.language-selector').value,
            voice: document.querySelector('.voice-selector').value,
            quality: document.querySelector('.quality-selector').value
          })
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création du projet');
      }
      
      const data = await response.json();
      
      alert("Projet créé avec succès!");
      
      // Actualiser la liste des projets
      fetchUserData(token);
      
      // Réinitialiser le formulaire
      setInputText('');
      setSelectedFile(null);
      
      // Optionnel: rediriger vers le projet créé
      // navigate(`/project/${data.project.id}`);
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      alert(`Erreur: ${error.message}`);
    }
  };
  
  const toggleDrawer = () => {
    setShowDrawer(!showDrawer);
  };
  
  const openProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };
  
  // Fonction pour définir le type de contenu actif
  const setActiveContentType = (e) => {
    // Supprimer la classe active de tous les boutons
    document.querySelectorAll('.content-type-button').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Ajouter la classe active au bouton cliqué
    e.currentTarget.classList.add('active');
  };
  
  // Si les données sont en cours de chargement
  if (isLoading) {
    return (
      <div className="loading-container">
        <FaSpinner className="loading-spinner" />
        <p>Chargement de votre tableau de bord...</p>
      </div>
    );
  }
  
  // Si une erreur est survenue
  if (error) {
    return (
      <div className="error-container">
        <h2>Une erreur est survenue</h2>
        <p>{error}</p>
        <button onClick={() => fetchUserData(localStorage.getItem('token'))}>Réessayer</button>
        <button onClick={() => navigate('/')}>Retour à l'accueil</button>
      </div>
    );
  }
  
  return (
    <div className="dashboard-page">
      {/* Bouton menu hamburger mobile */}
      <button className="mobile-menu-toggle" onClick={toggleDrawer} aria-label="Toggle menu">
        {showDrawer ? <FaTimes /> : <FaBars />}
      </button>
      
      {/* Drawer latéral */}
      <div className={`drawer ${showDrawer ? 'drawer-open' : 'drawer-closed'}`}>
        {/* En-tête du drawer */}
        <div className="drawer-header">
          <h2>TTS Application</h2>
          <button className="new-conversation-button" onClick={handleNewConversation}>
            <FaPlus /> Nouvelle conversation
          </button>
        </div>
        
        {/* Historique des projets */}
        <div className="conversation-history">
          <h3><FaHistory /> Historique</h3>
          {recentProjects.length > 0 ? (
            <ul className="conversation-list">
              {recentProjects.map(project => (
                <li 
                  key={project.id} 
                  className="conversation-item"
                  onClick={() => openProject(project.id)}
                >
                  <div className="conversation-icon">
                    {project.type === 'podcast' ? <FaMicrophone /> :
                     project.type === 'video' ? <FaVideo /> : <FaBook />}
                  </div>
                  <div className="conversation-details">
                    <div className="conversation-title">{project.title}</div>
                    <div className="conversation-date">{project.date}</div>
                    <div className="conversation-preview">{project.preview}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-conversations">Aucun projet</p>
          )}
        </div>
        
        {/* Profil utilisateur */}
        <div className="user-profile">
          {userProfile && (
            <>
              <div className="profile-avatar">
                <img 
                  src={userProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=random&color=fff`} 
                  alt="Avatar utilisateur" 
                />
              </div>
              <div className="profile-info">
                <div className="profile-name">{userProfile.name}</div>
                <div className="profile-email">{userProfile.email}</div>
                <div className="profile-plan">{userProfile.plan || "Free"}</div>
              </div>
              <div className="profile-actions">
                <button className="profile-action-button" onClick={() => navigate('/profile')} aria-label="Settings">
                  <FaCog />
                </button>
                <button className="profile-action-button logout" onClick={handleLogout} aria-label="Logout">
                  <FiLogOut />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className={`main-content ${showDrawer ? 'with-drawer' : 'full-width'}`}>
        <div className="dashboard-header">
          <h1>Tableau de bord</h1>
          <div className="dashboard-tabs">
            <button 
              className={`tab-button ${activeTab === 'text' ? 'active' : ''}`}
              onClick={() => setActiveTab('text')}
            >
              Générateur de contenu
            </button>
            <button 
              className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Mes projets
            </button>
          </div>
        </div>
        
        {activeTab === 'text' ? (
          <div className="content-generator">
            {/* Zone de saisie de texte */}
            <div className="input-container">
              <textarea
                className="main-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Entrez votre texte ici ou importez un fichier..."
                aria-label="Zone de texte pour la génération de contenu"
              />
              <div className="input-actions">
                <div className="character-count">{inputText.length} caractères</div>
                <label className="file-upload-label">
                  <FaFileUpload className="upload-icon" />
                  <span>Importer un fichier (TXT, PDF)</span>
                  <input 
                    type="file" 
                    accept=".txt,.pdf" 
                    onChange={handleFileUpload} 
                    style={{ display: 'none' }}
                    aria-label="Importer un fichier texte ou PDF"
                  />
                </label>
                {selectedFile && (
                  <div className="selected-file">
                    <FaFile /> {selectedFile.name}
                    <button 
                      className="remove-file" 
                      onClick={() => setSelectedFile(null)}
                      aria-label="Supprimer le fichier"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Options de génération */}
            <div className="generation-options">
              <h3>Type de contenu à générer</h3>
              <div className="content-type-buttons">
                <button 
                  className="content-type-button active" 
                  data-type="story"
                  onClick={setActiveContentType}
                >
                  <FaBook className="icon" />
                  <span>RÉCIT</span>
                </button>
                
                <button 
                  className="content-type-button" 
                  data-type="podcast"
                  onClick={setActiveContentType}
                >
                  <FaMicrophone className="icon" />
                  <span>PODCAST</span>
                </button>
                
                <button 
                  className="content-type-button" 
                  data-type="video"
                  onClick={setActiveContentType}
                >
                  <FaVideo className="icon" />
                  <span>VIDÉO</span>
                </button>
              </div>
              
              <div className="option-selectors">
                <div className="option-group">
                  <label htmlFor="language-selector">Langue</label>
                  <select id="language-selector" className="language-selector" aria-label="Sélection de langue">
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                    <option value="es">Espagnol</option>
                    <option value="de">Allemand</option>
                  </select>
                </div>
                
                <div className="option-group">
                  <label htmlFor="voice-selector">Voix</label>
                  <select id="voice-selector" className="voice-selector" aria-label="Sélection de voix">
                    <option value="female1">Femme - Standard</option>
                    <option value="female2">Femme - Professionnelle</option>
                    <option value="male1">Homme - Standard</option>
                    <option value="male2">Homme - Professionnel</option>
                  </select>
                </div>
                
                <div className="option-group">
                  <label htmlFor="quality-selector">Qualité</label>
                  <select id="quality-selector" className="quality-selector" aria-label="Sélection de qualité">
                    <option value="standard">Standard</option>
                    <option value="high">Haute</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>
              
              <button className="generate-button" onClick={handleSubmit}>
                <FaRocket className="generate-icon" />
                <span>GÉNÉRER LE CONTENU</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="projects-section">
            <h2>Mes projets</h2>
            
            <div className="projects-filters">
              <select 
                className="filter-dropdown" 
                value={projectsFilter}
                onChange={(e) => setProjectsFilter(e.target.value)}
                aria-label="Filtrer par type de projet"
              >
                <option value="all">Tous les types</option>
                <option value="story">Récits</option>
                <option value="podcast">Podcasts</option>
                <option value="video">Vidéos</option>
              </select>
              
              <div className="search-box">
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Rechercher un projet"
                />
              </div>
            </div>
            
            {filteredProjects.length > 0 ? (
              <div className="projects-grid">
                {filteredProjects.map(project => (
                  <div key={project.id} className="project-card">
                    <div className="project-icon">
                      {project.type === 'podcast' ? <FaMicrophone /> : 
                       project.type === 'video' ? <FaVideo /> : <FaBook />}
                    </div>
                    <div className="project-details">
                      <h4>{project.title}</h4>
                      <p className="project-date">{project.date}</p>
                      <p className="project-preview">{project.preview}</p>
                    </div>
                    <div className="project-actions">
                      <button 
                        className="project-action-button"
                        onClick={() => openProject(project.id)}
                      >
                        Modifier
                      </button>
                      <button 
                        className="project-action-button"
                        onClick={() => window.open(`http://localhost:5000/api/tts/download/${project.id}`, '_blank')}
                      >
                        Télécharger
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-projects-message">
                <p>Aucun projet ne correspond aux critères de recherche.</p>
                {recentProjects.length > 0 && (
                  <button 
                    onClick={() => {
                      setProjectsFilter('all');
                      setSearchTerm('');
                    }}
                  >
                    Voir tous les projets
                  </button>
                )}
              </div>
            )}
            
            {recentProjects.length === 0 && (
              <div className="empty-projects">
                <p>Vous n'avez pas encore de projets.</p>
                <button 
                  className="create-first-project"
                  onClick={() => setActiveTab('text')}
                >
                  Créer votre premier projet
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;