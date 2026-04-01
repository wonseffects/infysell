import { create } from 'zustand';

const useOnboardingStore = create((set) => ({
  step: 1,
  data: {
    smtp: null,
    niche: '',
    manualLeads: '',
    mapsLink: '',
    extractionMethod: 'niche', // 'niche', 'manual', 'link'
    groqKey: '',
    campaignDetails: {
      objective: '',
      offerLink: '',
      emails: []
    },
    schedule: {
      startDate: null,
      time: '08:00'
    }
  },
  hasSkippedSmtp: false,
  hasSkippedGroq: false,

  setStep: (step) => set({ step }),
  markSkippedSmtp: () => set({ hasSkippedSmtp: true }),
  markSkippedGroq: () => set({ hasSkippedGroq: true }),
  
  updateData: (section, payload) => set((state) => ({
    data: {
      ...state.data,
      [section]: (typeof payload === 'object' && payload !== null)
        ? { ...state.data[section], ...payload }
        : payload
    }
  })),

  reset: () => set({ 
    step: 1, 
    data: { 
      smtp: null, 
      niche: '', 
      manualLeads: '',
      mapsLink: '',
      extractionMethod: 'niche',
      groqKey: '', 
      campaignDetails: { objective: '', offerLink: '', emails: [] }, 
      schedule: { startDate: null, time: '08:00' } 
    } 
  })
}));

export default useOnboardingStore;
