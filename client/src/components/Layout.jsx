import { useState } from 'react'
import { useClerk } from '@clerk/clerk-react'
import { useAuthStore } from '../stores/authStore'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, Home, TrendingUp, History, Settings as SettingsIcon } from 'lucide-react'

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
    { path: '/transactions', label: 'Transactions', icon: History },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
  ]

  return (
    <div className="flex h-screen bg-darker">
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-dark border-r border-slate-700 transform transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:relative lg:w-64`}
      >
        <div className="p-6 border-b border-slate-700">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold text-white">Nexus</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(path)
                  ? 'bg-primary text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="mb-4 p-3 bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-400">Balance</p>
            <p className="text-xl font-bold text-white">
              ${user?.balance?.toFixed(2) || '0.00'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 bg-danger/20 text-danger rounded-lg hover:bg-danger/30 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-dark border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-white"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">
              Welcome,{' '}
              <span className="text-white font-semibold">
                {user?.username || user?.email?.split('@')[0]}
              </span>
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
