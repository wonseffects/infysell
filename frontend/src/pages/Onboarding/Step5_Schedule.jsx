import { useState } from 'react';
import useOnboardingStore from '../../store/onboardingStore';
import { Button, Input, Card } from '../../components/UI';
import { Calendar, Clock, ChevronRight, Info } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Step5_Schedule() {
  const { setStep, updateData, data } = useOnboardingStore();
  const [startDate, setStartDate] = useState(data.schedule.startDate || format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(data.schedule.time || '08:00');

  const handleNext = () => {
    updateData('schedule', { startDate, time });
    setStep(6);
  };

  const dates = Array.from({ length: 5 }).map((_, i) => addDays(new Date(startDate), i));

  return (
    <Card className="max-w-2xl mx-auto shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-900 bg-opacity-30 rounded-lg text-blue-400">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Agendamento Automático</h2>
          <p className="text-slate-400">Defina o início e o horário de disparo diário.</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <Input 
            label="Data de Início"
            type="date"
            min={format(new Date(), 'yyyy-MM-dd')}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input 
            label="Horário de Disparo (Fix0)"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <div className="bg-slate-800 bg-opacity-50 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-primary-400" />
            <h3 className="font-bold text-white uppercase text-xs tracking-widest">Resumo da Sequência</h3>
          </div>
          <div className="space-y-3">
            {dates.map((date, i) => (
              <div key={i} className="flex items-center justify-between border-b border-slate-700 pb-2 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-primary-600 text-white' : 'bg-slate-900 text-slate-500'}`}>
                    DIA {i + 1}
                  </div>
                  <span className="text-slate-300 font-medium">
                    {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-500 text-sm">
                  <Clock className="w-3 h-3" />
                  {time}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-500 italic">
            * O sistema enviará automaticamente 1 e-mail diferente para até 100 leads por dia ao longo de 5 dias consecutivos.
          </p>
        </div>

        <div className="flex justify-between items-center pt-4">
          <button onClick={() => setStep(4)} className="text-slate-400 hover:text-white transition-colors">
            Voltar
          </button>
          <Button onClick={handleNext}>
            Próximo Passo
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
