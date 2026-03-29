import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useOnboardingStore from '../../store/onboardingStore';
import useAuthStore from '../../store/authStore';
import { Button, Input, Card } from '../../components/UI';
import { Mail, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const SMTP_LIMITS = [
  { name: 'Gmail', daily: 500, monthly: 15000, value: 'gmail' },
  { name: 'Brevo', daily: 300, monthly: 9000, value: 'brevo' },
  { name: 'SendPulse', daily: 100, monthly: 15000, value: 'sendpulse' },
];

export default function Step1_SMTP() {
  const { user: authUser, setUser } = useAuthStore();
  const { setStep, updateData, data: onboardingData, hasSkippedSmtp, markSkippedSmtp } = useOnboardingStore();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: onboardingData.smtp || authUser?.smtpConfig || { service: 'gmail', host: 'smtp.gmail.com', port: 465 }
  });

  useEffect(() => {
    if (authUser?.smtpConfig && !hasSkippedSmtp) {
      markSkippedSmtp();
      setStep(2);
    }
  }, [authUser, hasSkippedSmtp]);

  const selectedService = watch('service');

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/smtp/config', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ ...authUser, smtpConfig: res.data.smtpConfig });
      updateData('smtp', data);
      setStep(2);
      toast.success('SMTP configurado com sucesso!');
    } catch (err) {
      toast.error('Erro ao salvar SMTP: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-2xl">
      <h2 className="text-2xl font-bold mb-2">Configuração SMTP</h2>
      <p className="text-slate-400 mb-8">Escolha seu provedor gratuito para envio de e-mails.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {SMTP_LIMITS.map((s) => (
            <label key={s.value} className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
              selectedService === s.value ? 'border-primary-600 bg-primary-900 bg-opacity-20' : 'border-slate-800 hover:border-slate-700'
            }`}>
              <input type="radio" value={s.value} {...register('service')} className="hidden" />
              <div className="flex flex-col items-center text-center">
                <span className="font-bold text-white mb-1">{s.name}</span>
                <span className="text-xs text-slate-400">Limite Diário: <b className="text-white">{s.daily}</b></span>
                <span className="text-xs text-slate-400">Mensal: <b className="text-white">{s.monthly}</b></span>
              </div>
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Host SMTP" {...register('host', { required: 'Host é obrigatório' })} />
          <Input label="Porta" type="number" {...register('port', { required: 'Porta é obrigatória' })} />
        </div>

        <Input label="Usuário / E-mail" {...register('user', { required: 'Usuário é obrigatório' })} />
        <Input label="Senha / App Password" type="password" {...register('pass', { required: 'Senha é obrigatória' })} />
        <Input label="E-mail do Remetente" placeholder="Seu nome <seu@email.com>" {...register('from')} />

        <div className="flex justify-between items-center pt-4">
          <button type="button" onClick={() => setStep(2)} className="text-slate-400 hover:text-white transition-colors">
            Configurar depois
          </button>
          <Button type="submit">
            Próximo Passo
            <CheckCircle2 className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
