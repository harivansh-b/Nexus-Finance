import { useState, useEffect } from 'react'
import { X, Loader, AlertCircle, ShieldCheck, Wallet, Zap, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../services/api'
import { loadRazorpayScript } from '../services/razorpay'
import { useAuthStore } from '../stores/authStore'

export default function RazorpayModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [exchangeRate, setExchangeRate] = useState(null)
  const [isFetchingRate, setIsFetchingRate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, fetchCurrentUser } = useAuthStore()

  useEffect(() => {
    if (isOpen) {
      fetchExchangeRate()
    }
  }, [isOpen])

  const fetchExchangeRate = async () => {
    setIsFetchingRate(true)
    try {
      const response = await apiClient.get('/razorpay/exchange-rate')
      if (response.success) {
        setExchangeRate(response.data.rate)
      }
    } catch (err) {
      console.error('Failed to fetch rate:', err)
      setExchangeRate(0.012) // Fallback
    } finally {
      setIsFetchingRate(false)
    }
  }

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) < 1) {
      setError('Minimum liquidity injection is Rs 1')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // 1. Create order on the server
      const response = await apiClient.post('/razorpay/create-order', {
        amount: parseFloat(amount),
      })

      if (!response?.success) {
        // Correctly handle the error structure from server
        const errorMsg = response?.error?.message || response?.message || 'Failed to initialize order'
        throw new Error(errorMsg)
      }

      const { orderId, key, currency, isMock, exchangeRate: currentRate } = response.data
      setExchangeRate(currentRate)
      
      // SIMULATION MODE
      if (isMock) {
        // Simulate a small delay for "processing"
        await new Promise(resolve => setTimeout(resolve, 2000))

        const verifyResponse = await apiClient.post('/razorpay/verify-payment', {
          razorpay_order_id: orderId,
          razorpay_payment_id: `mock_payment_${Date.now()}`,
          razorpay_signature: 'mock_signature',
          isMock: true,
          amount: parseFloat(amount)
        })

        if (verifyResponse.data?.success) {
          const creditedUSD = verifyResponse.data.data.amountUSD || (parseFloat(amount) * currentRate)
          await fetchCurrentUser()
          toast.success(`Protocol Confirmed: $${creditedUSD.toFixed(2)} credited.`)
          setAmount('')
          onClose()
          if (onSuccess) onSuccess(verifyResponse.data.data)
        } else {
          throw new Error('Simulation verification failed')
        }
        return
      }

      // REAL FLOW
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Razorpay secure uplink failed to initialize')
      }

      const options = {
        key,
        amount: parseFloat(amount) * 100,
        currency: currency || 'INR',
        name: 'Nexus Finance',
        description: 'Capital Liquidity Injection',
        order_id: orderId,
        handler: async (paymentResponse) => {
          setIsLoading(true)
          try {
            const verifyResponse = await apiClient.post('/razorpay/verify-payment', {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              isMock: false
            })

            if (verifyResponse.success || verifyResponse.data?.success) {
              const data = verifyResponse.data?.data || verifyResponse.data
              const creditedUSD = data?.amountUSD || (parseFloat(amount) * (exchangeRate || 0.012))
              await fetchCurrentUser()
              toast.success(`Protocol Confirmed: $${creditedUSD.toFixed(2)} credited to terminal.`)
              setAmount('')
              onClose()
              if (onSuccess) onSuccess(data)
            } else {
              const errorMsg = verifyResponse.message || verifyResponse.data?.message || 'Payment verification protocols failed'
              throw new Error(errorMsg)
            }
          } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Verification failure. Terminal sync interrupted.'
            setError(errorMsg)
            console.error('Razorpay Error:', err)
          } finally {
            setIsLoading(false)
          }
        },
        prefill: {
          name: user?.username || user?.email?.split('@')[0] || 'Trader',
          email: user?.email || '',
        },
        theme: {
          color: '#6366F1',
        },
        modal: {
          ondismiss: () => setIsLoading(false)
        }
      }

      const razorpayCheckout = new window.Razorpay(options)
      razorpayCheckout.open()
    } catch (err) {
      // Use the message from the error object
      setError(err.message || 'Transmission error. Please retry.')
      toast.error(err.message || 'Capital injection failed')
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-darker/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[480px] overflow-hidden rounded-[40px] border border-white/5 bg-slate-900/40 p-1 md:p-2 shadow-2xl backdrop-blur-2xl"
          >
            <div className="relative rounded-[36px] bg-slate-950/80 p-8 md:p-10 border border-white/5">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                      <Wallet size={24} />
                   </div>
                   <div>
                      <h2 className="text-xl font-black text-white tracking-tight uppercase">Inject Capital</h2>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Payment Uplink</p>
                   </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-xl"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Quantity (INR)</label>
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-black text-lg">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value)
                        setError('')
                      }}
                      placeholder="0.00"
                      min="1"
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-6 py-5 text-xl font-black text-white placeholder-slate-700 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Minimum threshold: ₹1.00</p>
                    {amount && exchangeRate && (
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                        ≈ ${(parseFloat(amount) * exchangeRate).toFixed(2)} USD
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                   <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      <span>Live Exchange Rate</span>
                      <div className="flex items-center gap-2">
                         {isFetchingRate ? (
                           <RefreshCw size={10} className="animate-spin text-primary" />
                         ) : (
                           <span className="text-white">1 INR = {exchangeRate || '0.012'} USD</span>
                         )}
                      </div>
                   </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 text-rose-400"
                    >
                      <AlertCircle size={18} className="shrink-0" />
                      <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-4">
                  <button
                    onClick={handlePayment}
                    disabled={isLoading || !amount || parseFloat(amount) < 1}
                    className="w-full h-16 bg-primary text-white rounded-2xl font-black text-sm tracking-[0.2em] hover:bg-primary/90 disabled:bg-primary/20 disabled:text-slate-600 transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-95 flex items-center justify-center gap-3 group"
                  >
                    {isLoading ? (
                      <Loader size={20} className="animate-spin" />
                    ) : (
                      <>
                        INITIALIZE UPLINK
                        <Zap size={18} className="group-hover:scale-110 transition-transform text-amber-400 fill-amber-400" />
                      </>
                    )}
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">
                     <ShieldCheck size={12} className="text-emerald-500" />
                     End-to-End Encrypted Verification
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
