import { Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function WatchlistCard({ coin, onRemove }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 p-2 flex items-center justify-center">
          <img src={coin.logo} alt={coin.name} className="w-full h-full object-contain" />
        </div>
        <div>
          <Link to={`/coin/${coin.coingeckoId}`} className="block">
            <h3 className="font-black text-white group-hover:text-primary transition-colors">
              {coin.name}
            </h3>
          </Link>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {coin.symbol}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={() => onRemove(coin.coingeckoId)}
          className="p-3 rounded-xl bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  )
}
