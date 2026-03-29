const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const scraperService = require('../services/scraperService');
const Lead = require('../models/Lead');

// POST /api/leads/scrape
router.post('/scrape', authMiddleware, async (req, res) => {
  try {
    const { niche, campaignId } = req.body;
    if (!niche) return res.status(400).json({ message: 'Niche is required' });

    // Run scraper (max 100 leads)
    const rawLeads = await scraperService.scrapeGoogleMaps(niche, 100);

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

// GET /api/leads/:campaignId
router.get('/:campaignId', authMiddleware, async (req, res) => {
  try {
    const leads = await Lead.find({ campaignId: req.params.campaignId, userId: req.user._id });
    res.json({ leads });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
