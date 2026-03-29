const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  subject: String,
  bodyHtml: String,
  dayNumber: Number, // 1-5
});

const scheduleSchema = new mongoose.Schema({
  startDate: Date,
  time: String, // e.g. "08:00"
  timezone: { type: String, default: 'America/Sao_Paulo' },
  days: [Date], // 5 consecutive days
});

const campaignSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    niche: String,
    objective: String,
    offerLink: String,
    emails: [emailSchema],
    schedule: scheduleSchema,
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'running', 'completed', 'paused'],
      default: 'draft',
    },
    sentToday: { type: Number, default: 0 },
    sentTotal: { type: Number, default: 0 },
    leadsCount: { type: Number, default: 0 },
    currentDay: { type: Number, default: 0 }, // which email day (1-5)
    lastSentAt: Date,
    smtpService: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Campaign', campaignSchema);
