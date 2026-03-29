const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const Lead = require('../models/Lead');
const CryptoJS = require('crypto-js');

// GET /api/campaigns
router.get('/', authMiddleware, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ campaigns });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/campaigns
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, niche, objective, offerLink, emails, schedule } = req.body;
    
    // Safety check: Avoid duplicates from simultaneous clicks/double calls
    const lastCampaign = await Campaign.findOne({ userId: req.user._id, niche }).sort({ createdAt: -1 });
    if (lastCampaign && (new Date() - lastCampaign.createdAt) < 10000) {
      return res.status(409).json({ message: 'Campanha já está sendo processada!', campaign: lastCampaign });
    }

    const campaign = new Campaign({
      userId: req.user._id,
      name: name || `Campanha ${niche}`,
      niche,
      objective,
      offerLink,
      emails,
      schedule,
      smtpService: req.user.smtpConfig?.service,
      status: schedule?.startDate ? 'scheduled' : 'draft',
    });
    await campaign.save();
    res.status(201).json({ campaign });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/campaigns/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, userId: req.user._id });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    const leads = await Lead.find({ campaignId: campaign._id });
    res.json({ campaign, leads });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/campaigns/:id/status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true }
    );
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json({ campaign });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/campaigns/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Campaign.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    await Lead.deleteMany({ campaignId: req.params.id });
    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
