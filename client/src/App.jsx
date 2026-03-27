import { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-react'
import { useAuthStore } from './stores/authStore'
import { Toaster } from 'sonner'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Portfolio from './pages/Portfolio'
import Transactions from './pages/Transactions'
import Settings from './pages/Settings'

import ProtectedRoute from './components/ProtectedRoute'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function ClerkAuthSync() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const { user: appUser, isAuthenticated, syncClerkAuth, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const hasAttemptedSync = useRef(false)

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      hasAttemptedSync.current = false
      if (appUser?.authMethod === 'clerk') {
        logout()
      }
      return
    }

    if (isAuthenticated && appUser?.clerkId === user?.id) {
      hasAttemptedSync.current = true
      return
    }

    if (!user || hasAttemptedSync.current) return

    hasAttemptedSync.current = true
    syncClerkAuth(user).then((success) => {
      if (success && ['/login', '/register', '/'].includes(location.pathname)) {
        navigate('/dashboard', { replace: true })
      }
    })
  }, [
    appUser?.authMethod,
    appUser?.clerkId,
    isAuthenticated,
    isLoaded,
    isSignedIn,
    location.pathname,
    logout,
    navigate,
    syncClerkAuth,
    user,
  ])

  return null
}

export default function App() {
  const { initAuth } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <BrowserRouter>
        <ClerkAuthSync />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </ClerkProvider>
  )
}
