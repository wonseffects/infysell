import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, ProgressBar } from '../../components/UI';
import { ArrowLeft, Users, Mail, Link as LinkIcon, CheckCircle, CalendarClock, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/campaigns/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCampaign(res.data.campaign);
        setLeads(res.data.leads);
      } catch (err) {
        toast.error('Erro ao carregar detalhes');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, navigate]);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Carregando detalhes...</div>;
  }

  if (!campaign) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-500 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para a Dashboard
      </button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
              <Target className="w-3 h-3" /> {campaign.niche}
            </span>
            <span className="flex items-center gap-1">
              <CalendarClock className="w-3 h-3" /> 
              Início: {campaign.schedule?.startDate} às {campaign.schedule?.time}
            </span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider bg-primary-900 bg-opacity-30 text-primary-400 border border-primary-500 border-opacity-30">
          {campaign.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Email Sequence */}
          <Card>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
              <Mail className="w-5 h-5 text-primary-400" />
              Sequência Gerada pela IA
            </h3>
            
            <div className="space-y-6">
              {campaign.emails?.map((email, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dia {email.dayNumber}</span>
                    <span className="text-xs text-slate-500">Status: {campaign.currentDay >= email.dayNumber ? 'Enviado' : 'Aguardando'}</span>
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">Assunto: {email.subject}</h4>
                  <div className="prose prose-invert max-w-none text-sm text-slate-300 bg-slate-950 p-4 rounded-md border border-slate-800 overflow-x-auto">
                    {/* Render HTML Safely (or just show raw code for preview) */}
                    <div dangerouslySetInnerHTML={{ __html: email.bodyHtml }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Stats Overview */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <h3 className="text-lg font-bold mb-4">Progresso de Disparo</h3>
            <div className="space-y-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Enviado</span>
                <span className="text-white font-medium">{campaign.sentTotal || 0} de {leads.length * 5} envios</span>
              </div>
              <ProgressBar progress={campaign.sentTotal ? (campaign.sentTotal / (leads.length * 5)) * 100 : 0} color="bg-primary-500" />
              
              <div className="pt-4 border-t border-slate-700">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-slate-400">Oferta</span>
                  <a href={campaign.offerLink} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline flex items-center gap-1">
                    Ver link <LinkIcon className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </Card>

          {/* Leads Extracted */}
          <Card>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-400" />
              Leads Extraídos ({leads.length})
            </h3>
            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {leads.map((lead, idx) => (
                <div key={idx} className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-sm">
                  <div className="font-medium text-white mb-1 truncate">{lead.name}</div>
                  <div className="text-slate-400 truncate">{lead.email}</div>
                  {lead.phone && <div className="text-slate-500 text-xs mt-1">{lead.phone}</div>}
                </div>
              ))}
              {leads.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">Nenhum lead encontrado para este nicho.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
