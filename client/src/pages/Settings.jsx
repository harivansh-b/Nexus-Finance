import { useState } from 'react'
import { useClerk } from '@clerk/clerk-react'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { Settings as SettingsIcon, Bell, Lock, CreditCard, Shield, User as UserIcon, LogOut, ChevronRight, ToggleLeft as ToggleIcon } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import RazorpayModal from '../components/RazorpayModal'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

export default function Settings() {
  const { user, logout, fetchCurrentUser } = useAuthStore()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('general')
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false)
  
  // Notification states initialized to false (OFF)
  const [notifications, setNotifications] = useState({
    email: false,
    price: false,
    trades: false,
    security: false
  })

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
    toast.info(`Notification preference updated`)
  }

  const handleLogout = async () => {
    if (user?.authMethod === 'clerk') {
      await signOut()
    }

    logout()
    toast.success('Securely logged out')
    navigate('/login')
  }

  const tabs = [
    { id: 'general', label: 'Identity', icon: UserIcon },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'security', label: 'Protection', icon: Shield },
    { id: 'billing', label: 'Finance', icon: CreditCard },
  ]

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10 pb-20"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
            <SettingsIcon size={14} />
            System Configuration
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">User Settings</h1>
          <p className="text-slate-400 font-medium">Manage your terminal preferences and account security.</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-10 items-start">
        {/* Sidebar Tabs */}
        <motion.div variants={itemVariants} className="space-y-2">
          {tabs.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 ${
                  active
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4 font-bold tracking-tight">
                   <tab.icon size={20} className={active ? 'scale-110' : ''} />
                   {tab.label}
                </div>
                {active && <ChevronRight size={16} />}
              </button>
            )
          })}
          
          <div className="pt-8 mt-8 border-t border-white/5">
             <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-6 py-4 text-rose-500 font-bold hover:bg-rose-500/5 rounded-2xl transition-all"
              >
                <LogOut size={20} />
                Sign Out
              </button>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[40px] border border-white/5 bg-slate-900/40 p-1 md:p-2 shadow-2xl backdrop-blur-xl">
           <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
           <div className="relative rounded-[36px] bg-slate-950/80 p-8 md:p-12 min-h-[500px] border border-white/5">
              <AnimatePresence mode="wait">
                 {activeTab === 'general' && (
                   <motion.div
                     key="general"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-8"
                   >
                     <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-8">Identity Profile</h2>
                     <div className="grid gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Email Address</label>
                           <div className="px-6 py-4 bg-slate-900/50 border border-white/5 rounded-2xl text-white font-medium">
                              {user?.email || 'N/A'}
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Account Callsign</label>
                           <div className="px-6 py-4 bg-slate-900/50 border border-white/5 rounded-2xl text-white font-medium">
                              {user?.username || 'N/A'}
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Authentication Layer</label>
                           <div className="px-6 py-4 bg-slate-900/50 border border-white/5 rounded-2xl text-primary font-bold">
                              {user?.authMethod === 'clerk' ? 'CLERK SECURE PROTOCOL' : 'STANDARD CREDENTIALS'}
                           </div>
                        </div>
                     </div>
                   </motion.div>
                 )}

                 {activeTab === 'notifications' && (
                   <motion.div
                     key="notifications"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-8"
                   >
                     <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-8">Alert Protocols</h2>
                     <div className="space-y-4">
                       {[
                         { id: 'email', label: 'Email Dispatch', desc: 'Receive intelligence reports via email' },
                         { id: 'price', label: 'Price Sensors', desc: 'Real-time alerts for market volatility' },
                         { id: 'trades', label: 'Execution Logs', desc: 'Confirmations for every successful trade' },
                         { id: 'security', label: 'Security Uplink', desc: 'Critical notifications about access attempts' },
                       ].map((n) => (
                         <div key={n.id} className="group flex items-center justify-between p-6 bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 rounded-3xl transition-all">
                           <div className="space-y-1">
                             <p className="text-white font-black tracking-tight">{n.label}</p>
                             <p className="text-xs text-slate-500 font-medium">{n.desc}</p>
                           </div>
                           <button 
                             onClick={() => toggleNotification(n.id)}
                             className={`w-14 h-8 rounded-full transition-all duration-300 relative ${notifications[n.id] ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-slate-800'}`}
                           >
                              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 ${notifications[n.id] ? 'left-7' : 'left-1'}`} />
                           </button>
                         </div>
                       ))}
                     </div>
                   </motion.div>
                 )}

                 {activeTab === 'security' && (
                   <motion.div
                     key="security"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-8"
                   >
                     <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-8">Asset Protection</h2>
                     
                     <div className="space-y-8">
                       <section>
                         <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Credential Rotation</h3>
                         {user?.authMethod === 'custom' ? (
                           <div className="space-y-4 max-w-md">
                             <input
                               type="password"
                               placeholder="Current Access Key"
                               className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:border-primary outline-none transition-all"
                             />
                             <input
                               type="password"
                               placeholder="New Access Key"
                               className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:border-primary outline-none transition-all"
                             />
                             <button className="px-8 py-4 bg-primary text-white font-black text-xs tracking-widest rounded-2xl hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20">
                               UPDATE PROTOCOLS
                             </button>
                           </div>
                         ) : (
                           <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-300 font-medium">
                              Security layers are managed via Clerk Secure Uplink. Visit Clerk dashboard for rotations.
                           </div>
                         )}
                       </section>

                       <div className="pt-8 border-t border-white/5">
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">
                             Nexus Finance uses institutional-grade encryption for all data storage. Your assets are secured by hybrid authentication protocols.
                          </p>
                       </div>
                     </div>
                   </motion.div>
                 )}

                 {activeTab === 'billing' && (
                   <motion.div
                     key="billing"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-8"
                   >
                     <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-8">Capital Funding</h2>

                     <div className="rounded-[32px] bg-gradient-to-br from-primary/10 to-indigo-500/10 p-8 border border-white/5">
                       <p className="text-white font-bold mb-4">Inject liquidity into your terminal via Razorpay Secure.</p>
                       <button
                         onClick={() => setRazorpayModalOpen(true)}
                         className="px-10 py-5 bg-white text-slate-950 font-black text-sm tracking-widest rounded-2xl hover:bg-slate-100 transition-all active:scale-95 shadow-xl"
                       >
                         INITIALIZE DEPOSIT
                       </button>
                     </div>

                     <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 space-y-2">
                       <p className="text-white font-black tracking-tight">Payment Protocols</p>
                       <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          We accept all major credit cards, UPI, and bank transfers through Razorpay. Deposits are credited to your account instantly after verification.
                       </p>
                     </div>
                   </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </motion.div>
      </div>

      <RazorpayModal
        isOpen={razorpayModalOpen}
        onClose={() => setRazorpayModalOpen(false)}
        onSuccess={() => {
          fetchCurrentUser()
        }}
      />
    </motion.div>
  )
}
