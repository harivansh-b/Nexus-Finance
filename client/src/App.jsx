import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { useAuthStore } from './stores/authStore'
import { Toaster } from 'sonner'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Portfolio from './pages/Portfolio'
import Transactions from './pages/Transactions'
import Settings from './pages/Settings'

// Components
import ProtectedRoute from './components/ProtectedRoute'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

export default function App() {
  const { initAuth } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [])

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </ClerkProvider>
  )
}
