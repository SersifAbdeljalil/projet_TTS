// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Middleware pour vérifier le token JWT
module.exports = (req, res, next) => {
  try {
    // Obtenir le token d'en-tête
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Accès non autorisé. Token manquant' 
      });
    }
    
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_clé_secrète_jwt');
    
    // Ajouter les données utilisateur à la requête
    req.userData = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Accès non autorisé. Token invalide' 
    });
  }
};