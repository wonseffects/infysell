import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useOnboardingStore from '../../store/onboardingStore';
import Step1_SMTP from './Step1_SMTP';
import Step2_Niche from './Step2_Niche';
import Step3_GroqAPI from './Step3_GroqAPI';
import Step4_EmailContent from './Step4_EmailContent';
import Step5_Schedule from './Step5_Schedule';
import Step6_Progress from './Step6_Progress';
import { Check } from 'lucide-react';

export default function OnboardingWizard() {
  const { step } = useOnboardingStore();

  const steps = [
    { id: 1, name: 'SMTP' },
    { id: 2, name: 'Nicho' },
    { id: 3, name: 'Groq AI' },
    { id: 4, name: 'Conteúdo' },
    { id: 5, name: 'Agenda' },
    { id: 6, name: 'Finalizar' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-12">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center relative">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  step >= s.id ? 'bg-primary-600 border-primary-600' : 'border-slate-700 bg-slate-900'
                }`}
              >
                {step > s.id ? <Check className="w-6 h-6 text-white" /> : <span className="text-white font-bold">{s.id}</span>}
              </div>
              <span className={`absolute -bottom-7 text-xs font-medium whitespace-nowrap ${
                step >= s.id ? 'text-primary-400' : 'text-slate-500'
              }`}>
                {s.name}
              </span>
            </div>
            {i !== steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 transition-all duration-500 ${
                step > s.id ? 'bg-primary-600' : 'bg-slate-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="mt-20">
        <AnimatePresence mode="wait">
          {step === 1 && <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><Step1_SMTP /></motion.div>}
          {step === 2 && <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><Step2_Niche /></motion.div>}
          {step === 3 && <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><Step3_GroqAPI /></motion.div>}
          {step === 4 && <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><Step4_EmailContent /></motion.div>}
          {step === 5 && <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><Step5_Schedule /></motion.div>}
          {step === 6 && <motion.div key="s6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><Step6_Progress /></motion.div>}
        </AnimatePresence>
      </div>
    </div>
  );
}
