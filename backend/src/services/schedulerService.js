const cron = require('node-cron');
const Campaign = require('../models/Campaign');
const Lead = require('../models/Lead');
const User = require('../models/User');
const smtpService = require('./smtpService');


const processAllCampaigns = async () => {
  console.log('--- Processing campaigns (Triggered) ---');
  
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

  try {
    // Find campaigns that are "running" or "scheduled" and have a start date <= now
    const campaigns = await Campaign.find({
      status: { $in: ['running', 'scheduled'] },
      'schedule.startDate': { $lte: now }
    });

    console.log(`Found ${campaigns.length} active/scheduled campaigns.`);

    for (const campaign of campaigns) {
      // If it's the exact time OR if it's already "running" (meaning it's mid-sequence)
      // On Vercel, we might just want to process whatever is due for the day.
      if (campaign.schedule.time === currentTime || campaign.status === 'running') {
        await processCampaignDay(campaign);
      }
    }
  } catch (err) {
    console.error('Scheduler Error:', err);
  }
};

// Run every minute to check for scheduled campaigns (Local Dev only, won't persist on Vercel)
cron.schedule('* * * * *', processAllCampaigns);

const processCampaignDay = async (campaign) => {
  try {
    // Evitar processar a mesma campanha múltiplas vezes no mesmo minuto se disparado por múltiplos gatilhos
    const lastSent = campaign.lastSentAt ? new Date(campaign.lastSentAt) : null;
    const now = new Date();
    if (lastSent && (now - lastSent) < 50000) { // Menos de 50s atrás
        console.log(`Campaign ${campaign._id} already processed recently. Skipping.`);
        return;
    }

    console.log(`Processing Campaign: ${campaign.name} (Day ${campaign.currentDay + 1})`);
    
    const user = await User.findById(campaign.userId);
    if (!user || !user.smtpConfig) {
      console.error(`User or SMTP not found for campaign ${campaign._id}`);
      return;
    }

    // Identify which email to send (1-5)
    const dayIndex = campaign.currentDay;
    if (dayIndex >= 5 || dayIndex >= campaign.emails.length) {
      campaign.status = 'completed';
      await campaign.save();
      return;
    }

    const emailTemplate = campaign.emails[dayIndex];
    
    // Find leads for this campaign that haven't received THIS day's email
    // We use a simplified check: currentDay of campaign vs lead records
    const leads = await Lead.find({
      campaignId: campaign._id,
      sent: false 
    }).limit(50); // Lotes menores para Vercel (evitar timeout)

    if (leads.length === 0) {
      console.log(`No more leads for campaign ${campaign._id} for this day.`);
      // Se não há mais leads, incrementamos o dia para a próxima execução
      campaign.currentDay += 1;
      if (campaign.currentDay >= 5) campaign.status = 'completed';
      await campaign.save();
      return;
    }

    let sentCount = 0;
    for (const lead of leads) {
      try {
        await smtpService.sendEmail(user, lead.email, emailTemplate.subject, emailTemplate.bodyHtml);
        lead.sent = true;
        lead.sentAt = new Date();
        lead.emailDay = dayIndex + 1;
        await lead.save();
        sentCount++;
      } catch (sendErr) {
        console.error(`Failed to send to ${lead.email}:`, sendErr.message);
      }
    }

    campaign.sentToday = (campaign.sentToday || 0) + sentCount;
    campaign.sentTotal += sentCount;
    campaign.status = 'running';
    campaign.lastSentAt = new Date();
    
    // IMPORTANTE: Só incrementamos o currentDay se realmente terminarmos todos os leads do dia.
    // Como estamos usando limit(50), podemos precisar de múltiplas rodadas do cron para terminar o dia.
    // O check leads.length === 0 acima cuida disso na próxima rodada.

    await campaign.save();
    console.log(`Campaign ${campaign._id} updated. Sent ${sentCount} emails.`);

  } catch (err) {
    console.error(`Error processing campaign ${campaign._id}:`, err);
  }
};

module.exports = {
    processAllCampaigns
};
