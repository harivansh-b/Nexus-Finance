import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Mail, Lock, Loader } from 'lucide-react'
import { toast } from 'sonner'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    const success = await login(email, password)
    if (success) {
      toast.success('Login successful!')
      navigate('/dashboard')
    } else {
      toast.error('Login failed. Check your credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-darker via-dark to-darker flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">N</span>
            </div>
            <span className="text-2xl font-bold text-white">Nexus Finance</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Login to your trading account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-dark border border-slate-700 rounded-lg p-8 space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <Loader size={18} className="animate-spin" />}
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark text-slate-400">Or</span>
            </div>
          </div>

          {/* Signup Link */}
          <p className="text-center text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              Create one now
            </Link>
          </p>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          <Link to="#" className="text-sm text-slate-400 hover:text-white transition-colors block">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  )
}
