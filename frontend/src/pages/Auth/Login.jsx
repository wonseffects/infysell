import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Button, Input, Card } from '../../components/UI';
import { LogIn } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Login() {
  const { register: registerField, handleSubmit, formState: { errors } } = useForm();
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      toast.success('Bem-vindo de volta!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">InfySell</h1>
          <p className="text-slate-400">Automatize seu marketing com IA</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@parceiro.com"
              error={errors.email?.message}
              {...registerField('email', { required: 'E-mail é obrigatório' })}
            />
            
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...registerField('password', { required: 'Senha é obrigatória' })}
            />

            <Button type="submit" isLoading={loading} className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 bg-opacity-0 text-slate-500 backdrop-blur-sm">Ou continue com</span>
              </div>
            </div>

            <Button 
              variant="secondary" 
              className="w-full mt-4" 
              onClick={() => toast.error('Google OAuth não configurado no .env')}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 mr-2" alt="Google" />
              Google
            </Button>
          </div>
        </Card>

        <p className="text-center mt-6 text-slate-400">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 transition-colors font-medium">
            Cadastre-se grátis
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
