# 🚀 InfySell — Installation Guide for Antigravity

> **Infinity Sell** | Plataforma de Automação de E-mail Marketing com IA

---

## 📋 Visão Geral do Projeto

InfySell é uma plataforma web full-stack de automação de e-mail marketing que extrai leads do Google Maps, gera conteúdo com IA (Groq) e dispara campanhas via SMTP gratuito. Este guia descreve como scaffoldar o projeto usando **Antigravity**.

---

## 🗂️ Estrutura do Projeto

```
infysell/
├── frontend/                  # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Auth/          # Login, Cadastro, OAuth Google
│   │   │   ├── Onboarding/    # Wizard de 6 etapas
│   │   │   │   ├── Step1_SMTP.jsx
│   │   │   │   ├── Step2_Niche.jsx
│   │   │   │   ├── Step3_GroqAPI.jsx
│   │   │   │   ├── Step4_EmailContent.jsx
│   │   │   │   ├── Step5_Schedule.jsx
│   │   │   │   └── Step6_Progress.jsx
│   │   │   ├── Dashboard/     # Painel principal de campanhas
│   │   │   └── Settings/      # Configurações SMTP, API, Dados
│   │   ├── components/        # UI Components reutilizáveis
│   │   └── store/             # Zustand / Context API
│   └── package.json
│
├── backend/                   # Node.js + Express
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── campaigns.js
│   │   │   ├── leads.js
│   │   │   ├── smtp.js
│   │   │   └── ai.js
│   │   ├── services/
│   │   │   ├── groqService.js       # Geração de emails com IA
│   │   │   ├── smtpService.js       # Envio via Brevo/Sendpulse/Gmail
│   │   │   ├── scraperService.js    # Extração Google Maps
│   │   │   └── schedulerService.js  # Agendamento de disparos
│   │   ├── models/                  # Schemas MongoDB
│   │   └── middleware/
│   └── package.json
│
├── .env.example
└── README.md
```

---

## ⚙️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Banco de dados | MongoDB (Atlas Free Tier) |
| Autenticação | JWT + OAuth Google |
| IA / Geração | Groq API (LLaMA 3) |
| Extração de Leads | Google Maps Scraper (Puppeteer / SerpAPI) |
| Agendamento | node-cron |
| SMTP Suportados | Gmail, Brevo, SendPulse |

---

## 🔑 Variáveis de Ambiente (.env)

```env
# App
PORT=3001
NODE_ENV=development
JWT_SECRET=seu_jwt_secret_aqui

# MongoDB
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/infysell

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Groq (salvo por usuário no banco, não em .env global)
# GROQ_API_KEY — armazenado criptografado por usuário no MongoDB

# SMTP — credenciais salvas por usuário no banco
# Não armazenar aqui; salvar criptografado no MongoDB por usuário
```

---

## 📦 Dependências do Backend

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^7.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "passport": "^0.6.0",
    "passport-google-oauth20": "^2.0.0",
    "nodemailer": "^6.9.0",
    "groq-sdk": "^0.3.0",
    "node-cron": "^3.0.0",
    "puppeteer": "^21.0.0",
    "axios": "^1.5.0",
    "dotenv": "^16.0.0",
    "cors": "^2.8.5",
    "express-validator": "^7.0.0",
    "crypto-js": "^4.2.0"
  }
}
```

## 📦 Dependências do Frontend

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.15.0",
    "tailwindcss": "^3.3.0",
    "zustand": "^4.4.0",
    "axios": "^1.5.0",
    "react-hook-form": "^7.46.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.263.0",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^2.30.0"
  }
}
```

---

## 🧩 Fluxo do Wizard — 6 Etapas

### Etapa 1 — Configuração SMTP
- Botões de seleção: **Gmail** | **Brevo** | **SendPulse**
- Formulário dinâmico baseado no serviço selecionado
- Opção "Configurar depois"
- Exibe limite diário/mensal ao final

**Limites gratuitos por serviço:**
| Serviço | Limite Diário | Limite Mensal |
|---|---|---|
| Gmail | 500 | ~15.000 |
| Brevo | 300 | 9.000 |
| SendPulse | 100 | 15.000 |

---

### Etapa 2 — Nicho de Atuação
- Campo de texto para o usuário descrever o nicho
- Ex: "Nutrição", "Imóveis", "Infoprodutos"
- Essa informação é passada ao serviço de scraping para filtrar resultados relevantes no Google Maps

---

### Etapa 3 — Configuração da API Groq
- Campo para inserir a `GROQ_API_KEY`
- Salva criptografada no MongoDB vinculada ao usuário
- **Não pergunta novamente nas campanhas futuras**
- Opção "Configurar depois"

---

### Etapa 4 — Geração de Conteúdo (IA)
- Textarea: descrição do objetivo da campanha
  - Ex: *"Quero vender um ebook de receitas saudáveis"*
- Campo obrigatório: **Link da Oferta** (URL do produto/checkout)
- A IA (Groq LLaMA 3) gera **5 e-mails em HTML/CSS** com:
  - Conteúdo gratuito relacionado ao tema (isca digital)
  - Call-to-Action claro
  - Botão com link da oferta ao final
- Os 5 e-mails são salvos como predefinição da campanha

**Lógica anti-limite de tokens Groq:**
```
if (tokensEstimados > limiteGroq) {
  // Gera 1 email por chamada (5 chamadas separadas)
  // Exibe progresso: "Gerando email 1 de 5..."
}
```

---

### Etapa 5 — Agendamento do Disparo
- Seletor de **data de início** (calendário)
- Seletor de **horário fixo** (ex: 08:00 ou 16:00)
- Sistema automaticamente agenda 5 dias consecutivos
- 1 e-mail diferente enviado por dia
- Para cada dia: dispara para até **100 contatos extraídos**

---

### Etapa 6 — Progresso e Finalização
- Barra de progresso animada com etapas:
  1. ✅ Validando configurações SMTP
  2. ✅ Extraindo leads do Google Maps
  3. ✅ Gerando e-mails com IA
  4. ✅ Agendando disparos
  5. ✅ Campanha criada com sucesso!
- Exibe resumo final da campanha

---

## 📊 Dashboard — Painel de Campanhas

Cada campanha exibe:
- Nome da campanha (derivado do nicho/objetivo)
- Status: Agendada | Em andamento | Concluída
- E-mails enviados hoje / total
- Barra de progresso do limite SMTP
- ⚠️ Alerta de limite próximo (configurável por serviço)
- Botão **"Nova Campanha"**

**Alerta de limite SMTP:**
```
[⚠️] Você está próximo do limite diário do Brevo (270/300 emails)
[ ] Eu pago pelo plano — remover este alerta
```

---

## ⚙️ Configurações do Sistema

- Alterar serviço SMTP e credenciais
- Alterar API Key do Groq
- Alterar dados cadastrais (nome, email, senha)
- Gerenciar alertas de limite

---

## 🗺️ Extração de Leads — Google Maps Scraper

**Campos extraídos por lead:**
- 📧 E-mail
- 👤 Nome / Razão Social
- 📞 Telefone

**Regras:**
- Máximo **100 contatos** por campanha
- Filtro por nicho definido na Etapa 2
- Dados salvos vinculados à campanha no MongoDB

**Serviço recomendado:** Puppeteer (headless) ou integração com SerpAPI Google Maps

---

## 🔒 Segurança

- Senhas hasheadas com bcryptjs
- Credenciais SMTP e API Keys criptografadas com crypto-js antes de salvar no banco
- JWT com expiração de 7 dias
- Rotas protegidas com middleware de autenticação

---

## 🚀 Prompt para Antigravity

Cole o seguinte prompt no Antigravity para iniciar a geração do projeto:

```
Crie uma aplicação web chamada InfySell (Infinity Sell), uma plataforma de automação de e-mail marketing com IA.

Stack: React + Vite + TailwindCSS no frontend, Node.js + Express + MongoDB no backend.

A plataforma deve ter:

1. Autenticação com e-mail/senha e OAuth Google (JWT)

2. Um wizard de onboarding com 6 etapas:
   - Etapa 1: Configuração SMTP (Gmail, Brevo ou SendPulse) com formulário dinâmico por serviço e opção de configurar depois. Exibir limites gratuitos de cada serviço.
   - Etapa 2: Seleção de nicho de atuação para filtrar extração de leads
   - Etapa 3: Inserção da Groq API Key (salva criptografada, não pedida novamente)
   - Etapa 4: Descrição da campanha + link da oferta obrigatório. A IA (Groq LLaMA 3) gera 5 e-mails HTML/CSS com isca digital + CTA + botão de link. Se ultrapassar limite de tokens, gerar 1 email por chamada.
   - Etapa 5: Agendamento — data de início + horário fixo. Sistema agenda automaticamente 5 dias consecutivos, 1 email/dia para até 100 contatos.
   - Etapa 6: Barra de progresso animada mostrando extração de leads, geração de emails e agendamento.

3. Dashboard de campanhas com status, contador de envios, barra de progresso do limite SMTP e alertas de limite com opção de desativar alertas para usuários pagantes.

4. Scraper de Google Maps (Puppeteer) para extrair nome, email e telefone — máximo 100 contatos por campanha.

5. Agendador com node-cron para disparos automáticos no horário configurado.

6. Página de configurações para alterar SMTP, Groq API Key e dados cadastrais.

7. Credenciais SMTP e API Keys armazenadas criptografadas no MongoDB por usuário.

Use TailwindCSS com design moderno, dark mode, componentes reutilizáveis e animações com Framer Motion. Use Zustand para gerenciamento de estado global. Use react-hook-form para todos os formulários.
```

---

## 📝 Notas Finais

- A plataforma usa **exclusivamente planos gratuitos** de SMTP
- O sistema **não acessa diretamente** a conta SMTP do usuário para checar limites — os limites são exibidos como referência visual
- Usuários que pagam pelo SMTP podem desativar os alertas de limite
- A Groq API Key e credenciais SMTP são pedidas **apenas uma vez** e ficam salvas para todas as campanhas futuras

---

*Guia gerado para uso com Antigravity — InfySell v1.0*
