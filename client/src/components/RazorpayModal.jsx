import { useState } from 'react'
import { X, Loader, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import apiClient from '../services/api'
import { loadRazorpayScript } from '../services/razorpay'
import { useAuthStore } from '../stores/authStore'

export default function RazorpayModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, fetchCurrentUser } = useAuthStore()

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) < 1) {
      setError('Amount must be at least Rs 1')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const orderResponse = await apiClient.post('/razorpay/create-order', {
        amount: parseFloat(amount),
      })

      const { orderId, key, currency } = orderResponse.data
      const isLoaded = await loadRazorpayScript()

      if (!isLoaded || !window.Razorpay) {
        throw new Error('Razorpay checkout failed to load')
      }

      const options = {
        key,
        amount: parseFloat(amount) * 100,
        currency: currency || 'INR',
        name: 'Nexus Finance',
        description: 'Wallet Top-up',
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyResponse = await apiClient.post('/razorpay/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })

            if (verifyResponse.success) {
              await fetchCurrentUser()
              toast.success(`Payment successful! Rs ${amount} added to your account.`)
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
          name: user?.username || user?.email?.split('@')[0] || 'Trader',
          email: user?.email || '',
        },
        notes: {
          description: 'Nexus Finance Wallet Top-up',
        },
        theme: {
          color: '#6366F1',
        },
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add Funds</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-slate-400 mb-6">Enter the amount you want to add to your wallet</p>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-white mb-2">Amount (Rs)</label>
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
          <p className="text-xs text-slate-400 mt-1">Minimum: Rs 1</p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 rounded-lg p-3 mb-6 flex items-center gap-2">
            <AlertCircle size={18} className="text-danger" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {amount && (
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Amount</span>
              <span className="text-white font-semibold">Rs {parseFloat(amount).toFixed(2)}</span>
            </div>
          </div>
        )}

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

        <p className="text-xs text-slate-500 text-center mt-6">
          Powered by Razorpay. Your payment is secure and encrypted.
        </p>
      </div>
    </div>
  )
}
