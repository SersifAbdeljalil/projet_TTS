// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tts_app',
};

// Fonction pour générer un token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'votre_clé_secrète_à_changer_en_production',
    { expiresIn: '7d' }
  );
};

// Route pour l'inscription
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validation des données
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Veuillez remplir tous les champs requis' 
      });
    }
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Vérifier si l'email existe déjà
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      await connection.end();
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà utilisé' 
      });
    }
    
    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insérer le nouvel utilisateur
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
      [name, email, hashedPassword]
    );
    
    await connection.end();
    
    res.status(201).json({
      success: true,
      message: 'Inscription réussie'
    });
    
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'inscription' 
    });
  }
});

// Route pour la connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation des données
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Veuillez remplir tous les champs requis' 
      });
    }
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Rechercher l'utilisateur par email
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    await connection.end();
    
    if (users.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }
    
    const user = users[0];
    
    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }
    
    // Générer un token JWT
    const token = generateToken(user);
    
    // Connecter l'utilisateur via passport
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur lors de la connexion' 
        });
      }
      
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    });
    
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la connexion' 
    });
  }
});

// NOUVELLE ROUTE: Récupérer les informations utilisateur après OAuth
router.get('/user', (req, res) => {
  // Vérifier si l'utilisateur est authentifié via session (Passport)
  if (req.isAuthenticated() && req.user) {
    console.log('Utilisateur authentifié via session:', req.user);
    
    // Générer un token JWT
    const token = generateToken(req.user);
    
    // Retourner les données utilisateur et le token
    return res.json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      },
      token: token
    });
  } else {
    console.log('Utilisateur non authentifié');
    return res.status(401).json({
      success: false,
      message: 'Utilisateur non authentifié'
    });
  }
});

// NOUVELLE ROUTE: Vérifier la validité d'un token JWT
router.get('/verify', async (req, res) => {
  // Récupérer le token depuis l'en-tête Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Aucun token fourni'
    });
  }
  
  const token = authHeader.substring(7);
  
  try {
    // Vérifier le token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'votre_clé_secrète_à_changer_en_production'
    );
    
    // Vérifier si l'utilisateur existe toujours en base de données
    const connection = await mysql.createConnection(dbConfig);
    
    const [users] = await connection.execute(
      'SELECT id, name, email FROM users WHERE id = ?',
      [decoded.id]
    );
    
    await connection.end();
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      user: users[0]
    });
    
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
});

module.exports = router;