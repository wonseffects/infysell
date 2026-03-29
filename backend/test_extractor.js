const puppeteer = require('puppeteer');
const fs = require('fs');

async function extractEmails(niche, maxPages = 3) {
  console.log(`\n🔍 Iniciando extração de e-mails reais para: "${niche}"`);
  console.log(`Usando técnica de Google Dorks...\n`);

  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });
  
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

  // Dork focada em provedores comuns no nicho especificado
  const dork = `"${niche}" "@gmail.com" OR "@hotmail.com" OR "@yahoo.com.br" OR "@outlook.com" OR "contato@"`;
  const url = `https://www.bing.com/search?q=${encodeURIComponent(dork)}`;

  let allEmails = new Set();
  
  try {
    console.log(`Buscando URL no Bing...`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    for (let current = 1; current <= maxPages; current++) {
      console.log(`-> Vasculhando página ${current} do Bing...`);
      
      // Extrair todo o texto visível da página (títulos e descrições dos resultados)
      const pageText = await page.evaluate(() => document.body.innerText);
      fs.writeFileSync('debug_text.txt', pageText);
      
      // Regex poderoso para e-mails
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const found = pageText.match(emailRegex);
      
      if (found) {
        found.forEach(e => {
          // Filtragem básica para remover falsos positivos comuns em código HTML/JS
          const cleanEmail = e.toLowerCase();
          if (!cleanEmail.endsWith('.png') && !cleanEmail.endsWith('.jpg') && !cleanEmail.startsWith('sentry')) {
             allEmails.add(cleanEmail);
          }
        });
      }

      // Tenta ir para a próxima página no Bing
      const nextButton = await page.$('a.sb_pagN');
      if (nextButton && current < maxPages) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
          nextButton.click()
        ]);
        // Pausa anti-bot básica
        await new Promise(r => setTimeout(r, 3000));
      } else {
        break; // Não há mais páginas
      }
    }
  } catch (err) {
    console.error('Erro durante a navegação:', err.message);
  } finally {
    await browser.close();
  }

  const emailsArray = Array.from(allEmails);
  console.log(`\n✅ Extração concluída!`);
  console.log(`📧 E-mails únicos encontrados: ${emailsArray.length}`);
  
  if (emailsArray.length > 0) {
    fs.writeFileSync('emails_encontrados.json', JSON.stringify({
      niche: niche,
      total: emailsArray.length,
      emails: emailsArray
    }, null, 2));
    console.log(`\n💾 Lista salva com sucesso em 'emails_encontrados.json'.\n`);
    console.log('Amostra dos e-mails:', emailsArray.slice(0, 5));
  } else {
    console.log(`\nNenhum e-mail encontrado para este nicho usando Dorks publicamente.`);
  }
}

// Executar o teste
const nichoTeste = process.argv[2] || "Nutrição Animal";
extractEmails(nichoTeste);
