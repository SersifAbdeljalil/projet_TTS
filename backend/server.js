const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const passport = require('passport');
const dotenv = require('dotenv');
const path = require('path');

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

// Middleware CORS amélioré
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true, // Important pour les cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
    // En production avec HTTPS, ajoutez:
    // secure: process.env.NODE_ENV === 'production',
    // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Initialiser Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware de débogage des sessions
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Authentifié?', req.isAuthenticated());
  if (req.user) {
    console.log('Utilisateur:', {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
  next();
});

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
const ttsRoutes = require('./routes/tts');
const userRoutes = require('./routes/user');

// L'ordre est important - routes spécifiques d'abord
app.use('/api/auth', socialAuthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/user', userRoutes);

// Gestion des fichiers statiques pour les fichiers audio/uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route pour tester l'API
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API de l\'application TTS' });
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Une erreur serveur est survenue',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// Démarrer le serveur
const server = app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});

module.exports = { app, server };