import { useEffect } from 'react'
import { useTradeStore } from '../stores/tradeStore'
import { TrendingUp, TrendingDown, Wallet, PieChart, BarChart3, ArrowUpRight, ArrowDownRight, LayoutDashboard } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import PortfolioHoldingCard from '../components/PortfolioHoldingCard'

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

export default function Portfolio() {
  const { portfolio, portfolioSummary, fetchPortfolio, fetchPortfolioSummary, sellCrypto } =
    useTradeStore()

  useEffect(() => {
    fetchPortfolio()
    fetchPortfolioSummary()
  }, [fetchPortfolio, fetchPortfolioSummary])

  const handleSell = async (coin, amount) => {
    try {
      await sellCrypto(coin.coingeckoId, amount)
      toast.success(`${amount} ${coin.symbol} sold successfully!`)
    } catch (error) {
      toast.error(error.message || 'Failed to execute sell order')
    }
  }

  if (!portfolioSummary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
         <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
         </div>
      </div>
    )
  }

  const isProfitable = portfolioSummary.profitLoss >= 0

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10 pb-20"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
            <PieChart size={14} />
            Asset Allocation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">Portfolio Terminal</h1>
          <p className="text-slate-400 font-medium">Real-time performance metrics and holding analysis.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="px-6 py-3 bg-slate-900/50 border border-white/5 rounded-2xl backdrop-blur-md">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-xs font-bold text-white uppercase tracking-widest">Live Sync</span>
              </div>
           </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Invested', value: portfolioSummary.totalInvested, icon: Wallet, color: 'primary' },
          { label: 'Market Value', value: portfolioSummary.totalValue, icon: BarChart3, color: 'indigo' },
          { label: 'Profit / Loss', value: portfolioSummary.profitLoss, icon: isProfitable ? TrendingUp : TrendingDown, color: isProfitable ? 'emerald' : 'rose', isPL: true },
          { label: 'Cash Balance', value: portfolioSummary.cashBalance, icon: LayoutDashboard, color: 'cyan' },
        ].map((stat, idx) => (
          <div key={idx} className="group relative overflow-hidden rounded-[32px] border border-white/5 bg-slate-900/40 p-6 backdrop-blur-xl transition-all hover:bg-slate-900/60 hover:border-white/10 shadow-2xl">
            <div className={`absolute -right-8 -top-8 w-24 h-24 bg-${stat.color}-500/10 rounded-full blur-2xl group-hover:bg-${stat.color}-500/20 transition-colors`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                  <stat.icon size={18} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                 <p className={`text-3xl font-black tracking-tight ${stat.isPL ? (isProfitable ? 'text-emerald-400' : 'text-rose-400') : 'text-white'}`}>
                   ${stat.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </p>
              </div>
              {stat.isPL && (
                 <p className={`text-[10px] font-bold mt-2 uppercase tracking-widest ${isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isProfitable ? 'Growth' : 'Drawdown'} Detected
                 </p>
              )}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Holdings Section */}
      <motion.section variants={itemVariants} className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Active Positions</h2>
            <p className="text-slate-400 font-medium">Detailed breakdown of your current market exposure.</p>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
             <span>Sort by:</span>
             <select className="bg-transparent border-none focus:ring-0 text-white cursor-pointer hover:text-primary transition-colors">
                <option value="value">Highest Value</option>
                <option value="profit">Profitability</option>
                <option value="name">Asset Name</option>
             </select>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {portfolio.length > 0 ? (
            <div className="space-y-8">
              {portfolio.map((holding) => (
                <motion.div
                  key={holding._id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                >
                  <PortfolioHoldingCard
                    holding={holding}
                    onSell={handleSell}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-[48px] border border-dashed border-white/5 bg-slate-900/20 py-32 text-center"
            >
              <div className="max-w-xs mx-auto space-y-6">
                 <div className="w-20 h-20 bg-slate-800/50 rounded-3xl flex items-center justify-center mx-auto text-slate-600">
                    <PieChart size={40} />
                 </div>
                 <div className="space-y-2">
                    <p className="text-xl font-black text-white uppercase tracking-tight">Vault Empty</p>
                    <p className="text-sm text-slate-500 font-medium">No active positions found in your portfolio. Head to the dashboard to start trading.</p>
                 </div>
                 <button className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-sm tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20">
                    OPEN MARKETS
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </motion.div>
  )
}
