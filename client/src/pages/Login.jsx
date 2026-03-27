import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { SignInButton } from '@clerk/clerk-react'
import { useAuthStore } from '../stores/authStore'
import { Mail, Lock, Loader, ArrowRight, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import icon from '../assets/icon.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    const success = await login(email, password)
    if (success) {
      toast.success('Access granted. Welcome back!')
      navigate('/dashboard')
    } else {
      toast.error(error || 'Authentication failed. Please check your credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-darker text-slate-200 selection:bg-primary/30 selection:text-primary-foreground flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[150px] animate-pulse delay-1000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 group mb-8">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 group-hover:rotate-12 transition-transform duration-300 overflow-hidden">
              <img src={icon} alt="Nexus Finance" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-3xl font-black text-white tracking-tighter uppercase">Nexus</span>
          </Link>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Security Gateway</h1>
          <p className="text-slate-400 font-medium">Verify your identity to access the trading floor.</p>
        </div>

        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.4, delay: 0.2 }}
           className="relative rounded-[40px] border border-white/5 bg-slate-900/40 p-1 md:p-2 shadow-2xl backdrop-blur-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5 pointer-events-none" />
          <form onSubmit={handleSubmit} className="relative rounded-[36px] bg-slate-950/80 p-8 md:p-12 space-y-8 border border-white/5">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Personnel ID (Email)</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:bg-slate-900 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                 <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Access Key (Password)</label>
                    <Link to="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-colors">Forgot Key?</Link>
                 </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:bg-slate-900 transition-all font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg tracking-widest hover:bg-primary/90 disabled:bg-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-95 flex items-center justify-center gap-3 group"
              >
                {isLoading ? (
                  <Loader size={24} className="animate-spin" />
                ) : (
                  <>
                    AUTHORIZE ACCESS
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="relative py-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <span className="relative px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] bg-transparent">Social Sync</span>
              </div>

              <SignInButton mode="modal">
                <button
                  type="button"
                  className="w-full h-16 border border-white/10 hover:border-white/20 bg-white/5 text-white rounded-2xl font-bold tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                >
                  <ShieldCheck size={20} className="text-indigo-400" />
                  Continue with Clerk
                </button>
              </SignInButton>
            </div>

            <p className="text-center text-slate-500 text-sm font-medium">
              New to the platform?{' '}
              <Link to="/register" className="text-primary hover:text-white transition-colors font-black uppercase tracking-widest ml-1 underline underline-offset-4 decoration-primary/30">
                Register
              </Link>
            </p>
          </form>
        </motion.div>
        
        <p className="mt-12 text-center text-[10px] font-bold text-slate-600 uppercase tracking-[0.5em]">
          &copy; 2026 Nexus Finance &bull; End-to-End Encrypted
        </p>
      </motion.div>
    </div>
  )
}
