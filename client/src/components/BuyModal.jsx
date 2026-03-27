import { useState, useEffect } from 'react'
import { useTradeStore } from '../stores/tradeStore'
import { useAuthStore } from '../stores/authStore'
import { X, Loader, Info, ArrowDown, Wallet, Zap, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatCryptoAmount } from '../utils/formatting'

export default function BuyModal({ crypto, onClose }) {
  const [amount, setAmount] = useState('')
  const [usdAmount, setUsdAmount] = useState('0.00')
  const { buyCrypto, isLoading } = useTradeStore()
  const { user } = useAuthStore()
  const currentPrice = Number(crypto?.currentPrice) || 0
  const hasValidPrice = currentPrice > 0

  const FEE_PERCENTAGE = 0.001 // 0.1% fee
  const estimatedFee = parseFloat(usdAmount) * FEE_PERCENTAGE
  const totalWithFee = parseFloat(usdAmount) + estimatedFee

  useEffect(() => {
    if (amount && !isNaN(amount) && hasValidPrice) {
      const usd = (parseFloat(amount) * currentPrice).toFixed(2)
      setUsdAmount(usd)
    } else {
      setUsdAmount('0.00')
    }
  }, [amount, currentPrice, hasValidPrice])

  const handleAmountChange = (e) => {
    const value = e.target.value
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)) {
      setAmount(value)
    }
  }

  const setPercentage = (percent) => {
    if (!user?.balance || !hasValidPrice) return
    const targetUsd = user.balance * (percent / 100)
    const cryptoAmount = (targetUsd / currentPrice).toFixed(8)
    setAmount(cryptoAmount)
  }

  const handleBuy = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (!hasValidPrice) {
      toast.error('Live price is not available right now. Please try again.')
      return
    }

    if (totalWithFee > user.balance) {
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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-[32px] max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative p-6 pb-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Zap className="text-primary" size={20} />
              Quick Buy
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5">
            {crypto.image && (
              <img src={crypto.image} alt={crypto.name} className="w-12 h-12 rounded-2xl shadow-lg" />
            )}
            <div>
              <h3 className="font-bold text-white">{crypto.name}</h3>
              <p className="text-sm font-black text-primary">
                {hasValidPrice ? formatCurrency(currentPrice) : 'Price unavailable'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Amount to Spend (USD)
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Wallet size={18} />
                </div>
                <input
                  type="number"
                  value={usdAmount}
                  onChange={(e) => {
                    const usd = e.target.value
                    setUsdAmount(usd)
                    if (usd && !isNaN(usd) && hasValidPrice) {
                       setAmount((parseFloat(usd) / currentPrice).toFixed(8))
                    } else {
                       setAmount('')
                    }
                  }}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl pl-11 pr-4 py-4 text-white font-black placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-center -my-3 relative z-10">
              <div className="bg-slate-900 p-2 rounded-xl border border-white/10 text-primary">
                <ArrowDown size={16} />
              </div>
            </div>

            <div className="relative">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                You will receive ({crypto.symbol})
              </label>
              <input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-4 text-white font-black placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all"
              />
              <div className="flex gap-2 mt-3">
                {[25, 50, 75, 100].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => setPercentage(percent)}
                    className="flex-1 py-1.5 rounded-lg bg-white/5 text-[10px] font-black text-slate-400 hover:bg-primary/20 hover:text-primary transition-all border border-white/5"
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 rounded-3xl bg-white/5 border border-white/5">
             <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500 uppercase tracking-wider">Available Balance</span>
                <span className="text-white">{formatCurrency(user?.balance || 0)}</span>
             </div>
             <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500 uppercase tracking-wider">Transaction Fee (0.1%)</span>
                <span className="text-white">{formatCurrency(estimatedFee)}</span>
             </div>
             <div className="h-px bg-white/5" />
             <div className="flex justify-between text-sm font-black">
                <span className="text-slate-400 uppercase tracking-wider">Total Cost</span>
                <span className={totalWithFee > user?.balance ? 'text-rose-500' : 'text-emerald-500'}>
                  {formatCurrency(totalWithFee)}
                </span>
             </div>
          </div>

          {totalWithFee > user?.balance && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
               <Info size={16} />
               <p className="text-[10px] font-bold uppercase tracking-wider">Insufficient balance</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl bg-white/5 text-slate-400 font-black text-sm tracking-widest hover:bg-white/10 transition-all border border-white/5"
            >
              CANCEL
            </button>
            <button
              onClick={handleBuy}
              disabled={isLoading || !amount || !hasValidPrice || totalWithFee > user?.balance}
              className="flex-[2] py-4 rounded-2xl bg-primary text-white font-black text-sm tracking-widest hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
              {isLoading ? 'PROCESSING...' : 'CONFIRM BUY'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
