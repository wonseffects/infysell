const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const CryptoJS = require('crypto-js');

// POST /api/smtp/config
router.post('/config', authMiddleware, async (req, res) => {
  try {
    const { service, host, port, user, pass, from } = req.body;

    // Encrypt password
    const passEncrypted = CryptoJS.AES.encrypt(pass, process.env.ENCRYPTION_KEY).toString();

    const limits = {
      gmail: { daily: 500, monthly: 15000 },
      brevo: { daily: 300, monthly: 9000 },
      sendpulse: { daily: 100, monthly: 15000 },
    };

    req.user.smtpConfig = {
      service,
      host,
      port,
      user,
      passEncrypted,
      from,
      dailyLimit: limits[service]?.daily || 100,
      monthlyLimit: limits[service]?.monthly || 5000,
    };

    await req.user.save();
    res.json({ message: 'SMTP configuration saved', smtpConfig: req.user.smtpConfig });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/smtp/config
router.get('/config', authMiddleware, async (req, res) => {
  res.json({ smtpConfig: req.user.smtpConfig });
});

module.exports = router;
