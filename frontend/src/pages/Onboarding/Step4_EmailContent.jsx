import { useState } from 'react';
import useOnboardingStore from '../../store/onboardingStore';
import { Button, Input, Card } from '../../components/UI';
import { Sparkles, ShoppingBag, Eye, Send } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function Step4_EmailContent() {
  const { setStep, updateData, data } = useOnboardingStore();
  const [objective, setObjective] = useState(data.campaignDetails.objective || '');
  const [offerLink, setOfferLink] = useState(data.campaignDetails.offerLink || '');
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState(data.campaignDetails.emails || []);
  const [previewIndex, setPreviewIndex] = useState(0);

  const handleGenerate = async () => {
    if (!objective || !offerLink) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/ai/generate-emails', 
        { objective, offerLink, niche: data.niche },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmails(res.data.emails);
      toast.success('5 E-mails gerados com sucesso!');
    } catch (err) {
      toast.error('Erro ao gerar e-mails: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    updateData('campaignDetails', { objective, offerLink, emails });
    setStep(5);
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-900 bg-opacity-30 rounded-lg text-indigo-400">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Criação da Campanha</h2>
          <p className="text-slate-400">Descreva seu objetivo e a IA cuidará do resto.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">O que você quer alcançar?</label>
            <textarea 
              className="w-full bg-slate-800 border-slate-700 text-white rounded-lg p-3 h-32 focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-500"
              placeholder="Ex: Quero vender um treinamento de nutrição esportiva focado em hipertrofia."
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            />
          </div>

          <Input 
            label="Link da Oferta (Obrigatório)"
            placeholder="https://seu-produto.com/checkout"
            value={offerLink}
            onChange={(e) => setOfferLink(e.target.value)}
          />

          <Button 
            onClick={handleGenerate} 
            isLoading={isLoading} 
            disabled={!objective || !offerLink}
            className="w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Gerar Sequência de 5 Dias
          </Button>
        </div>

        <div className="bg-slate-900 bg-opacity-50 border border-slate-800 rounded-xl p-4 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
            <span className="text-sm font-bold text-slate-400">Preview dos E-mails</span>
            {emails.length > 0 && (
              <div className="flex gap-1">
                {emails.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setPreviewIndex(i)}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-all ${
                      previewIndex === i ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {emails.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 block">Assunto:</label>
                  <p className="font-semibold text-primary-400">{emails[previewIndex].subject}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block">Corpo HTML:</label>
                  <div className="bg-white p-4 rounded text-black text-sm h-64 overflow-y-auto" dangerouslySetInnerHTML={{ __html: emails[previewIndex].bodyHtml }} />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 italic">
                <Eye className="w-12 h-12 mb-2 opacity-10" />
                <p>Nenhum e-mail gerado ainda</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-10 border-t border-slate-800 mt-6">
        <button onClick={() => setStep(3)} className="text-slate-400 hover:text-white transition-colors">
          Voltar
        </button>
        <Button onClick={handleNext} disabled={emails.length === 0}>
          Configurar Agendamento
          <Send className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
