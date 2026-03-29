const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const smtpConfigSchema = new mongoose.Schema({
  service: { type: String, enum: ['gmail', 'brevo', 'sendpulse'] },
  host: String,
  port: Number,
  user: String,
  passEncrypted: String, // encrypted with crypto-js
  from: String,
  dailyLimit: Number,
  monthlyLimit: Number,
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String },
    googleId: { type: String },
    smtpConfig: smtpConfigSchema,
    groqKeyEncrypted: { type: String }, // encrypted
    onboardingComplete: { type: Boolean, default: false },
    onboardingStep: { type: Number, default: 0 },
    suppressSmtpAlerts: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('passwordHash') && this.passwordHash && !this.passwordHash.startsWith('$2')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.groqKeyEncrypted;
  if (obj.smtpConfig) delete obj.smtpConfig.passEncrypted;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
