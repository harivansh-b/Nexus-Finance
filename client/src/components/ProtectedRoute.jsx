import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useAuthStore } from '../stores/authStore'
import Layout from './Layout'

function ClerkProtectedRoute() {
  const { isAuthenticated } = useAuthStore()
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return null
  }

  if (isSignedIn && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-darker flex items-center justify-center text-slate-300">
        Syncing your account...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function BasicProtectedRoute() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default function ProtectedRoute() {
  const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

  return clerkEnabled ? <ClerkProtectedRoute /> : <BasicProtectedRoute />
}
