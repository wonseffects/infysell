import React, { useState, useEffect } from 'react';
import useOnboardingStore from '../../store/onboardingStore';
import useAuthStore from '../../store/authStore';
import { Button, Input, Card } from '../../components/UI';
import { Cpu, HelpCircle, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function Step3_GroqAPI() {
  const { user: authUser, setUser } = useAuthStore();
  const { setStep, updateData, data, hasSkippedGroq, markSkippedGroq } = useOnboardingStore();
  const [apiKey, setApiKey] = useState(data.groqKey || (authUser?.groqKeyEncrypted ? '********' : ''));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authUser?.groqKeyEncrypted && !hasSkippedGroq) {
      markSkippedGroq();
      setStep(4);
    }
  }, [authUser, hasSkippedGroq]);

  const handleNext = async () => {
    if (!apiKey || apiKey === '********') {
      setStep(4);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/ai/config-key', { apiKey }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ ...authUser, groqKeyEncrypted: 'saved' }); // Just mark as saved in local state
      updateData('groqKey', apiKey);
      setStep(4);
      toast.success('Chave Groq salva com segurança!');
    } catch (err) {
      toast.error('Erro ao salvar chave: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-purple-900 bg-opacity-30 rounded-lg text-purple-400">
          <Cpu className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Motor de IA (Groq)</h2>
          <p className="text-slate-400">Use o LLaMA 3 para gerar e-mails altamente persuasivos.</p>
        </div>
      </div>

      <div className="space-y-6 py-4">
        <div className="bg-slate-800 bg-opacity-50 border border-slate-700 p-4 rounded-xl flex items-start gap-4">
          <HelpCircle className="w-5 h-5 text-primary-400 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm text-slate-300">
              A Groq oferece e-mails mais rápidos e um plano gratuito generoso. Você pode obter sua chave no console oficial:
            </p>
            <a 
              href="https://console.groq.com/keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-400 text-sm flex items-center mt-2 hover:underline"
            >
              Obter API Key Gratuita <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>

        <Input 
          label="Sua Groq API Key"
          type="password"
          placeholder="gsk_..." 
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="font-mono"
        />

        <div className="flex justify-between items-center pt-6">
          <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white transition-colors">
            Voltar
          </button>
          <div className="flex gap-4">
            <button onClick={() => setStep(4)} className="text-sm text-slate-500 hover:text-slate-300">
              Configurar depois
            </button>
            <Button onClick={handleNext} isLoading={isLoading}>
              Próximo Passo
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
