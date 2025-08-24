import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Users } from 'lucide-react';

type LoginProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Login: React.FC<LoginProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signInAsGuest } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error } = await signIn(email, password);

    if (error) {
      setError(typeof error === 'string' ? error : (error as any)?.message || 'An error occurred during login');
    } else {
      console.log("Login successful:", data);
      onClose();
    }

    setIsLoading(false);
  };

  const handleGuestSignIn = async () => {
    setIsGuestLoading(true);
    setError(null);

    const { data, error } = await signInAsGuest();

    if (error) {
      setError(typeof error === 'string' ? error : (error as any)?.message || 'An error occurred during guest login');
    } else {
      console.log("Guest login successful:", data);
      onClose();
    }

    setIsGuestLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg border-2 border-neon-green/30 bg-card-bg p-6 shadow-2xl shadow-neon-green/25 animate-fade-in-up">
        <div className="mb-4 text-lg font-semibold text-neon-green">Log in to Contexer</div>
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-neon-cyan mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-lg border-2 border-gray-700 bg-dark-bg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/20 transition-all duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-neon-cyan mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-lg border-2 border-gray-700 bg-dark-bg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/20 transition-all duration-300"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm rounded-lg border-2 border-gray-700 hover:border-neon-green/50 hover:bg-neon-green/10 text-gray-300 hover:text-neon-green transition-all duration-300 transform hover:scale-105"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-neon-green to-neon-blue hover:from-neon-green/90 hover:to-neon-blue/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold flex items-center shadow-lg hover:shadow-neon-green/50 transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-neon-green/30"></div>
          <span className="flex-shrink-0 px-3 text-neon-cyan text-sm">or</span>
          <div className="flex-grow border-t border-neon-green/30"></div>
        </div>

        {/* Guest Sign In Button */}
        <button
          onClick={handleGuestSignIn}
          disabled={isGuestLoading}
          className="w-full px-4 py-3 text-sm rounded-lg bg-gradient-to-r from-neon-cyan to-neon-blue hover:from-neon-cyan/90 hover:to-neon-blue/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-neon-cyan/50"
        >
          {isGuestLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in as Guest...
            </>
          ) : (
            <>
              <Users className="w-4 h-4 mr-2" />
              Continue as Guest
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Login;


