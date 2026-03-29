const cron = require('node-cron');
const Campaign = require('../models/Campaign');
const Lead = require('../models/Lead');
const User = require('../models/User');
const smtpService = require('./smtpService');

// Run every minute to check for scheduled campaigns
cron.schedule('* * * * *', async () => {
  console.log('--- Cron Check: Processing campaigns ---');
  
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

  try {
    // Find campaigns that are "running" or "scheduled" and have a start date <= now
    const campaigns = await Campaign.find({
      status: { $in: ['running', 'scheduled'] },
      'schedule.startDate': { $lte: now }
    });

    for (const campaign of campaigns) {
      if (campaign.schedule.time === currentTime) {
        await processCampaignDay(campaign);
      }
    }
  } catch (err) {
    console.error('Scheduler Error:', err);
  }
});

const processCampaignDay = async (campaign) => {
  try {
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
    const leads = await Lead.find({
      campaignId: campaign._id,
      sent: false // Simplified: in a real app, we'd track per-day sent status
    }).limit(100); 

    if (leads.length === 0) {
      console.log(`No more leads for campaign ${campaign._id}`);
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

    campaign.sentToday = sentCount;
    campaign.sentTotal += sentCount;
    campaign.status = 'running';
    campaign.lastSentAt = new Date();
    
    // Move to next day for next cron run (if it's a daily schedule)
    // In this MVP, we just increment. A more complex system would handle 
    // exact dates for each of the 5 days.
    campaign.currentDay += 1;
    if (campaign.currentDay >= 5) campaign.status = 'completed';
    
    await campaign.save();
    console.log(`Campaign ${campaign._id} updated. Sent ${sentCount} emails.`);

  } catch (err) {
    console.error(`Error processing campaign ${campaign._id}:`, err);
  }
};
