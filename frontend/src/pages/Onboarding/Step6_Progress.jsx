import React, { useEffect, useState, useRef } from 'react';
import useOnboardingStore from '../../store/onboardingStore';
import useAuthStore from '../../store/authStore';
import { Card, ProgressBar, Button } from '../../components/UI';
import { Loader2, CheckCircle, MapPin, Sparkles, CalendarClock, Trophy } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

let isProcessing = false;

export default function Step6_Progress() {
  const { data, reset } = useOnboardingStore();
  const { updateOnboarding } = useAuthStore();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const navigate = useNavigate();

  const steps = [
    { label: 'Validando configurações SMTP', icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Extraindo leads do Google Maps', icon: <MapPin className="w-5 h-5" /> },
    { label: 'Gerando e-mails dinâmicos com IA', icon: <Sparkles className="w-5 h-5" /> },
    { label: 'Agendando campanha no sistema', icon: <CalendarClock className="w-5 h-5" /> },
    { label: 'Campanha otimizada com sucesso!', icon: <Trophy className="w-5 h-5" /> }
  ];

  useEffect(() => {
    if (isProcessing) return;
    isProcessing = true;

    let timer;
    const runProcess = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // 1. Progress Simulation & Real Backend Work
        // Step 1: SMTP is already done, let's just wait a bit
        setCurrentStep(0);
        setProgress(20);
        await new Promise(r => setTimeout(r, 1500));

        // Step 2: Extraction/Import
        setCurrentStep(1);
        setProgress(40);
        
        const campaignRes = await axios.post('/api/campaigns', {
          name: data.extractionMethod === 'niche' ? `Campanha ${data.niche}` : 
                data.extractionMethod === 'manual' ? 'Campanha Lista Manual' : 'Campanha Link Maps',
          niche: data.niche || 'Manual/Link',
          objective: data.campaignDetails.objective,
          offerLink: data.campaignDetails.offerLink,
          emails: data.campaignDetails.emails,
          schedule: data.schedule
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        const campaignId = campaignRes.data.campaign._id;

        if (data.extractionMethod === 'manual') {
          // Importação Manual
          const emailsArray = data.manualLeads.split('\n').map(e => e.trim()).filter(e => e.includes('@'));
          await axios.post('/api/leads/bulk', { 
            emails: emailsArray, 
            campaignId 
          }, { headers: { Authorization: `Bearer ${token}` } });
        } else {
          // Scraper (Niche ou Link)
          await axios.post('/api/leads/scrape', { 
            niche: data.extractionMethod === 'niche' ? data.niche : data.mapsLink, 
            campaignId,
            isUrl: data.extractionMethod === 'link'
          }, { headers: { Authorization: `Bearer ${token}` } });
        }
        
        // 3. AI Generation (Already generated in step 4, just simulating UI)
        setCurrentStep(2);
        setProgress(60);
        await new Promise(r => setTimeout(r, 2000));

        // 4. Scheduling
        setCurrentStep(3);
        setProgress(80);
        await new Promise(r => setTimeout(r, 1500));

        // 5. Done
        setCurrentStep(4);
        setProgress(100);
        setIsDone(true);
        
        // Mark user onboarding as complete
        await updateOnboarding(6, true);
        toast.success('Tudo pronto para disparar!');
        
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          isProcessing = false;
          reset();
          navigate('/dashboard');
        }, 3000);

      } catch (err) {
        toast.error('Erro no processamento final: ' + (err.response?.data?.message || err.message));
        console.error(err);
      }
    };

    runProcess();
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="max-w-xl mx-auto text-center py-12">
      {!isDone ? (
        <div className="space-y-10">
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-primary-500 animate-spin mb-4" />
            <h2 className="text-2xl font-bold">Finalizando Setup...</h2>
            <p className="text-slate-500">Isso levará apenas alguns segundos.</p>
          </div>

          <div className="space-y-6 text-left max-w-sm mx-auto">
            {steps.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${
                i === currentStep ? 'text-primary-400 scale-105 font-bold' : 
                i < currentStep ? 'text-green-500 opacity-60' : 'text-slate-700'
              }`}>
                {i < currentStep ? <CheckCircle className="w-5 h-5" /> : s.icon}
                <span className="text-sm">{s.label}</span>
              </div>
            ))}
          </div>

          <ProgressBar progress={progress} label="Workflow InfySell" />
        </div>
      ) : (
        <div className="space-y-8 animate-in zoom-in duration-500">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-500 bg-opacity-10 rounded-full flex items-center justify-center text-green-500 mb-6 border-4 border-green-500 border-opacity-20">
              <Trophy className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold">Excelente Trabalho!</h2>
            <p className="text-slate-400 max-w-xs mx-auto mt-2">
              Sua campanha foi agendada e os leads foram extraídos. Agora você pode acompanhar tudo pelo painel.
            </p>
          </div>

          <Card className="bg-slate-900 border-slate-800 text-left">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 block">Nicho</span>
                <span className="font-medium">{data.niche}</span>
              </div>
              <div>
                <span className="text-slate-500 block">E-mails</span>
                <span className="font-medium">5 Dias / Sequência</span>
              </div>
              <div>
                <span className="text-slate-500 block">Início</span>
                <span className="font-medium">{data.schedule.startDate} às {data.schedule.time}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Leads</span>
                <span className="font-medium">~100 contatos</span>
              </div>
            </div>
          </Card>

          <Button className="w-full h-12 text-lg" onClick={() => { reset(); navigate('/dashboard'); }}>
            Ir para o Dashboard
          </Button>
        </div>
      )}
    </Card>
  );
}
