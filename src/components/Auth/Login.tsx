import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useDatabase } from '../../context/SupabaseContext';
import { useAppStore } from '../../store/AppStore';
import loginBgImage from '../../assets/Picture1.png'; // Import the new image
import Logo from '../common/Logo'; // Import the Logo component

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

    // Client-side validation
    if (!email.trim()) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      setIsLoading(false);
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    const result = await signIn(email, password, rememberMe);
    
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

  const handleDemoAdminLogin = () => {
    const demoEmail = import.meta.env.VITE_DEMO_ADMIN_EMAIL || 'superadmin@sentra.com';
    const demoPassword = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'password123';
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  const handleDemoClientLogin = () => {
    const demoEmail = import.meta.env.VITE_DEMO_CLIENT_EMAIL || 'client@demo.com';
    const demoPassword = import.meta.env.VITE_DEMO_CLIENT_PASSWORD || 'client123';
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-[#1e1d1e] flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-12 flex justify-center">
            <Logo size="custom" className="w-full h-auto" />
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
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eded21] focus:border-transparent transition-all duration-200"
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
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eded21] focus:border-transparent transition-all duration-200 pr-12"
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
                  className="w-4 h-4 text-[#eded21] bg-slate-700 border-slate-600 rounded focus:ring-[#eded21] focus:ring-offset-slate-900"
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
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-red-400 text-sm font-medium">Login Failed</p>
                    <p className="text-red-300 text-sm mt-1">{error}</p>
                    {error.includes('contact') && (
                      <p className="text-red-300 text-xs mt-2 opacity-80">
                        💡 Need help? Contact your system administrator or support team.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#eded21] text-slate-900 py-3 px-4 rounded-lg font-semibold hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-[#eded21] focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
            



          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden bg-white">
        {/* Main Image - Fill container while preserving aspect ratio */}
        <img
          src={loginBgImage}
          alt="Mysentree AI CRM Consulting"
          className="w-full h-full object-cover"
          style={{
            objectPosition: 'right center',
            objectFit: 'cover'
          }}
        />
      </div>
    </div>
  );
};

export default Login;