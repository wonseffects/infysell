import { useState } from 'react';
import useOnboardingStore from '../../store/onboardingStore';
import { Button, Input, Card } from '../../components/UI';
import { Target, ChevronRight, UserPlus, Link2, Search } from 'lucide-react';

const SUGGESTIONS = ['Nutrição', 'Imóveis', 'Infoprodutos', 'Advocacia', 'E-commerce', 'Pet Shop'];

export default function Step2_Niche() {
  const { setStep, updateData, data } = useOnboardingStore();
  const [method, setMethod] = useState(data.extractionMethod || 'niche');
  const [niche, setNiche] = useState(data.niche || '');
  const [manualLeads, setManualLeads] = useState(data.manualLeads || '');
  const [mapsLink, setMapsLink] = useState(data.mapsLink || '');

  const handleNext = () => {
    updateData('extractionMethod', method);
    
    if (method === 'niche') {
      if (!niche) return;
      updateData('niche', niche);
    } else if (method === 'manual') {
      if (!manualLeads) return;
      updateData('manualLeads', manualLeads);
    } else if (method === 'link') {
      if (!mapsLink) return;
      updateData('mapsLink', mapsLink);
    }
    
    setStep(3);
  };

  const tabs = [
    { id: 'niche', label: 'Busca Automática', icon: <Search className="w-4 h-4" /> },
    { id: 'manual', label: 'Lista Manual', icon: <UserPlus className="w-4 h-4" /> },
    { id: 'link', label: 'Link do Maps', icon: <Link2 className="w-4 h-4" /> }
  ];

  const isNextDisabled = 
    (method === 'niche' && !niche) || 
    (method === 'manual' && !manualLeads) || 
    (method === 'link' && !mapsLink);

  return (
    <Card className="max-w-2xl mx-auto shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-primary-900 bg-opacity-30 rounded-lg text-primary-400">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Como obter os contatos?</h2>
          <p className="text-slate-400">Escolha o método mais adequado para sua campanha.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900 p-1 rounded-xl mb-8 border border-slate-800">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setMethod(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              method === t.id ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-6 py-2 min-h-[200px]">
        {method === 'niche' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Input 
              placeholder="Ex: Clínicas de odontologia em São Paulo" 
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="text-lg py-4"
            />

            <div>
              <p className="text-sm font-medium text-slate-500 mb-3">Sugestões populares:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map(s => (
                  <button 
                    key={s}
                    onClick={() => setNiche(s)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      niche === s ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {method === 'manual' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-sm text-slate-400">Cole abaixo sua lista de e-mails (um por linha).</p>
            <textarea
              className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none font-mono text-sm"
              placeholder="exemplo1@email.com&#10;exemplo2@email.com&#10;..."
              value={manualLeads}
              onChange={(e) => setManualLeads(e.target.value)}
            />
          </div>
        )}

        {method === 'link' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-sm text-slate-400">Cole o link da busca do Google Maps.</p>
            <Input 
              placeholder="https://www.google.com/maps/search/..." 
              value={mapsLink}
              onChange={(e) => setMapsLink(e.target.value)}
              className="text-lg py-4"
            />
            <div className="p-4 bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-20 rounded-lg text-xs text-yellow-500">
              ⚠️ Nota: A extração via link pode levar mais tempo para processar.
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-8 border-t border-slate-800 mt-4">
          <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white transition-colors font-medium">
            Voltar
          </button>
          <Button onClick={handleNext} disabled={isNextDisabled}>
            Próximo Passo
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
