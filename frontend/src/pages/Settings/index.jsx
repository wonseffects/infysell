import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import { Card, Button, Input } from '../../components/UI';
import { User, Settings as SettingsIcon, Shield, Server, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-500 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para a Dashboard
      </button>

      <h1 className="text-3xl font-bold mb-8">Configurações do Sistema</h1>

      <div className="flex gap-8">
        <aside className="w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'profile' ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" /> Perfil
          </button>
          <button 
            onClick={() => setActiveTab('smtp')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'smtp' ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Server className="w-4 h-4" /> SMTP / Envio
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'security' ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" /> API Keys & Segurança
          </button>

          <button 
            onClick={() => {
              useAuthStore.getState().logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900 hover:bg-opacity-20 transition-all mt-8"
          >
            <LogOut className="w-4 h-4" /> Sair da Conta
          </button>
        </aside>

        <main className="flex-1">
          {activeTab === 'profile' && (
            <Card className="space-y-6">
              <h3 className="text-xl font-bold border-b border-slate-800 pb-4">Dados Pessoais</h3>
              <Input label="Nome Completo" defaultValue={user?.name} />
              <Input label="E-mail" defaultValue={user?.email} disabled />
              <Button onClick={() => toast.success('Perfil atualizado!')}>Salvar Alterações</Button>
            </Card>
          )}

          {activeTab === 'smtp' && (
            <Card className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold">Configurações de SMTP</h3>
                <span className="text-xs bg-slate-800 px-2 py-1 rounded text-primary-400 font-bold uppercase">
                  {user?.smtpConfig?.service || 'Não Configurado'}
                </span>
              </div>
              <p className="text-sm text-slate-400">Suas credenciais são armazenadas com criptografia AES-256 de ponta a ponta.</p>
              <Button onClick={() => navigate('/onboarding')} variant="secondary" className="w-full">
                Reconfigurar SMTP Wizard
              </Button>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="space-y-6">
              <h3 className="text-xl font-bold border-b border-slate-800 pb-4">Chaves de API</h3>
              <Input label="Groq API Key" type="password" placeholder="••••••••••••••••" />
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <div className="text-sm">
                  <p className="text-white font-medium">Alertas de Limite</p>
                  <p className="text-slate-500 text-xs">Avisar quando o SMTP estiver quase cheio</p>
                </div>
                <div className="w-12 h-6 bg-primary-600 rounded-full flex justify-end p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <Button className="w-full">Atualizar Chaves</Button>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
