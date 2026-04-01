const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const scraperService = require('../services/scraperService');
const Lead = require('../models/Lead');

// POST /api/leads/scrape
router.post('/scrape', authMiddleware, async (req, res) => {
  try {
    const { niche, campaignId, isUrl } = req.body;
    if (!niche) return res.status(400).json({ message: 'Niche or URL is required' });

    // Run scraper (max 100 leads)
    const rawLeads = await scraperService.scrapeGoogleMaps(niche, 100, isUrl);

    // Save leads to DB if campaignId provided
    let savedLeads = [];
    if (campaignId) {
      const leadsToSave = rawLeads.map((l) => ({
        campaignId,
        userId: req.user._id,
        name: l.name,
        email: l.email,
        phone: l.phone,
        businessName: l.businessName,
      }));
      savedLeads = await Lead.insertMany(leadsToSave);
    }

    res.json({
      count: rawLeads.length,
      leads: campaignId ? savedLeads : rawLeads,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// POST /api/leads/bulk
router.post('/bulk', authMiddleware, async (req, res) => {
  try {
    const { emails, campaignId } = req.body;
    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ message: 'A list of emails is required' });
    }

    const leadsToSave = emails.map((email) => ({
      campaignId,
      userId: req.user._id,
      name: email.split('@')[0], // Fallback name from email
      email: email.trim(),
      businessName: 'Importação Manual',
    }));

    const savedLeads = await Lead.insertMany(leadsToSave);

    res.json({
      count: savedLeads.length,
      leads: savedLeads,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
