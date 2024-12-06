import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, loading, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      // Error ya manejado en el contexto
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-[#2C2C2C] rounded-lg shadow-xl p-8">
        <h2 className="text-[#DAA520] text-3xl font-bold mb-6 text-center">
          Iniciar Sesión
        </h2>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-2 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#DAA520] mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#3C3C3C] rounded-lg focus:outline-none focus:border-[#DAA520] text-white"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-[#DAA520] mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              className="w-full px-4 py-2 bg-[#1A1A1A] border border-[#3C3C3C] rounded-lg focus:outline-none focus:border-[#DAA520] text-white"
              placeholder="••••••••"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold ${
              loading
                ? 'bg-[#3C3C3C] cursor-not-allowed'
                : 'bg-[#DAA520] hover:bg-[#B8860B]'
            } text-[#0A2342] transition-colors`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <motion.span
                  className="material-icons animate-spin mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  refresh
                </motion.span>
                Iniciando sesión...
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </motion.button>

          <div className="mt-4 text-center">
            <a
              href="/register"
              className="text-[#DAA520] hover:text-[#B8860B] transition-colors"
            >
              ¿No tienes cuenta? Regístrate aquí
            </a>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default LoginForm;
