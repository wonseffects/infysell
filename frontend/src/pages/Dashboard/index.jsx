import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, ProgressBar } from '../../components/UI';
import { Plus, Play, Pause, Trash2, AlertTriangle, Layers, Users, MailCheck, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/campaigns', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(res.data.campaigns);
    } catch (err) {
      toast.error('Erro ao buscar campanhas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const deleteCampaign = async (id) => {
    if (!confirm('Excluir esta campanha permanentemente?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(campaigns.filter(c => c._id !== id));
      toast.success('Campanha removida');
    } catch (err) {
      toast.error('Erro ao excluir');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-400 bg-green-900 bg-opacity-20';
      case 'scheduled': return 'text-blue-400 bg-blue-900 bg-opacity-20';
      case 'paused': return 'text-yellow-400 bg-yellow-900 bg-opacity-20';
      case 'completed': return 'text-primary-400 bg-primary-900 bg-opacity-20';
      default: return 'text-slate-400 bg-slate-800';
    }
  };

  // Mock Limit Check (Reference visual)
  const isNearLimit = user?.smtpConfig?.dailyLimit && (user.smtpConfig.dailyLimit - 20) <= 280; // Example

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Suas Campanhas</h1>
          <p className="text-slate-400 mt-1">Gerencie seus disparos e acompanhe o progresso.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white" onClick={() => {
            useAuthStore.getState().logout();
            navigate('/login');
          }}>
            <LogOut className="w-4 h-4" />
          </Button>
          <Button variant="secondary" onClick={() => navigate('/settings')}>Configurações</Button>
          <Button onClick={() => navigate('/onboarding')}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Campanha
          </Button>
        </div>
      </div>

      {isNearLimit && !user?.suppressSmtpAlerts && (
        <Card className="bg-yellow-900 bg-opacity-10 border-yellow-700 border-opacity-30 mb-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-yellow-500 w-6 h-6" />
            <span className="text-yellow-200">
              Você está próximo do limite diário do seu SMTP (280/300 e-mails).
            </span>
          </div>
          <button className="text-xs text-yellow-500 hover:underline">Eu pago pelo plano — remover este alerta</button>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-500">Buscando campanhas...</div>
      ) : campaigns.length === 0 ? (
        <Card className="text-center py-20 bg-slate-900 bg-opacity-30 border-dashed border-2 border-slate-800">
          <div className="mb-4 text-slate-700">
            <Layers className="w-16 h-16 mx-auto opacity-20" />
          </div>
          <h2 className="text-xl font-medium text-slate-500 mb-6">Nenhuma campanha criada ainda.</h2>
          <Button onClick={() => navigate('/onboarding')}>Começar Agora</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <Card key={c._id} className="hover:border-primary-600 transition-all border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(c.status)}`}>
                  {c.status}
                </span>
                <div className="flex gap-2 text-slate-500">
                  <button onClick={() => deleteCampaign(c._id)} className="hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-1 truncate">{c.name}</h3>
              <p className="text-slate-500 text-sm mb-6 flex items-center gap-1">
                <Users className="w-3 h-3" /> {c.niche}
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Progresso</span>
                  <span className="text-white font-medium">{c.sentTotal} / 500</span>
                </div>
                <ProgressBar progress={(c.sentTotal / 500) * 100} color="bg-primary-600" />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                <div className="text-center">
                  <span className="text-slate-500 text-xs block uppercase tracking-tighter">Hoje</span>
                  <span className="text-lg font-bold text-white">{c.sentToday || 0}</span>
                </div>
                <div className="text-center">
                  <span className="text-slate-500 text-xs block uppercase tracking-tighter">Day</span>
                  <span className="text-lg font-bold text-white">{c.currentDay || 0}/5</span>
                </div>
              </div>

              <div className="mt-6">
                <Button variant="outline" className="w-full text-xs py-2" onClick={() => navigate(`/dashboard/campaign/${c._id}`)}>
                  Ver Detalhes
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
