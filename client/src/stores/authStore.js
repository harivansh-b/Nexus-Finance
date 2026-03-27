import { create } from 'zustand'
import apiClient from '../services/api'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initAuth: () => {
    const token = localStorage.getItem('authToken')
    const user = localStorage.getItem('user')

    if (token && user) {
      set({ user: JSON.parse(user), isAuthenticated: true })
    }
  },

  register: async (email, password, username) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        username,
      })
      const { user, token } = response.data
      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ user, isAuthenticated: true })
      return true
    } catch (error) {
      const message = error.message || 'Registration failed'
      set({ error: message })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const { user, token } = response.data
      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ user, isAuthenticated: true })
      return true
    } catch (error) {
      const message = error.message || 'Login failed'
      set({ error: message })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  syncClerkAuth: async (clerkUser) => {
    set({ isLoading: true, error: null })
    try {
      const primaryEmail =
        clerkUser?.primaryEmailAddress?.emailAddress ||
        clerkUser?.emailAddresses?.[0]?.emailAddress

      const username =
        clerkUser?.username ||
        [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') ||
        primaryEmail?.split('@')[0]

      const response = await apiClient.post('/auth/clerk-auth', {
        clerkId: clerkUser?.id,
        email: primaryEmail,
        username,
        profileImage: clerkUser?.imageUrl,
      })

      const { user, token } = response.data
      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ user, isAuthenticated: true })
      return true
    } catch (error) {
      const message = error.message || 'Clerk authentication failed'
      set({ error: message })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  fetchCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me')
      const user = response.data
      localStorage.setItem('user', JSON.stringify(user))
      set({ user, isAuthenticated: true })
      return user
    } catch (error) {
      set({ error: error.message || 'Failed to fetch user' })
      return null
    }
  },

  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    set({ user: null, isAuthenticated: false, error: null })
  },

  updateUser: (user) => {
    set({ user })
    localStorage.setItem('user', JSON.stringify(user))
  },
}))
