import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 20000,
})

const normalizeError = (payload, fallbackMessage = 'Request failed') => {
  if (!payload) {
    return { message: fallbackMessage }
  }

  if (typeof payload === 'string') {
    return { message: payload }
  }

  if (payload.error?.message) {
    return {
      ...payload,
      message: payload.error.message,
    }
  }

  if (payload.message) {
    return payload
  }

  return {
    ...payload,
    message: fallbackMessage,
  }
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    return Promise.reject(
      normalizeError(error.response?.data, error.message || 'Request failed')
    )
  }
)

export default apiClient
