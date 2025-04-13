// backend/routes/social-auth.js
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

// Callback Google - MODIFIÉ pour rediriger vers auth-success
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    // Modification importante ici
    successRedirect: process.env.CLIENT_URL + '/auth-success' || 'http://localhost:3000/auth-success',
    failureFlash: true
  })
);

// Route pour l'authentification Facebook
router.get('/facebook',
  passport.authenticate('facebook', {
    scope: ['email'],
    authType: 'reauthenticate' // Force la ré-authentification
  })
);

// Callback Facebook - MODIFIÉ pour rediriger vers auth-success
router.get('/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/login',
    // Modification importante ici
    successRedirect: 'http://localhost:3000/auth-success',
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