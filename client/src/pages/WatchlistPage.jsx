import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, TrendingUp, Search, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTradeStore } from '../stores/tradeStore'
import WatchlistCard from '../components/WatchlistCard'
import { toast } from 'sonner'

export default function WatchlistPage() {
  const { watchlist, fetchWatchlist, removeFromWatchlist, isLoading } = useTradeStore()

  useEffect(() => {
    fetchWatchlist()
  }, [fetchWatchlist])

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-4">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest">
              <ArrowLeft size={14} />
              Back to Terminal
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-4">
                <Heart className="text-rose-500" size={32} />
                Market Watchlist
              </h1>
              <p className="text-slate-400 font-medium mt-2">Personalized tracking of institutional-grade digital assets.</p>
            </div>
          </div>
          <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Monitors</p>
                <p className="text-xl font-black text-white">{watchlist.length}</p>
             </div>
             <div className="h-8 w-px bg-white/10" />
             <TrendingUp className="text-primary" size={24} />
          </div>
        </div>

        {/* Watchlist Grid */}
        <div className="px-4">
           {isLoading ? (
             <div className="grid gap-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-24 rounded-3xl bg-white/5 border border-white/5 animate-pulse" />
               ))}
             </div>
           ) : watchlist.length > 0 ? (
             <div className="grid gap-4">
               <AnimatePresence mode="popLayout">
                 {watchlist.map((coin) => (
                   <WatchlistCard
                     key={coin.coingeckoId}
                     coin={coin}
                     onRemove={(id) => {
                       removeFromWatchlist(id)
                       toast.success('Asset monitoring terminated')
                     }}
                   />
                 ))}
               </AnimatePresence>
             </div>
           ) : (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="py-32 text-center rounded-[48px] border border-dashed border-white/5 bg-slate-900/20"
             >
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={24} className="text-slate-600" />
               </div>
               <h3 className="text-xl font-black text-white mb-2 tracking-tight">Watchlist Empty</h3>
               <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm">No synchronization with assets found. Capture assets in the market terminal to begin monitoring.</p>
               <Link 
                to="/dashboard"
                className="mt-8 inline-flex px-8 py-4 bg-primary text-white font-black text-xs tracking-widest rounded-2xl hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
               >
                 EXPLORE MARKETS
               </Link>
             </motion.div>
           )}
        </div>
      </div>
    </div>
  )
}
