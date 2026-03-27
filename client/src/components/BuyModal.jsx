import { useState } from 'react'
import { useTradeStore } from '../stores/tradeStore'
import { useAuthStore } from '../stores/authStore'
import { X, Loader } from 'lucide-react'
import { toast } from 'sonner'

export default function BuyModal({ crypto, onClose }) {
  const [amount, setAmount] = useState('')
  const [usdAmount, setUsdAmount] = useState('0.00')
  const { buyCrypto, isLoading } = useTradeStore()
  const { user } = useAuthStore()

  const handleAmountChange = (e) => {
    const value = e.target.value
    setAmount(value)
    if (value && !isNaN(value)) {
      const usd = (parseFloat(value) * crypto.currentPrice).toFixed(2)
      setUsdAmount(usd)
    } else {
      setUsdAmount('0.00')
    }
  }

  const handleBuy = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const totalCost = parseFloat(amount) * crypto.currentPrice

    if (totalCost > user.balance) {
      toast.error('Insufficient balance')
      return
    }

    try {
      await buyCrypto(crypto, parseFloat(amount))
      toast.success(`${amount} ${crypto.symbol} purchased!`)
      onClose()
    } catch (error) {
      toast.error(error.message || 'Failed to purchase')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark border border-slate-700 rounded-lg max-w-md w-full p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            {crypto.image && (
              <img src={crypto.image} alt={crypto.name} className="w-10 h-10 rounded-full" />
            )}
            <div>
              <h2 className="text-xl font-bold text-white">{crypto.name}</h2>
              <p className="text-sm text-slate-400">${crypto.currentPrice?.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Amount ({crypto.symbol})
            </label>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              step="0.00000001"
              min="0"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* USD Value */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">USD Value</label>
            <input
              type="text"
              value={`$${usdAmount}`}
              disabled
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed"
            />
          </div>

          {/* Summary */}
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Your Balance</span>
              <span className="text-white font-semibold">${user?.balance?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-700 pt-2">
              <span className="text-slate-400">After Purchase</span>
              <span className={`font-semibold ${parseFloat(usdAmount) > user?.balance ? 'text-danger' : 'text-success'}`}>
                ${Math.max(0, user?.balance - parseFloat(usdAmount)).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {parseFloat(usdAmount) > user?.balance && (
            <div className="bg-danger/10 border border-danger/30 rounded-lg p-3">
              <p className="text-sm text-danger">Insufficient balance</p>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleBuy}
              disabled={isLoading || !amount || parseFloat(usdAmount) > user?.balance}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && <Loader size={18} className="animate-spin" />}
              {isLoading ? 'Processing...' : 'Buy Now'}
            </button>
            <button
              onClick={onClose}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
