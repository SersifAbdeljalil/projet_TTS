const express = require('express');
const router = express.Router();
const passport = require('passport');

// Route pour l'authentification Google
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account' // Force la sélection du compte à chaque fois
  })
);

// Callback Google
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login',
    successRedirect: process.env.CLIENT_URL || 'http://localhost:3000',
    failureFlash: true // Active les messages flash pour les erreurs
  })
);

// Route pour l'authentification Facebook
router.get('/facebook',
  passport.authenticate('facebook', { 
    scope: ['email'],
    authType: 'reauthenticate' // Force la ré-authentification
  })
);

// Callback Facebook
router.get('/facebook/callback',
  passport.authenticate('facebook', { 
    failureRedirect: '/login',
    successRedirect: process.env.CLIENT_URL || 'http://localhost:3000',
    failureFlash: true
  })
);

// Route de déconnexion
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
    }
    res.redirect(process.env.CLIENT_URL || 'http://localhost:3000');
  });
});

module.exports = router;