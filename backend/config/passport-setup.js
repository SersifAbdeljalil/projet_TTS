const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tts_app',
};

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT id, name, email FROM users WHERE id = ?',
      [id]
    );
    await connection.end();
    
    if (rows.length > 0) {
      done(null, rows[0]);
    } else {
      done(new Error('Utilisateur non trouvé'), null);
    }
  } catch (error) {
    done(error, null);
  }
});

// Stratégie Google corrigée
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    proxy: true,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google profile:', profile);
      
      if (!profile || !profile.emails || !profile.emails[0]) {
        return done(null, false, { message: 'Email non fourni par Google' });
      }

      const connection = await mysql.createConnection(dbConfig);
      const email = profile.emails[0].value;

      // Vérifier si l'utilisateur existe avec ce google_id
      const [existingByGoogleId] = await connection.execute(
        'SELECT * FROM users WHERE google_id = ?',
        [profile.id]
      );
      
      if (existingByGoogleId.length > 0) {
        await connection.end();
        return done(null, existingByGoogleId[0]);
      }

      // Vérifier si l'email existe déjà
      const [existingByEmail] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      if (existingByEmail.length > 0) {
        await connection.execute(
          'UPDATE users SET google_id = ? WHERE id = ?',
          [profile.id, existingByEmail[0].id]
        );
        const updatedUser = { ...existingByEmail[0], google_id: profile.id };
        await connection.end();
        return done(null, updatedUser);
      }

      // Créer un nouvel utilisateur
      const [result] = await connection.execute(
        'INSERT INTO users (name, email, google_id, created_at) VALUES (?, ?, ?, NOW())',
        [profile.displayName, email, profile.id]
      );
      
      const newUser = {
        id: result.insertId,
        name: profile.displayName,
        email: email,
        google_id: profile.id
      };
      
      await connection.end();
      return done(null, newUser);
    } catch (error) {
      console.error('Erreur Google OAuth:', error);
      return done(error, null);
    }
  }
));

// Stratégie Facebook corrigée
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'emails'],
      proxy: true,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log('Facebook profile:', profile);
        
        if (!profile || !profile.emails || !profile.emails[0]) {
          return done(null, false, { message: 'Email non fourni par Facebook' });
        }

        const connection = await mysql.createConnection(dbConfig);
        const email = profile.emails[0].value;

        // Vérifier si l'utilisateur existe avec ce facebook_id
        const [existingByFacebookId] = await connection.execute(
          'SELECT * FROM users WHERE facebook_id = ?',
          [profile.id]
        );
        
        if (existingByFacebookId.length > 0) {
          await connection.end();
          return done(null, existingByFacebookId[0]);
        }

        // Vérifier si l'email existe déjà
        const [existingByEmail] = await connection.execute(
          'SELECT * FROM users WHERE email = ?',
          [email]
        );
        
        if (existingByEmail.length > 0) {
          await connection.execute(
            'UPDATE users SET facebook_id = ? WHERE id = ?',
            [profile.id, existingByEmail[0].id]
          );
          const updatedUser = { ...existingByEmail[0], facebook_id: profile.id };
          await connection.end();
          return done(null, updatedUser);
        }

        // Créer un nouvel utilisateur
        const [result] = await connection.execute(
          'INSERT INTO users (name, email, facebook_id, created_at) VALUES (?, ?, ?, NOW())',
          [profile.displayName, email, profile.id]
        );
        
        const newUser = {
          id: result.insertId,
          name: profile.displayName,
          email: email,
          facebook_id: profile.id
        };
        
        await connection.end();
        return done(null, newUser);
      } catch (error) {
        console.error('Erreur Facebook OAuth:', error);
        return done(error, null);
      }
    }
  )
);