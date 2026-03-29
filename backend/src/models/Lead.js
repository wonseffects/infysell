const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    email: { type: String, required: true },
    phone: String,
    businessName: String,
    sent: { type: Boolean, default: false },
    sentAt: Date,
    emailDay: Number, // which email (1-5) was sent
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
