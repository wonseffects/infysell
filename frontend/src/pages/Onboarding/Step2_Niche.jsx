import { useState } from 'react';
import useOnboardingStore from '../../store/onboardingStore';
import { Button, Input, Card } from '../../components/UI';
import { Target, ChevronRight } from 'lucide-react';

const SUGGESTIONS = ['Nutrição', 'Imóveis', 'Infoprodutos', 'Advocacia', 'E-commerce', 'Pet Shop'];

export default function Step2_Niche() {
  const { setStep, updateData, data } = useOnboardingStore();
  const [niche, setNiche] = useState(data.niche || '');

  const handleNext = () => {
    if (!niche) return;
    updateData('niche', niche);
    setStep(3);
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-primary-900 bg-opacity-30 rounded-lg text-primary-400">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Qual seu nicho?</h2>
          <p className="text-slate-400">Defina o público para extrairmos contatos relevantes.</p>
        </div>
      </div>

      <div className="space-y-8 py-4">
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

        <div className="flex justify-between items-center pt-8">
          <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white transition-colors">
            Voltar
          </button>
          <Button onClick={handleNext} disabled={!niche}>
            Próximo Passo
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
