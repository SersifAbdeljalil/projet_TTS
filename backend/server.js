// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const passport = require('passport');
const dotenv = require('dotenv');

// Stratégies d'authentification
require('./config/passport-setup');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tts_app',
};

// Créer le store pour les sessions
const sessionStore = new MySQLStore(dbConfig);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true // Pour permettre les cookies avec CORS
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration de la session
app.use(session({
  key: 'tts_session',
  secret: process.env.SESSION_SECRET || 'votre_clé_secrète_session',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

// Initialiser Passport
app.use(passport.initialize());
app.use(passport.session());

// Connexion à la base de données
const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données MySQL:', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

// Routes
const authRoutes = require('./routes/auth');
const socialAuthRoutes = require('./routes/social-auth');

// Utiliser les routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', socialAuthRoutes);

// Route pour tester l'API
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API de l\'application TTS' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});

module.exports = app;