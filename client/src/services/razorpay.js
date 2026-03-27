import apiClient from './api'

// Create Razorpay order
export const createRazorpayOrder = async (amount) => {
  const response = await apiClient.post('/razorpay/create-order', { amount })
  return response.data
}

// Verify payment
export const verifyPayment = async (paymentData) => {
  const response = await apiClient.post('/razorpay/verify-payment', paymentData)
  return response.data
}

// Get payment history
export const getPaymentHistory = async (page = 1, limit = 20) => {
  const response = await apiClient.get('/razorpay/payments', {
    params: { page, limit },
  })
  return response.data
}

// Load Razorpay script
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// Open Razorpay checkout
export const openRazorpayCheckout = (options) => {
  return new Promise((resolve, reject) => {
    try {
      const razorpay = new window.Razorpay(options)
      razorpay.open()
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}
