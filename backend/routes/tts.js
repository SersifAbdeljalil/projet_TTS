const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tts_app',
};

// Route pour créer un nouveau projet TTS
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { title, text_content, voice_settings } = req.body;
    const userId = req.userData.id;

    const connection = await mysql.createConnection(dbConfig);

    // Générer un identifiant unique pour le fichier audio
    const audioFileName = `${uuidv4()}.mp3`;
    const audioFilePath = path.join(__dirname, '../uploads', audioFileName);

    // Insérer les données du projet dans la base de données
    const [result] = await connection.execute(
      'INSERT INTO tts_data (user_id, title, text_content, audio_path, voice_settings, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [userId, title, text_content, audioFilePath, JSON.stringify(voice_settings)]
    );

    await connection.end();

    // TODO: Implémenter la génération réelle du fichier audio
    // Pour l'instant, on crée un fichier vide comme placeholder
    await fs.writeFile(audioFilePath, 'Fichier audio placeholder');

    res.status(201).json({
      success: true,
      message: 'Projet créé avec succès',
      project: {
        id: result.insertId,
        title,
        audioPath: audioFileName
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du projet TTS:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création du projet' 
    });
  }
});

// Route pour récupérer les projets de l'utilisateur
router.get('/projects', authMiddleware, async (req, res) => {
  try {
    const userId = req.userData.id;
    const connection = await mysql.createConnection(dbConfig);

    // Récupérer les projets de l'utilisateur
    const [projects] = await connection.execute(
      'SELECT id, title, text_content, audio_path, voice_settings, created_at FROM tts_data WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    await connection.end();

    res.json({
      success: true,
      projects: projects.map(project => ({
        ...project,
        voice_settings: JSON.parse(project.voice_settings)
      }))
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des projets' 
    });
  }
});

// Route pour télécharger un projet
router.get('/download/:projectId', authMiddleware, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const userId = req.userData.id;
    const connection = await mysql.createConnection(dbConfig);

    // Vérifier que le projet appartient bien à l'utilisateur
    const [projects] = await connection.execute(
      'SELECT * FROM tts_data WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );

    await connection.end();

    if (projects.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Projet non trouvé' 
      });
    }

    const project = projects[0];
    
    // Envoyer le fichier audio
    res.download(project.audio_path, `${project.title}.mp3`, (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement:', err);
        res.status(500).json({ 
          success: false, 
          message: 'Erreur lors du téléchargement du fichier' 
        });
      }
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement du projet:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du téléchargement du projet' 
    });
  }
});

// Route pour supprimer un projet
router.delete('/project/:projectId', authMiddleware, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const userId = req.userData.id;
    const connection = await mysql.createConnection(dbConfig);

    // Récupérer le projet pour obtenir le chemin du fichier audio
    const [projects] = await connection.execute(
      'SELECT audio_path FROM tts_data WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (projects.length === 0) {
      await connection.end();
      return res.status(404).json({ 
        success: false, 
        message: 'Projet non trouvé' 
      });
    }

    // Supprimer le projet de la base de données
    await connection.execute(
      'DELETE FROM tts_data WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );

    await connection.end();

    // Supprimer le fichier audio
    try {
      await fs.unlink(projects[0].audio_path);
    } catch (fileError) {
      console.warn('Impossible de supprimer le fichier audio:', fileError);
    }

    res.json({ 
      success: true, 
      message: 'Projet supprimé avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la suppression du projet' 
    });
  }
});

module.exports = router;