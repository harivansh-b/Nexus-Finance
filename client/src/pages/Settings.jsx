import { useState } from 'react'
import { useClerk } from '@clerk/clerk-react'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { Settings as SettingsIcon, Bell, Lock, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import RazorpayModal from '../components/RazorpayModal'

export default function Settings() {
  const { user, logout, fetchCurrentUser } = useAuthStore()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('general')
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false)

  const handleLogout = async () => {
    if (user?.authMethod === 'clerk') {
      await signOut()
    }

    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account preferences</p>
      </div>

      <div className="flex gap-4 mb-8 border-b border-slate-700">
        {[
          { id: 'general', label: 'General', icon: SettingsIcon },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security', icon: Lock },
          { id: 'billing', label: 'Billing', icon: CreditCard },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      <div className="bg-dark border border-slate-700 rounded-lg p-8">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">General Settings</h2>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Username</label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Account Type</label>
              <input
                type="text"
                value={user?.authMethod === 'clerk' ? 'Clerk Authentication' : 'Email & Password'}
                disabled
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>

            <div className="space-y-4">
              {[
                { label: 'Email Notifications', desc: 'Receive emails for trading activities' },
                { label: 'Price Alerts', desc: 'Get notified when prices hit your targets' },
                { label: 'Trade Confirmations', desc: 'Receive confirmation for every trade' },
                { label: 'Security Alerts', desc: 'Important security notifications' },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-semibold">{label}</p>
                    <p className="text-sm text-slate-400">{desc}</p>
                  </div>
                  <div className="w-12 h-6 bg-primary rounded-full cursor-pointer"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
              {user?.authMethod === 'custom' ? (
                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="Current Password"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500"
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500"
                  />
                  <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                    Update Password
                  </button>
                </div>
              ) : (
                <p className="text-slate-400">Password management is handled by Clerk</p>
              )}
            </div>

            <div className="pt-6 border-t border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
              <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                Enable 2FA
              </button>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Billing & Payments</h2>

            <div className="bg-slate-800/50 rounded-lg p-6">
              <p className="text-slate-400 mb-4">Add funds to your account using Razorpay</p>
              <button
                onClick={() => setRazorpayModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Add Funds
              </button>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Payment Methods</h3>
              <p className="text-slate-400">Razorpay accepts all major cards and payment methods</p>
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="bg-danger/20 hover:bg-danger/30 text-danger px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <RazorpayModal
        isOpen={razorpayModalOpen}
        onClose={() => setRazorpayModalOpen(false)}
        onSuccess={() => {
          fetchCurrentUser()
        }}
      />
    </div>
  )
}
