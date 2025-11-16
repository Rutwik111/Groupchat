import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import toast from 'react-hot-toast';

interface AuthFormProps {
  defaultMode: 'login' | 'signup';
}

const AuthForm: React.FC<AuthFormProps> = ({ defaultMode }) => {
  const [authMode, setAuthMode] = useState(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const validate = (): boolean => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return false;
    }
    if (authMode === 'signup') {
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        toast.error('Username must be 3-20 alphanumeric characters or underscores.');
        return false;
      }
    }
    return true;
  };

  const handleLogin = async () => {
    const result = await login(email, password);
    if(result.user) {
        if(result.user.isAdmin) {
            navigate('/admin');
        } else {
            navigate('/dashboard');
        }
    }
    return result;
  };

  const handleSignup = async () => {
    const result = await signup(email, password, username);
    if(result.success) {
      setTimeout(() => {
        setAuthMode('login');
        setUsername('');
      }, 1000);
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const promise = authMode === 'login' ? handleLogin() : handleSignup();
    
    toast.promise(promise, {
      loading: 'Processing...',
      success: (data) => data.message,
      error: (err) => err.message,
    });
    
    // We handle navigation inside the functions
    try {
        await promise;
    } catch (e) {
        // toast.promise already handles error display
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setAuthMode('login')}
          className={`w-1/2 py-3 text-lg font-semibold transition-colors duration-300 ${
            authMode === 'login' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setAuthMode('signup')}
          className={`w-1/2 py-3 text-lg font-semibold transition-colors duration-300 ${
            authMode === 'signup' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Sign Up
        </button>
      </div>
      <div className="text-center pt-2">
        <h1 className="text-3xl font-bold text-white">{authMode === 'login' ? 'Welcome Back' : 'Create an Account'}</h1>
        <p className="text-gray-400">{authMode === 'login' ? 'Log in to your workspace.' : 'Start your journey with us.'}</p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {authMode === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-gray-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-gray-300 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 text-gray-300 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 text-gray-300 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
          >
            {loading ? 'Processing...' : authMode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;