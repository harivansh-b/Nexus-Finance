import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Rocket, TrendingUp, Lock, Zap, ChevronRight, Globe, Shield, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

export default function Landing() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="min-h-screen bg-darker text-slate-200 selection:bg-primary/30 selection:text-primary-foreground">
      {/* Dynamic Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px] animate-pulse delay-700" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[150px] animate-pulse delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/50 bg-darker/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <Rocket size={22} className="text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Nexus Finance
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to="/login"
              className="hidden sm:block text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Now Live in Beta
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight leading-[1.1]">
              Trade Crypto with{' '}
              <span className="bg-gradient-to-r from-primary via-blue-400 to-indigo-400 bg-clip-text text-transparent italic">
                Precision
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Experience the next generation of digital asset management. 
              Real-time analytics, institutional-grade security, and seamless trading.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all hover:shadow-2xl hover:shadow-primary/30 flex items-center justify-center gap-2 group"
            >
              Create Your Account
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 border border-slate-700 text-white rounded-2xl font-bold text-lg hover:bg-slate-800/50 transition-all backdrop-blur-sm">
              View Live Markets
            </button>
          </motion.div>

          {/* Abstract Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-darker via-transparent to-transparent z-10" />
            <div className="rounded-3xl border border-slate-700/50 bg-slate-900/50 p-4 backdrop-blur-sm shadow-2xl overflow-hidden aspect-[16/9] flex items-center justify-center group">
               <div className="grid grid-cols-3 gap-4 w-full h-full opacity-40 group-hover:opacity-60 transition-opacity">
                  <div className="col-span-2 bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                    <div className="h-8 w-1/3 bg-slate-700/50 rounded-lg mb-4" />
                    <div className="h-32 bg-primary/10 rounded-xl border border-primary/20" />
                  </div>
                  <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                    <div className="h-8 w-full bg-slate-700/50 rounded-lg mb-4" />
                    <div className="space-y-3">
                      <div className="h-4 w-full bg-slate-700/50 rounded" />
                      <div className="h-4 w-4/5 bg-slate-700/50 rounded" />
                      <div className="h-4 w-2/3 bg-slate-700/50 rounded" />
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                    <div className="h-8 w-full bg-slate-700/50 rounded-lg" />
                  </div>
                  <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                    <div className="h-8 w-full bg-slate-700/50 rounded-lg" />
                  </div>
                  <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                    <div className="h-8 w-full bg-slate-700/50 rounded-lg" />
                  </div>
               </div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white font-medium flex items-center gap-2">
                    <Shield size={18} className="text-primary" />
                    End-to-End Encryption Enabled
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          <motion.div variants={itemVariants} className="group relative">
            <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-2xl group-hover:bg-primary/10 transition-colors" />
            <div className="relative bg-dark/40 border border-slate-800/50 rounded-3xl p-10 hover:border-primary/50 transition-all duration-300 backdrop-blur-sm hover:-translate-y-2">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="text-primary" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Real-time Insights</h3>
              <p className="text-slate-400 leading-relaxed">
                Stay ahead of the market with data that updates every millisecond. Advanced charting and indicators at your fingertips.
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group relative">
             <div className="absolute inset-0 bg-blue-500/5 rounded-3xl blur-2xl group-hover:bg-blue-500/10 transition-colors" />
            <div className="relative bg-dark/40 border border-slate-800/50 rounded-3xl p-10 hover:border-blue-500/50 transition-all duration-300 backdrop-blur-sm hover:-translate-y-2">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="text-blue-400" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Bank-Grade Security</h3>
              <p className="text-slate-400 leading-relaxed">
                Your assets are protected by industry-leading security protocols. 2FA, cold storage, and hybrid authentication ensure peace of mind.
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group relative">
            <div className="absolute inset-0 bg-indigo-500/5 rounded-3xl blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
            <div className="relative bg-dark/40 border border-slate-800/50 rounded-3xl p-10 hover:border-indigo-500/50 transition-all duration-300 backdrop-blur-sm hover:-translate-y-2">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-indigo-400" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Lightning Execution</h3>
              <p className="text-slate-400 leading-relaxed">
                Don't miss a beat. Our high-performance engine ensures your trades are executed instantly with zero slippage.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Section */}
      <section className="border-y border-slate-800/50 bg-dark/20 backdrop-blur-sm py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-4">Trusted by over 50k traders</h2>
              <p className="text-slate-400">Join a global community of investors building their future.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="flex items-center gap-2"><Globe size={24}/> <span className="font-bold">Global</span></div>
               <div className="flex items-center gap-2"><Shield size={24}/> <span className="font-bold">Secure</span></div>
               <div className="flex items-center gap-2"><BarChart3 size={24}/> <span className="font-bold">Analytic</span></div>
               <div className="flex items-center gap-2 font-bold italic">NEXUS</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="relative rounded-[40px] bg-gradient-to-br from-primary/20 via-indigo-500/10 to-transparent border border-white/5 p-12 md:p-20 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to start your journey?</h2>
            <p className="text-slate-400 mb-10 max-w-xl mx-auto text-lg">
              It takes less than 2 minutes to create an account and start trading. No hidden fees, no strings attached.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-darker font-black text-xl rounded-2xl hover:bg-slate-100 transition-all hover:scale-105 active:scale-95"
            >
              Get Started Now
              <ChevronRight size={24} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Rocket size={18} className="text-white" />
                </div>
                <span className="text-lg font-bold text-white">Nexus</span>
              </Link>
              <p className="text-slate-500 text-sm leading-relaxed">
                The world's most advanced crypto trading platform for retail investors.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><Link to="/register" className="hover:text-primary transition-colors">Markets</Link></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">Trading</Link></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Resources</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-800/50 gap-4">
            <p className="text-slate-600 text-xs">&copy; 2026 Nexus Finance. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-600 hover:text-white transition-colors"><Globe size={18}/></a>
              <a href="#" className="text-slate-600 hover:text-white transition-colors"><Shield size={18}/></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
