const Groq = require('groq-sdk');
const CryptoJS = require('crypto-js');

const generateCampaignEmails = async (user, objective, offerLink, niche) => {
  try {
    const apiKey = CryptoJS.AES.decrypt(user.groqKeyEncrypted, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
    const groq = new Groq({ apiKey });

    const emails = [];
    
    // We generate 5 emails. 1 per call to avoid token limits if the description is long.
    for (let i = 1; i <= 5; i++) {
      console.log(`Generating email ${i} of 5 for objective: ${objective}`);
      
      const prompt = `
        Você é um especialista em e-mail marketing. 
        Crie o E-MAIL número ${i} de uma sequência de 5 dias para uma campanha de e-mail marketing.
        
        CONTEXTO:
        Nicho: ${niche}
        Objetivo da Campanha: ${objective}
        Link da Oferta: ${offerLink}
        
        REGRAS:
        1. O e-mail deve ser em PORTUGUÊS.
        2. Deve ser amigável, profissional e focado em entregar valor (isca digital) antes de vender.
        3. O dia ${i} deve ter um tema específico relacionado ao objetivo.
        4. O e-mail deve incluir um Assunto criativo.
        5. O corpo do e-mail deve ser em HTML/CSS simples, moderno e responsivo.
        6. Deve conter um Call-to-Action claro com um botão apontando para: ${offerLink}
        
        RETORNE APENAS UM JSON NO SEGUINTE FORMATO:
        {
          "subject": "Assunto do e-mail",
          "bodyHtml": "Conteúdo HTML aqui"
        }
      `;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(chatCompletion.choices[0].message.content);
      emails.push({
        subject: result.subject,
        bodyHtml: result.bodyHtml,
        dayNumber: i
      });
    }

    return emails;
  } catch (err) {
    throw new Error(`Groq Service Error: ${err.message}`);
  }
};

module.exports = {
  generateCampaignEmails
};
