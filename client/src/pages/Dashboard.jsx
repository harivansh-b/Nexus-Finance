import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Plus, Search, ShieldCheck, Wallet2, TrendingUp, ArrowUpRight, BarChart2, Activity, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useTradeStore } from '../stores/tradeStore'
import { useAuthStore } from '../stores/authStore'
import CryptoCard from '../components/CryptoCard'
import BuyModal from '../components/BuyModal'
import RazorpayModal from '../components/RazorpayModal'
import apiClient from '../services/api'
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts'
import { formatCompactNumber, formatCurrency } from '../utils/formatting'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

const LoadingCard = () => (
  <div className="h-[400px] rounded-[40px] bg-slate-900/40 border border-white/5 flex items-center justify-center">
     <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
     </div>
  </div>
)

export default function Dashboard() {
  const {
    cryptoList,
    fetchCryptoList,
    fetchPortfolioSummary,
    portfolioSummary,
    searchCrypto,
    watchlist,
    fetchWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isLoading,
  } = useTradeStore()
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [buyModal, setBuyModal] = useState(false)
  const [selectedForBuy, setSelectedForBuy] = useState(null)
  const [razorpayModal, setRazorpayModal] = useState(false)
  const [btcHistory, setBtcHistory] = useState([])

  useEffect(() => {
    fetchCryptoList(50)
    fetchPortfolioSummary()
    fetchWatchlist()
    
    // Fetch BTC history for the hero chart
    apiClient.get('/crypto/bitcoin/history?days=7').then(res => {
      setBtcHistory(res.data)
    }).catch(err => {
      console.error('Dashboard: BTC Chart sync failure:', err)
      toast.error('Market data uplink interrupted')
    })
  }, [fetchCryptoList, fetchPortfolioSummary, fetchWatchlist])

  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length >= 2) {
      searchCrypto(query)
    } else if (query.length === 0) {
      fetchCryptoList(50)
    }
  }

  const handleBuy = (crypto) => {
    setSelectedForBuy(crypto)
    setBuyModal(true)
  }

  const handleWatchlistToggle = async (crypto) => {
    const isWatchlisted = watchlist.some(c => c.coingeckoId === crypto.id)
    if (isWatchlisted) {
      await removeFromWatchlist(crypto.id)
      toast.success(`${crypto.symbol} removed from watchlist`)
    } else {
      await addToWatchlist(crypto)
      toast.success(`${crypto.symbol} added to watchlist`)
    }
  }

  const bitcoin = useMemo(
    () => cryptoList.find((coin) => coin.id === 'bitcoin') || cryptoList[0],
    [cryptoList]
  )

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-12 pb-12"
    >
      {/* Hero Section */}
      <motion.section 
        variants={itemVariants}
        className="relative overflow-hidden rounded-[48px] border border-white/5 bg-slate-900/40 p-1 md:p-2 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-indigo-500/5 pointer-events-none" />
        <div className="relative rounded-[44px] bg-slate-950/80 backdrop-blur-3xl p-8 md:p-12 overflow-hidden border border-white/5">
          {/* Decorative Blobs */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-[100px]" />

          <div className="relative grid gap-12 xl:grid-cols-[1fr_0.8fr] items-center">
            <div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8"
              >
                <Flame size={14} className="animate-pulse text-rose-500" />
                Live Market Analysis
              </motion.div>

              <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                Master the Markets with <span className="text-primary italic">Precision.</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed font-medium">
                Your institutional-grade trading terminal. Real-time insights, deep liquidity, and advanced portfolio management.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 mb-10">
                <div className="group rounded-[32px] border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Cash Balance</p>
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                      <Wallet2 size={18} />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-white tracking-tight">
                    ${portfolioSummary?.cashBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || user?.balance?.toFixed(2) || '0.00'}
                  </p>
                </div>

                <div className="group rounded-[32px] border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Portfolio Value</p>
                    <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                      <ShieldCheck size={18} />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-white tracking-tight">
                    ${portfolioSummary?.totalBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || user?.balance?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setRazorpayModal(true)}
                  className="px-8 py-4 bg-primary text-white font-black text-xs tracking-widest rounded-[20px] hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-95 flex items-center gap-2"
                >
                  <Plus size={18} />
                  DEPOSIT FUNDS
                </button>
                <Link
                  to="/portfolio"
                  className="px-8 py-4 bg-white/5 text-white font-black text-xs tracking-widest rounded-[20px] hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2 border border-white/5"
                >
                  <BarChart2 size={18} />
                  VIEW POSITIONS
                </Link>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-colors" />
              <div className="relative rounded-[40px] border border-white/10 bg-slate-900/60 p-8 md:p-10 backdrop-blur-xl shadow-2xl">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                       {bitcoin?.image ? (
                        <img src={bitcoin.image} alt="BTC" className="w-16 h-16 rounded-[24px] shadow-2xl shadow-amber-500/20 group-hover:scale-110 transition-transform duration-500" />
                       ) : <div className="w-16 h-16 bg-amber-500/20 rounded-[24px]" />}
                       <div>
                          <h3 className="text-2xl font-black text-white tracking-tight">{bitcoin?.name || 'Bitcoin'}</h3>
                          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">{bitcoin?.symbol || 'BTC'} / USD</p>
                       </div>
                    </div>
                    <div className="flex flex-col items-end">
                       <p className="text-2xl font-black text-white tracking-tighter">${bitcoin?.currentPrice?.toLocaleString() || '0'}</p>
                       <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${(bitcoin?.change24h || 0) >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {(bitcoin?.change24h || 0) >= 0 ? <ArrowUpRight size={14}/> : <TrendingUp size={14} className="rotate-180"/>}
                          {(bitcoin?.change24h || 0).toFixed(2)}%
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Market Cap</p>
                       <p className="text-lg font-black text-white tracking-tight">${formatCompactNumber(bitcoin?.marketCap)}</p>
                    </div>
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">24h Volume</p>
                       <p className="text-lg font-black text-white tracking-tight">${formatCompactNumber(bitcoin?.volume24h)}</p>
                    </div>
                 </div>

                 <div className="mt-8 h-40 w-full bg-slate-950/50 rounded-[32px] border border-white/5 flex items-center justify-center relative overflow-hidden p-2">
                    <div className="absolute top-4 left-6 z-20 flex items-center gap-2">
                       <Activity size={12} className="text-primary animate-pulse" />
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Institutional Feed (7D)</p>
                    </div>
                    
                    {btcHistory.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={btcHistory}>
                          <defs>
                            <linearGradient id="btcHero" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#6366F1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#btcHero)"
                            animationDuration={3000}
                          />
                          <YAxis hide domain={['auto', 'auto']} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Awaiting Data Streams...</p>
                    )}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Market Board */}
      <motion.section variants={itemVariants} className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight">Market Intelligence</h2>
            <p className="text-slate-400 font-medium">Spot opportunities across institutional-grade digital assets.</p>
          </div>

          <div className="relative w-full max-w-md group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search assets (e.g. BTC, Solana)..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full rounded-2xl border border-white/5 bg-slate-900/50 pl-14 pr-6 py-5 text-sm font-bold text-white placeholder-slate-600 focus:border-primary/50 focus:bg-slate-900 focus:outline-none transition-all shadow-xl"
            />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 px-2">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <motion.div key={`loader-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                   <LoadingCard />
                </motion.div>
              ))
            ) : cryptoList.length > 0 ? (
              cryptoList.map((crypto) => (
                <motion.div
                  key={crypto.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <CryptoCard
                    crypto={crypto}
                    onBuy={handleBuy}
                    onSellOrAdd={handleWatchlistToggle}
                    isWatchlisted={watchlist.some(c => c.coingeckoId === crypto.id)}
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full rounded-[48px] border border-dashed border-slate-800 py-32 text-center bg-slate-900/20">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">No synchronization with assets found</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Modals */}
      <AnimatePresence>
        {buyModal && selectedForBuy && (
          <BuyModal
            crypto={selectedForBuy}
            onClose={() => {
              setBuyModal(false)
              setSelectedForBuy(null)
            }}
          />
        )}
      </AnimatePresence>

      <RazorpayModal
        isOpen={razorpayModal}
        onClose={() => setRazorpayModal(false)}
        onSuccess={(data) => {
          fetchPortfolioSummary()
        }}
      />
    </motion.div>
  )
}
