import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Rocket, TrendingUp, Lock, Zap } from 'lucide-react'

export default function Landing() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated])

  return (
    <div className="min-h-screen bg-gradient-to-br from-darker via-dark to-darker">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-dark/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Rocket size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">Nexus Finance</span>
          </Link>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Trade Crypto with{' '}
          <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Confidence
          </span>
        </h1>
        <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
          Real-time crypto trading, advanced portfolio tracking, and seamless payments. All in one platform.
        </p>
        <div className="flex gap-4 justify-center mb-16">
          <Link
            to="/register"
            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Get Started Free
          </Link>
          <button className="px-8 py-3 border border-slate-600 text-white rounded-lg hover:border-slate-500 transition-colors">
            Learn More
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-dark/50 border border-slate-700 rounded-lg p-8 hover:border-primary transition-colors">
            <TrendingUp className="text-primary mx-auto mb-4" size={40} />
            <h3 className="text-xl font-semibold text-white mb-2">Real-time Prices</h3>
            <p className="text-slate-400">Live crypto prices updating every 5 seconds</p>
          </div>

          <div className="bg-dark/50 border border-slate-700 rounded-lg p-8 hover:border-primary transition-colors">
            <Lock className="text-primary mx-auto mb-4" size={40} />
            <h3 className="text-xl font-semibold text-white mb-2">Secure & Safe</h3>
            <p className="text-slate-400">Enterprise-grade security with hybrid authentication</p>
          </div>

          <div className="bg-dark/50 border border-slate-700 rounded-lg p-8 hover:border-primary transition-colors">
            <Zap className="text-primary mx-auto mb-4" size={40} />
            <h3 className="text-xl font-semibold text-white mb-2">Fast Trading</h3>
            <p className="text-slate-400">Execute trades instantly with real market data</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-20 py-8 text-center text-slate-400">
        <p>&copy; 2024 Nexus Finance. All rights reserved.</p>
      </footer>
    </div>
  )
}
