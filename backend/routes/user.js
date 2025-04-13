const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tts_app',
};

// Route pour récupérer le profil utilisateur
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.userData.id;
    const connection = await mysql.createConnection(dbConfig);

    // Récupérer les informations de l'utilisateur
    const [users] = await connection.execute(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [userId]
    );

    // Récupérer les paramètres utilisateur
    const [settings] = await connection.execute(
      'SELECT default_voice, default_speed, default_pitch, theme FROM user_settings WHERE user_id = ?',
      [userId]
    );

    await connection.end();

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    const user = users[0];
    const userSettings = settings.length > 0 ? settings[0] : null;

    res.json({
      success: true,
      user: {
        ...user,
        created_at: user.created_at,
        settings: userSettings
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération du profil' 
    });
  }
});

// Route pour mettre à jour le profil utilisateur
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.userData.id;
    const { name, email } = req.body;

    const connection = await mysql.createConnection(dbConfig);

    // Mettre à jour les informations de base de l'utilisateur
    await connection.execute(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, userId]
    );

    // Mettre à jour ou insérer les paramètres utilisateur
    const { default_voice, default_speed, default_pitch, theme } = req.body.settings || {};

    const [existingSettings] = await connection.execute(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [userId]
    );

    if (existingSettings.length > 0) {
      // Mettre à jour les paramètres existants
      await connection.execute(
        'UPDATE user_settings SET default_voice = ?, default_speed = ?, default_pitch = ?, theme = ? WHERE user_id = ?',
        [default_voice, default_speed, default_pitch, theme, userId]
       
      );
    } else {
      // Insérer de nouveaux paramètres
      await connection.execute(
        'INSERT INTO user_settings (user_id, default_voice, default_speed, default_pitch, theme, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [userId, default_voice, default_speed, default_pitch, theme]
      );
    }

    await connection.end();

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour du profil' 
    });
  }
});

// Route pour changer le mot de passe
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const userId = req.userData.id;
    const { current_password, new_password } = req.body;

    // Validation des données
    if (!current_password || !new_password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Veuillez fournir le mot de passe actuel et le nouveau mot de passe' 
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Récupérer le mot de passe actuel de l'utilisateur
    const [users] = await connection.execute(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      await connection.end();
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    // Vérifier le mot de passe actuel
    const isMatch = await bcrypt.compare(current_password, users[0].password);

    if (!isMatch) {
      await connection.end();
      return res.status(400).json({ 
        success: false, 
        message: 'Le mot de passe actuel est incorrect' 
      });
    }

    // Hacher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(new_password, salt);

    // Mettre à jour le mot de passe
    await connection.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedNewPassword, userId]
    );

    await connection.end();

    res.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du changement de mot de passe' 
    });
  }
});

module.exports = router;