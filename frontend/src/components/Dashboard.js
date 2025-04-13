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
  FaRocket
} from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';

function Dashboard() {
  const [inputText, setInputText] = useState('');
  const [showDrawer, setShowDrawer] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [recentConversations, setRecentConversations] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('text'); // 'text' ou 'history'
  const navigate = useNavigate();
  
  // Vérifier si l'utilisateur est connecté lors du chargement du composant
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Rediriger vers la page de connexion si non authentifié
      navigate('/login');
      return;
    }
    
    // Charger les conversations récentes et le profil utilisateur
    fetchRecentConversations();
    fetchUserProfile();
    
    // Gérer le redimensionnement de la fenêtre
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setShowDrawer(width > 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); 
  
  // Récupération des conversations récentes
  const fetchRecentConversations = () => {
    // À remplacer par un appel API réel
    const mockConversations = [
      { id: 1, title: "Présentation produit", date: "2025-04-12", preview: "Vidéo présentant notre nouveau produit..." },
      { id: 2, title: "Podcast sur l'IA", date: "2025-04-10", preview: "Discussion sur les avancées de l'IA..." },
      { id: 3, title: "Histoire pour enfants", date: "2025-04-08", preview: "Il était une fois un petit dragon..." },
      { id: 4, title: "Tutoriel technique", date: "2025-04-05", preview: "Comment configurer votre environnement..." },
      { id: 5, title: "Résumé de réunion", date: "2025-04-03", preview: "Points clés discutés lors de la réunion..." },
    ];
    setRecentConversations(mockConversations);
  };
  
  // Récupération du profil utilisateur
  const fetchUserProfile = () => {
    // À remplacer par un appel API réel
    const mockProfile = {
      name: "Jean Dupont",
      email: "jean.dupont@example.com",
      avatar: "/images/avatar-placeholder.png",
      plan: "Premium"
    };
    setUserProfile(mockProfile);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };
  
  const handleNewConversation = () => {
    setInputText('');
    setSelectedFile(null);
    setActiveTab('text');
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
    if (inputText.trim() === '' && !selectedFile) {
      alert("Veuillez entrer du texte ou importer un fichier.");
      return;
    }
    
    // Logique pour traiter le texte saisi et/ou le fichier uploadé
    console.log("Texte soumis:", inputText);
    if (selectedFile) {
      console.log("Fichier soumis:", selectedFile.name);
    }
    
    alert("Génération du contenu en cours...");
    // Ici, vous appelleriez votre API pour générer le contenu
  };
  
  const toggleDrawer = () => {
    setShowDrawer(!showDrawer);
  };
  
  const openConversation = (conversationId) => {
    console.log("Ouverture de la conversation:", conversationId);
    // Logique pour charger une conversation
    setActiveTab('text');
  };
  
  return (
    <div className="dashboard-page">
      {/* Bouton menu hamburger mobile */}
      <button className="mobile-menu-toggle" onClick={toggleDrawer}>
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
        
        {/* Historique des conversations */}
        <div className="conversation-history">
          <h3><FaHistory /> Historique</h3>
          {recentConversations.length > 0 ? (
            <ul className="conversation-list">
              {recentConversations.map(conv => (
                <li 
                  key={conv.id} 
                  className="conversation-item"
                  onClick={() => openConversation(conv.id)}
                >
                  <div className="conversation-icon">
                    {conv.title.includes('Podcast') ? <FaMicrophone /> :
                     conv.title.includes('Vidéo') ? <FaVideo /> : <FaBook />}
                  </div>
                  <div className="conversation-details">
                    <div className="conversation-title">{conv.title}</div>
                    <div className="conversation-date">{conv.date}</div>
                    <div className="conversation-preview">{conv.preview}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-conversations">Aucune conversation</p>
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
                <div className="profile-plan">{userProfile.plan}</div>
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
            
            {/* Options de génération */}
            <div className="generation-options">
              <h3>Type de contenu à générer</h3>
              <div className="content-type-buttons">
                <button className="content-type-button">
                  <FaBook className="icon" />
                  <span>RÉCIT</span>
                </button>
                
                <button className="content-type-button">
                  <FaMicrophone className="icon" />
                  <span>PODCAST</span>
                </button>
                
                <button className="content-type-button">
                  <FaVideo className="icon" />
                  <span>VIDÉO</span>
                </button>
              </div>
              
              <div className="option-selectors">
                <div className="option-group">
                  <label>Langue</label>
                  <select className="language-selector">
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                    <option value="es">Espagnol</option>
                    <option value="de">Allemand</option>
                  </select>
                </div>
                
                <div className="option-group">
                  <label>Voix</label>
                  <select className="voice-selector">
                    <option value="female1">Femme - Standard</option>
                    <option value="female2">Femme - Professionnelle</option>
                    <option value="male1">Homme - Standard</option>
                    <option value="male2">Homme - Professionnel</option>
                  </select>
                </div>
                
                <div className="option-group">
                  <label>Qualité</label>
                  <select className="quality-selector">
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
            <h2>Mes projets récents</h2>
            
            <div className="projects-filters">
              <select className="filter-dropdown">
                <option value="all">Tous les types</option>
                <option value="story">Récits</option>
                <option value="podcast">Podcasts</option>
                <option value="video">Vidéos</option>
              </select>
              
              <div className="search-box">
                <input type="text" placeholder="Rechercher..." />
              </div>
            </div>
            
            <div className="projects-grid">
              {recentConversations.map(project => (
                <div key={project.id} className="project-card">
                  <div className="project-icon">
                    {project.title.includes('Podcast') ? <FaMicrophone /> : 
                     project.title.includes('Vidéo') ? <FaVideo /> : <FaBook />}
                  </div>
                  <div className="project-details">
                    <h4>{project.title}</h4>
                    <p className="project-date">{project.date}</p>
                    <p className="project-preview">{project.preview}</p>
                  </div>
                  <div className="project-actions">
                    <button className="project-action-button">Modifier</button>
                    <button className="project-action-button">Télécharger</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;