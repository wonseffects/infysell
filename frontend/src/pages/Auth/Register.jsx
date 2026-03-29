import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Button, Input, Card } from '../../components/UI';
import { UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Register() {
  const { register: registerField, handleSubmit, formState: { errors } } = useForm();
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await register(data.name, data.email, data.password);
      toast.success('Conta criada com sucesso!');
      navigate('/onboarding');
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
          <p className="text-slate-400">Inicie sua jornada de automação</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Nome Completo"
              type="text"
              placeholder="João Silva"
              error={errors.name?.message}
              {...registerField('name', { required: 'Nome é obrigatório' })}
            />

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
              {...registerField('password', { required: 'Mínimo 6 caracteres', minLength: 6 })}
            />

            <Button type="submit" isLoading={loading} className="w-full">
              <UserPlus className="w-4 h-4 mr-2" />
              Criar Conta
            </Button>
          </form>
        </Card>

        <p className="text-center mt-6 text-slate-400">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 transition-colors font-medium">
            Fazer login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
