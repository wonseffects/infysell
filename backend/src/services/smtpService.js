const nodemailer = require('nodemailer');
const CryptoJS = require('crypto-js');

const sendEmail = async (user, to, subject, html) => {
  try {
    if (!user.smtpConfig) throw new Error('SMTP not configured for user');

    const { service, host, port, user: smtpUser, passEncrypted, from } = user.smtpConfig;
    const pass = CryptoJS.AES.decrypt(passEncrypted, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);

    let transporter;
    
    if (service === 'gmail') {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: smtpUser, pass }
      });
    } else {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user: smtpUser, pass }
      });
    }

    const info = await transporter.sendMail({
      from: from || smtpUser,
      to,
      subject,
      html
    });

    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('SMTP Send Error:', err);
    throw err;
  }
};

module.exports = {
  sendEmail
};
