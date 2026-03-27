import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { SignUpButton } from '@clerk/clerk-react'
import { useAuthStore } from '../stores/authStore'
import { Mail, Lock, User, Loader, UserPlus, ShieldCheck, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import icon from '../assets/icon.png'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const { register, isLoading, error } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password || !username) {
      toast.error('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    const success = await register(email, password, username)
    if (success) {
      toast.success('Account initialized. Welcome to Nexus!')
      navigate('/dashboard')
    } else {
      toast.error(error || 'Initialization failed. Email may already be registered.')
    }
  }

  return (
    <div className="min-h-screen bg-darker text-slate-200 selection:bg-primary/30 selection:text-primary-foreground flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[150px] animate-pulse delay-1000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[520px] relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 group mb-6">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 group-hover:rotate-12 transition-transform duration-300 overflow-hidden">
              <img src={icon} alt="Nexus Finance" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-3xl font-black text-white tracking-tighter uppercase">Nexus</span>
          </Link>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Create Account</h1>
          <p className="text-slate-400 font-medium">Join 50k+ traders worldwide.</p>
        </div>

        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.4, delay: 0.2 }}
           className="relative rounded-[40px] border border-white/5 bg-slate-900/40 p-1 md:p-2 shadow-2xl backdrop-blur-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5 pointer-events-none" />
          <form onSubmit={handleSubmit} className="relative rounded-[36px] bg-slate-950/80 p-8 md:p-12 space-y-6 border border-white/5">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Callsign (Username)</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Satoshi77"
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:bg-slate-900 transition-all font-medium"
                    required
                  />
                </div>
              </div>

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
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Access Key (Password)</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:bg-slate-900 transition-all font-medium"
                    required
                  />
                </div>
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-1">Min 6 characters required</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg tracking-widest hover:bg-primary/90 disabled:bg-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-95 flex items-center justify-center gap-3 group"
              >
                {isLoading ? (
                  <Loader size={24} className="animate-spin" />
                ) : (
                  <>
                    INITIALIZE ACCOUNT
                    <UserPlus size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="relative py-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <span className="relative px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] bg-transparent">Social Sync</span>
              </div>

              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="w-full h-16 border border-white/10 hover:border-white/20 bg-white/5 text-white rounded-2xl font-bold tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                >
                  <ShieldCheck size={20} className="text-indigo-400" />
                  Sign up with Clerk
                </button>
              </SignUpButton>
            </div>

            <p className="text-center text-slate-500 text-sm font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-white transition-colors font-black uppercase tracking-widest ml-1 underline underline-offset-4 decoration-primary/30">
                Log In
              </Link>
            </p>
            
            <p className="text-[9px] font-bold text-slate-600 text-center uppercase tracking-[0.2em] leading-relaxed">
              By initializing, you agree to our <br/> 
              <span className="text-slate-500 cursor-pointer hover:text-white transition-colors">Terms of Operations</span> & <span className="text-slate-500 cursor-pointer hover:text-white transition-colors">Privacy Protocols</span>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}
