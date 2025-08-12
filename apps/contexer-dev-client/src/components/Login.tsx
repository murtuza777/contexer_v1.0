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
    <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1c] p-4 shadow-xl">
        <div className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">Log in to Contexer</div>
        {error && (
          <div className="mb-3 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-600 dark:text-red-400 text-xs">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100 focus:outline-none"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200">Cancel</button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-3 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          <span className="flex-shrink-0 px-2 text-gray-500 dark:text-gray-400 text-xs">or</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        {/* Guest Sign In Button */}
        <button
          onClick={handleGuestSignIn}
          disabled={isGuestLoading}
          className="w-full px-3 py-2 text-xs rounded bg-gradient-to-r from-purple-600/90 to-indigo-600/90 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-200"
        >
          {isGuestLoading ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Signing in as Guest...
            </>
          ) : (
            <>
              <Users className="w-3 h-3 mr-2" />
              Continue as Guest
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Login;


