import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, TrendingDown, TrendingUp, BarChart3, Wallet2, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import apiClient from '../services/api'
import CoinHistoryChart from './CoinHistoryChart'

export default function PortfolioHoldingCard({ holding, onSell }) {
  const [history, setHistory] = useState([])
  const [details, setDetails] = useState(null)
  const [isSelling, setIsSelling] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchHoldingData = async () => {
      try {
        const [detailsResponse, historyResponse] = await Promise.all([
          apiClient.get(`/crypto/${holding.coin.coingeckoId}`),
          apiClient.get(`/crypto/${holding.coin.coingeckoId}/history?days=30`),
        ])

        if (!isMounted) return
        setDetails(detailsResponse.data)
        setHistory(historyResponse.data)
      } catch (error) {
        if (!isMounted) return
        setDetails(null)
        setHistory([])
      }
    }

    fetchHoldingData()

    return () => {
      isMounted = false
    }
  }, [holding.coin.coingeckoId])

  const metrics = useMemo(() => {
    const currentPrice = details?.currentPrice || holding.avgBuyPrice
    const currentValue = holding.amount * currentPrice
    const profitLoss = currentValue - holding.totalInvested
    const profitLossPercentage = holding.totalInvested
      ? (profitLoss / holding.totalInvested) * 100
      : 0

    return {
      currentPrice,
      currentValue,
      profitLoss,
      profitLossPercentage,
    }
  }, [details?.currentPrice, holding.amount, holding.avgBuyPrice, holding.totalInvested])

  const isPositive = metrics.profitLoss >= 0

  return (
    <motion.article 
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-[40px] border border-white/5 bg-slate-900/40 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-white/10"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Card Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/5 p-8">
        <div className="flex items-center gap-5">
          <div className="relative">
            {holding.coin.logo && (
              <img src={holding.coin.logo} alt={holding.coin.name} className="h-16 w-16 rounded-[24px] shadow-2xl transition-transform duration-500 group-hover:scale-110" />
            )}
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-slate-900 ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">{holding.coin.name}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">{holding.coin.symbol}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/coin/${holding.coin.coingeckoId}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 transition-all hover:bg-white/10 hover:text-white"
          >
            Intelligence
            <ArrowUpRight size={16} />
          </Link>
          <button
            onClick={() => onSell(holding.coin, holding.amount)}
            className="px-6 py-3 rounded-2xl bg-rose-500/10 text-rose-500 text-xs font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all active:scale-95"
          >
            Exit Position
          </button>
        </div>
      </div>

      <div className="relative z-10 grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative rounded-[32px] border border-white/5 bg-slate-950/45 p-6 overflow-hidden group/chart">
           <div className="absolute top-4 right-6 z-20 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <Activity size={12} className="text-primary animate-pulse" />
              Live Performance
           </div>
           <CoinHistoryChart
              data={history}
              height={220}
              compact
              color={isPositive ? '#10b981' : '#f43f5e'}
           />
        </div>

        <div className="grid gap-4">
           <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10">
                <div className="flex items-center gap-2 mb-3">
                   <BarChart3 size={14} className="text-slate-500" />
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Holdings</p>
                </div>
                <p className="text-2xl font-black text-white tracking-tight">{holding.amount.toFixed(6)}</p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10">
                <div className="flex items-center gap-2 mb-3">
                   <Wallet2 size={14} className="text-slate-500" />
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Market Value</p>
                </div>
                <p className="text-2xl font-black text-white tracking-tight">
                  ${metrics.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
           </div>

           <div className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm relative overflow-hidden group/pl">
              <div className={`absolute inset-0 opacity-10 ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'} blur-3xl`} />
              <div className="relative z-10 flex flex-col justify-center h-full">
                 <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unrealized P/L</p>
                    <div className={`p-2 rounded-xl ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                       {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                 </div>
                 <div className="flex items-baseline gap-3">
                    <p className={`text-4xl font-black tracking-tighter ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                       {isPositive ? '+' : '-'}${Math.abs(metrics.profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <span className={`text-sm font-black px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                       {isPositive ? '+' : ''}{metrics.profitLossPercentage.toFixed(2)}%
                    </span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="relative z-10 grid gap-4 border-t border-white/5 p-8 sm:grid-cols-2 lg:grid-cols-4 bg-slate-900/40">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cost Basis</p>
          <p className="text-lg font-black text-white">${holding.avgBuyPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Spot Price</p>
          <p className="text-lg font-black text-white">${metrics.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Invested</p>
          <p className="text-lg font-black text-white">${holding.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/10 border border-white/5 flex items-center justify-center">
           <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Optimized Hold</p>
        </div>
      </div>
    </motion.article>
  )
}
