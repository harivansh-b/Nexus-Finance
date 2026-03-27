import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Flame, TrendingDown, TrendingUp, BarChart3, Globe, Shield, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../services/api'
import CoinHistoryChart from '../components/CoinHistoryChart'
import BuyModal from '../components/BuyModal'
import Skeleton from '../components/Skeleton'

const ranges = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
]

const statValue = (value, prefix = '', suffix = '') =>
  value || value === 0 ? `${prefix}${Number(value).toLocaleString()}${suffix}` : '--'

const sanitizeDescription = (value) =>
  value ? value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : ''

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

export default function CoinDetails() {
  const { coingeckoId } = useParams()
  const [details, setDetails] = useState(null)
  const [history, setHistory] = useState([])
  const [selectedRange, setSelectedRange] = useState(30)
  const [isLoading, setIsLoading] = useState(true)
  const [buyModalOpen, setBuyModalOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchCoinData = async () => {
      setIsLoading(true)
      try {
        const [detailsResponse, historyResponse] = await Promise.all([
          apiClient.get(`/crypto/${coingeckoId}`),
          apiClient.get(`/crypto/${coingeckoId}/history?days=${selectedRange}`),
        ])

        if (!isMounted) return
        setDetails(detailsResponse.data)
        setHistory(historyResponse.data)
      } catch (error) {
        if (!isMounted) return
        toast.error(error.message || 'Failed to load coin details')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchCoinData()

    return () => {
      isMounted = false
    }
  }, [coingeckoId, selectedRange])

  if (isLoading && !details) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-12 w-40 rounded-full" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-[40px]" />
        <Skeleton className="h-[300px] w-full rounded-[40px]" />
      </div>
    )
  }

  if (!details) {
    return (
      <div className="rounded-[40px] border border-dashed border-slate-800 py-24 text-center">
        <p className="text-slate-500 font-bold uppercase tracking-widest">Coin details could not be loaded.</p>
      </div>
    )
  }

  const isPositive = (details.change24h || 0) >= 0
  const description = sanitizeDescription(details.description)
  const liveCoin = {
    id: details.id,
    name: details.name,
    symbol: details.symbol,
    image: details.image,
    currentPrice: details.currentPrice,
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10 pb-20"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="group inline-flex items-center gap-2 rounded-2xl border border-white/5 bg-slate-900/50 px-6 py-3 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Terminal
        </Link>
        <button
          onClick={() => setBuyModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-black text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          ACQUIRE {details.symbol.toUpperCase()}
          <Zap size={18} />
        </button>
      </motion.div>

      <motion.section 
        variants={itemVariants}
        className="relative overflow-hidden rounded-[48px] border border-white/5 bg-slate-900/40 p-1 md:p-2 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative rounded-[44px] bg-slate-950/80 backdrop-blur-3xl p-8 md:p-12 overflow-hidden border border-white/5">
          <div className="grid gap-12 xl:grid-cols-[1.2fr_0.8fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary mb-8">
                <BarChart3 size={14} />
                Asset Intelligence
              </div>
              
              <div className="flex items-center gap-6 mb-8">
                {details.image && (
                  <img src={details.image} alt={details.name} className="h-20 w-20 rounded-3xl shadow-2xl shadow-primary/20" />
                )}
                <div>
                  <h1 className="text-5xl font-black text-white tracking-tight">{details.name}</h1>
                  <p className="text-xl font-bold text-slate-500 uppercase tracking-[0.2em]">{details.symbol}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-baseline gap-4 mb-10">
                <p className="text-6xl font-black text-white tracking-tighter">
                  {details.currentPrice ? `$${details.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '--'}
                </p>
                <div className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-black tracking-wider ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  {(details.change24h || 0) >= 0 ? '+' : ''}{(details.change24h || 0).toFixed(2)}%
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="group rounded-[32px] border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Market Cap</p>
                  <p className="text-2xl font-black text-white tracking-tight">
                    {statValue(details.marketCap, '$')}
                  </p>
                </div>
                <div className="group rounded-[32px] border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">24h Volume</p>
                  <p className="text-2xl font-black text-white tracking-tight">
                    {statValue(details.volume24h, '$')}
                  </p>
                </div>
                <div className="group rounded-[32px] border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">ATH</p>
                  <p className="text-2xl font-black text-white tracking-tight">
                    {statValue(details.ath, '$')}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[40px] border border-white/10 bg-slate-900/60 p-8 md:p-10 backdrop-blur-xl shadow-2xl">
              <h2 className="text-xl font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                 <Shield size={20} className="text-primary" />
                 Protocol Metrics
              </h2>
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Circulating Supply</p>
                  <p className="font-black text-white">{statValue(details.circulatingSupply)}</p>
                </div>
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Supply</p>
                  <p className="font-black text-white">{statValue(details.totalSupply)}</p>
                </div>
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Max Supply</p>
                  <p className="font-black text-white">{statValue(details.maxSupply)}</p>
                </div>
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">30D Momentum</p>
                  <p className={`font-black ${(details.change30d || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {(details.change30d || 0) >= 0 ? '+' : ''}{(details.change30d || 0).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section 
        variants={itemVariants}
        className="rounded-[48px] border border-white/5 bg-slate-900/40 p-8 md:p-12 shadow-2xl backdrop-blur-sm"
      >
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Market Momentum</h2>
            <p className="text-slate-400 font-medium">Historical price performance data</p>
          </div>
          <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-white/5">
            {ranges.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedRange(range.value)}
                className={`rounded-xl px-6 py-2.5 text-xs font-black tracking-widest transition-all ${
                  selectedRange === range.value
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative h-[400px] w-full rounded-[32px] overflow-hidden bg-slate-950/50 border border-white/5 p-6">
           <div className="absolute top-4 left-6 z-10">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Live Stream</p>
           </div>
           <CoinHistoryChart data={history} color={isPositive ? '#10b981' : '#f43f5e'} height={360} />
        </div>
      </motion.section>

      <motion.section 
        variants={itemVariants}
        className="rounded-[48px] border border-white/5 bg-slate-900/40 p-8 md:p-12 shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-8">
           <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Globe size={24} />
           </div>
           <h2 className="text-3xl font-black text-white tracking-tight">Protocol Intel</h2>
        </div>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-slate-400 leading-relaxed font-medium">
            {description || 'No technical documentation available for this asset yet.'}
          </p>
        </div>
      </motion.section>

      <AnimatePresence>
        {buyModalOpen && (
          <BuyModal
            crypto={liveCoin}
            onClose={() => setBuyModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
