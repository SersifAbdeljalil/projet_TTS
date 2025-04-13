// frontend/src/components/HomePage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Homepage.css';
import { FaBook, FaMicrophone, FaVideo, FaPlay, FaChevronDown } from 'react-icons/fa';
import { FiLogIn, FiUserPlus } from 'react-icons/fi';

function HomePage({ onLogin, onSignup }) {
  const [inputText, setInputText] = useState('m');
  const navigate = useNavigate();
  
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
  
  const navigateToStory = () => {
    navigate('/story');
  };
  
  const navigateToPodcast = () => {
    navigate('/podcast');
  };
  
  const navigateToVideo = () => {
    navigate('/video');
  };
 
  return (
    <div className="home-container">
      <div className="input-container">
        <textarea
          className="main-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          maxLength={500}
          placeholder="Entrez votre texte ici..."
        />
        <div className="character-count">{inputText.length}/500</div>
      </div>
     
      <div className="divider"></div>
     
      <div className="buttons-container">
        <div className="language-selector">
          <button className="language-button">
            <img src="/images/us-flag.png" alt="US Flag" className="flag-icon" />
            <FaChevronDown className="dropdown-icon" />
          </button>
        </div>
       
        <div className="action-buttons">
          <button className="action-button" onClick={navigateToStory}>
            <FaBook className="icon" />
            TELL A STORY
          </button>
         
          <button className="action-button" onClick={navigateToPodcast}>
            <FaMicrophone className="icon" />
            INTRODUCE A PODCAST
          </button>
         
          <button className="action-button" onClick={navigateToVideo}>
            <FaVideo className="icon" />
            CREATE A VIDEO
          </button>
        </div>
       
        <button className="submit-button">
          <FaPlay className="submit-icon" />
        </button>
      </div>
     
      <div className="auth-buttons">
        <button className="login-button" onClick={navigateToLogin}>
          <FiLogIn className="auth-icon" />
          LOGIN
        </button>
        <button className="signup-button" onClick={navigateToSignup}>
          <FiUserPlus className="auth-icon" />
          SIGNUP
        </button>
      </div>
    </div>
  );
}

export default HomePage;