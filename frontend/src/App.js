// frontend/src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import StoryPage from './components/StoryPage';
import PodcastPage from './components/PodcastPage';
import VideoPage from './components/VideoPage';
import AuthSuccess from './components/AuthSuccess'; // Importez le nouveau composant

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  
  const handleOpenLogin = () => {
    setShowLogin(true);
    setShowSignup(false);
  };
  
  const handleOpenSignup = () => {
    setShowSignup(true);
    setShowLogin(false);
  };
  
  const handleCloseModals = () => {
    setShowLogin(false);
    setShowSignup(false);
  };
  
  const handleSwitchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };
  
  const handleSwitchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };
  
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HomePage onLogin={handleOpenLogin} onSignup={handleOpenSignup} />
                {showLogin && (
                  <Login
                    onClose={handleCloseModals}
                    onSwitchToSignup={handleSwitchToSignup}
                  />
                )}
                {showSignup && (
                  <Signup
                    onClose={handleCloseModals}
                    onSwitchToLogin={handleSwitchToLogin}
                  />
                )}
              </>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/story" element={<StoryPage />} />
          <Route path="/podcast" element={<PodcastPage />} />
          <Route path="/video" element={<VideoPage />} />
          <Route path="/auth-success" element={<AuthSuccess />} /> {/* Nouvelle route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;