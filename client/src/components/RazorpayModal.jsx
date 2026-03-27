import { useState } from 'react'
import { X, Loader, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import apiClient from '../services/api'

export default function RazorpayModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) < 1) {
      setError('Amount must be at least ₹1')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Step 1: Create Razorpay order
      const orderResponse = await apiClient.post('/razorpay/create-order', {
        amount: parseFloat(amount),
      })

      const { orderId, key } = orderResponse.data

      // Step 2: Open Razorpay checkout
      const options = {
        key: key,
        amount: parseFloat(amount) * 100, // Convert to paise
        currency: 'INR',
        name: 'Nexus Finance',
        description: 'Wallet Top-up',
        order_id: orderId,
        handler: async (response) => {
          try {
            // Step 3: Verify payment on backend
            const verifyResponse = await apiClient.post('/razorpay/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })

            if (verifyResponse.data.success) {
              toast.success(`Payment successful! ₹${amount} added to your account.`)
              setAmount('')
              onClose()
              if (onSuccess) onSuccess(verifyResponse.data)
            }
          } catch (err) {
            setError('Payment verification failed. Please contact support.')
            console.error('Verification error:', err)
          }
        },
        prefill: {
          name: 'Trader',
          email: 'trader@nexus-finance.com',
        },
        notes: {
          description: 'Nexus Finance Wallet Top-up',
        },
        theme: {
          color: '#6366F1',
        },
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)
      }

      const razorpayCheckout = new window.Razorpay(options)
      razorpayCheckout.open()
    } catch (err) {
      setError(err.message || 'Failed to initiate payment')
      toast.error('Payment initiation failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark border border-slate-700 rounded-lg max-w-md w-full p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add Funds</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Info */}
        <p className="text-slate-400 mb-6">Enter the amount you want to add to your wallet</p>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-white mb-2">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setError('')
            }}
            placeholder="0.00"
            min="1"
            step="1"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
          />
          <p className="text-xs text-slate-400 mt-1">Minimum: ₹1</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-danger/10 border border-danger/30 rounded-lg p-3 mb-6 flex items-center gap-2">
            <AlertCircle size={18} className="text-danger" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {/* Summary */}
        {amount && (
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Amount</span>
              <span className="text-white font-semibold">₹{parseFloat(amount).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handlePayment}
            disabled={isLoading || !amount}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <Loader size={18} className="animate-spin" />}
            {isLoading ? 'Processing...' : 'Pay with Razorpay'}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-slate-500 text-center mt-6">
          Powered by Razorpay. Your payment is secure and encrypted.
        </p>
      </div>
    </div>
  )
}
