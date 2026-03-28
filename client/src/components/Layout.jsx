import { useState } from 'react'
import { useClerk } from '@clerk/clerk-react'
import { useAuthStore } from '../stores/authStore'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, Home, TrendingUp, History, Settings as SettingsIcon, Bell, ChevronRight, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatBot from './ChatBot'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const { signOut } = useClerk()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (user?.authMethod === 'clerk') {
      await signOut()
    }

    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/portfolio', label: 'Portfolio', icon: TrendingUp },
    { path: '/watchlist', label: 'Watchlist', icon: Heart },
    { path: '/transactions', label: 'Transactions', icon: History },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
  ]

  return (
    <div className="flex h-screen bg-darker text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-dark/50 backdrop-blur-2xl border-r border-white/5 transform transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-8">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-300">
                <span className="text-white font-black text-2xl tracking-tighter">N</span>
              </div>
              <div>
                 <span className="text-xl font-black text-white block tracking-tight">NEXUS</span>
                 <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Finance</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {menuItems.map(({ path, label, icon: Icon }) => {
              const active = isActive(path)
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
                    active
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={22} className={active ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                  <span className="font-bold tracking-tight">{label}</span>
                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white"
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Bottom Card */}
          <div className="p-6">
             <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 border border-white/5 group">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Balance</p>
                <p className="text-2xl font-black text-white mb-4 tracking-tight">
                  ${user?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                </p>
                <button 
                  onClick={() => navigate('/portfolio')}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 group/btn"
                >
                  Management
                  <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
             </div>
             
             <button
                onClick={handleLogout}
                className="w-full mt-6 flex items-center justify-center gap-3 px-6 py-4 text-rose-500 font-bold hover:bg-rose-500/5 rounded-2xl transition-all duration-300 active:scale-95"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-darker/50 backdrop-blur-md border-b border-white/5 px-8 flex items-center justify-between z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="hidden sm:block">
               <h2 className="text-sm font-bold text-white">
                  {location.pathname === '/dashboard' ? 'Overview' : 
                   location.pathname.split('/')[1].charAt(0).toUpperCase() + location.pathname.split('/')[1].slice(1)}
               </h2>
               <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
               </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
               <Bell size={22} />
               <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-darker" />
            </button>
            
            <div className="h-8 w-[1px] bg-white/5 mx-2" />

            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white group-hover:text-primary transition-colors">
                  {user?.username || user?.email?.split('@')[0]}
                </p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center justify-end gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  Verified
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">
                {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 no-scrollbar scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <ChatBot />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
