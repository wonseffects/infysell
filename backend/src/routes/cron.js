const express = require('express');
const router = express.Router();
const { processAllCampaigns } = require('../services/schedulerService');

// GET /api/cron/process
// No futuro, adicionar um CRON_SECRET no .env para segurança
router.get('/process', async (req, res) => {
  try {
    console.log('Cron trigger received via API');
    
    // Opcional: Verificar chave secreta
    const authHeader = req.headers['authorization'];
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    await processAllCampaigns();
    
    res.json({ 
        status: 'success', 
        message: 'Campaign processing triggered',
        timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Cron Route Error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
