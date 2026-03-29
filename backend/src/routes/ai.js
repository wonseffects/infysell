const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const groqService = require('../services/groqService');
const Campaign = require('../models/Campaign');

// POST /api/ai/generate-emails
router.post('/generate-emails', authMiddleware, async (req, res) => {
  try {
    const { objective, offerLink, niche, campaignId } = req.body;
    
    if (!objective || !offerLink) {
      return res.status(400).json({ message: 'Objective and Offer Link are required' });
    }

    if (!req.user.groqKeyEncrypted) {
      return res.status(400).json({ message: 'Groq API Key not configured' });
    }

    // Generate 5 emails using Groq
    const emails = await groqService.generateCampaignEmails(req.user, objective, offerLink, niche);

    if (campaignId) {
      await Campaign.findByIdAndUpdate(campaignId, { emails });
    }

    res.json({ emails });
  } catch (err) {
    console.error('AI Generation Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/config-key
router.post('/config-key', authMiddleware, async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) return res.status(400).json({ message: 'API Key is required' });

    const CryptoJS = require('crypto-js');
    const groqKeyEncrypted = CryptoJS.AES.encrypt(apiKey, process.env.ENCRYPTION_KEY).toString();

    req.user.groqKeyEncrypted = groqKeyEncrypted;
    await req.user.save();

    res.json({ message: 'Groq API Key saved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
