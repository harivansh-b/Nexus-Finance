import { TrendingUp, TrendingDown, Heart, ArrowUpRight, ShoppingCart, ListPlus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts'
import { motion } from 'framer-motion'
import { formatCompactNumber } from '../utils/formatting.js'

export default function CryptoCard({ crypto, onBuy, onSellOrAdd, isWatchlisted }) {
  const change24h = crypto.change24h || 0
  const isPositive = change24h >= 0
  const sparklineData = (crypto.sparkline || []).slice(-30).map((price, index) => ({
    index,
    price,
  }))

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-[32px] border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-primary/30 hover:bg-slate-900/60"
    >
      {/* Background Accent */}
      <div className={`absolute -right-16 -top-16 h-32 w-32 rounded-full blur-[60px] transition-opacity duration-500 opacity-20 group-hover:opacity-40 ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
               {crypto.image && (
                <img src={crypto.image} alt={crypto.name} className="w-14 h-14 rounded-2xl shadow-xl transition-transform duration-500 group-hover:scale-110" />
               )}
               <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
            </div>
            <div>
              <Link to={`/coin/${crypto.id}`} className="block group/link">
                <h3 className="text-lg font-black text-white tracking-tight group-hover/link:text-primary transition-colors">
                  {crypto.name}
                </h3>
              </Link>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{crypto.symbol}</p>
            </div>
          </div>
          <button
            onClick={() => onSellOrAdd(crypto)}
            className={`p-3 rounded-2xl transition-all duration-300 ${
              isWatchlisted ? 'bg-rose-500/20 text-rose-500' : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'
            }`}
          >
            <Heart size={20} fill={isWatchlisted ? 'currentColor' : 'none'} className={isWatchlisted ? 'scale-110' : ''} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-1">
             <span className="text-3xl font-black text-white tracking-tight">
                ${crypto.currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </span>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black tracking-wider ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <TrendingDown size={14} />}
            {Math.abs(change24h).toFixed(2)}%
          </div>
        </div>

        <div className="mb-6 h-20 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`gradient-${crypto.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? '#10b981' : '#f43f5e'}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#gradient-${crypto.id})`}
                animationDuration={2000}
              />
              <YAxis hide domain={['auto', 'auto']} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
           <div className="rounded-2xl bg-white/5 p-4 border border-white/5 transition-colors group-hover:bg-white/10">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Market Cap</p>
              <p className="text-sm font-black text-white">${formatCompactNumber(crypto.marketCap)}</p>
           </div>
           <div className="rounded-2xl bg-white/5 p-4 border border-white/5 transition-colors group-hover:bg-white/10">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">24h Volume</p>
              <p className="text-sm font-black text-white">${formatCompactNumber(crypto.volume24h)}</p>
           </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onBuy(crypto)
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-white font-black text-sm tracking-widest transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-95"
          >
            <ShoppingCart size={18} />
            BUY
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSellOrAdd(crypto)
            }}
            className="p-4 rounded-2xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all active:scale-95"
            title="Add to Watchlist"
          >
            <ListPlus size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
