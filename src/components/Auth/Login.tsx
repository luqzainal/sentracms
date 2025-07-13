import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useDatabase } from '../../context/SupabaseContext';
import { useAppStore } from '../../store/AppStore';
import loginBgImage from '../../assets/Picture1.png'; // Import the new image

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, isDatabaseConnected } = useDatabase();
  const { setUser } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signIn(email, password);
    
    if (result.error) {
      setError(result.error.message);
    } else if (result.data?.user) {
      const appStoreUser = {
        id: result.data.user.id,
        name: result.data.user.name,
        email: result.data.user.email,
        role: result.data.user.role,
        status: 'Active',
        lastLogin: new Date().toISOString(),
        clientId: result.data.user.clientId,
        permissions: result.data.user.permissions || ['all'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUser(appStoreUser);
    }
    
    setIsLoading(false);
  };

  const handleDemoLogin = () => {
    setEmail('superadmin@sentra.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-[#1a202c] flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#34d399] rounded-lg flex items-center justify-center">
                <span className="text-slate-900 font-bold text-xl">S</span>
              </div>
              <span className="text-white text-2xl font-bold">Sentra.</span>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-white text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-slate-400">Welcome back! Please enter your details</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#34d399] focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#34d399] focus:border-transparent transition-all duration-200 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#34d399] bg-slate-700 border-slate-600 rounded focus:ring-[#34d399] focus:ring-offset-slate-900"
                />
                <span className="text-slate-300 text-sm">Remember for 30 Days</span>
              </label>
              <button
                type="button"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Forgot password
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#34d399] text-slate-900 py-3 px-4 rounded-lg font-semibold hover:bg-[#6ee7b7] focus:outline-none focus:ring-2 focus:ring-[#34d399] focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
            
            {/* Database Status & Demo Login */}
            <div className="flex items-center justify-between text-xs pt-4">
              <span className="text-slate-500">
                Database: {isDatabaseConnected ? 
                  <span className="text-green-400">Connected</span> : 
                  <span className="text-yellow-400">Mock Mode</span>
                }
              </span>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-slate-400 hover:text-[#34d399] transition-colors font-medium"
              >
                Use Demo Login
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex w-1/2 bg-black items-center justify-center">
        <img src={loginBgImage} alt="Mysentree AI CRM Consulting" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default Login;