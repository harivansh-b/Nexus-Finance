import { useEffect } from 'react'
import { useTradeStore } from '../stores/tradeStore'
import { ArrowUpRight, ArrowDownLeft, History, Search, Filter, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

export default function Transactions() {
  const { transactions, fetchTransactions } = useTradeStore()

  useEffect(() => {
    fetchTransactions(50)
  }, [fetchTransactions])

  const getTransactionIcon = (type) => {
    if (type === 'BUY' || type === 'DEPOSIT') {
      return (
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
           <ArrowDownLeft size={20} />
        </div>
      )
    }
    return (
      <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
         <ArrowUpRight size={20} />
      </div>
    )
  }

  const getTransactionColor = (type) => {
    if (type === 'BUY' || type === 'DEPOSIT') {
      return 'text-emerald-400'
    }
    return 'text-rose-400'
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10 pb-20"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
            <History size={14} />
            Ledger Operations
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">Transaction Logs</h1>
          <p className="text-slate-400 font-medium">Verified history of your capital movements.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
             <Download size={20} />
          </button>
          <div className="relative group">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
             <select className="bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-white uppercase tracking-widest focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer">
                <option>All Activities</option>
                <option>Trades Only</option>
                <option>Wallet Syncs</option>
             </select>
          </div>
        </div>
      </motion.div>

      {/* Transactions List */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[40px] border border-white/5 bg-slate-900/40 shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/20">
          <h2 className="text-xl font-black text-white tracking-tight uppercase">Operational History</h2>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Feed</span>
          </div>
        </div>

        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                  <th className="text-left p-6">Operation</th>
                  <th className="text-left p-6">Asset Intelligence</th>
                  <th className="text-right p-6">Quantity</th>
                  <th className="text-right p-6">Strike Price</th>
                  <th className="text-right p-6">Gross Value</th>
                  <th className="text-left p-6">Timestamp</th>
                  <th className="text-left p-6">Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {transactions.map((tx) => (
                    <motion.tr 
                      key={tx._id} 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:bg-white/5 transition-all duration-300"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          {getTransactionIcon(tx.type)}
                          <span className={`text-xs font-black tracking-widest ${getTransactionColor(tx.type)}`}>
                            {tx.type}
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-[10px] text-white">
                              {tx.coin?.symbol?.charAt(0) || 'U'}
                           </div>
                           <div>
                              <p className="text-sm font-black text-white tracking-tight">{tx.coin?.name || 'USD Balance'}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase">{tx.coin?.symbol || 'USD'}</p>
                           </div>
                        </div>
                      </td>
                      <td className="p-6 text-right font-bold text-white text-sm">
                        {tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 }) || '—'}
                      </td>
                      <td className="p-6 text-right font-bold text-white text-sm">
                        {tx.price ? `$${tx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="p-6 text-right font-black text-white text-sm">
                        ${tx.totalValue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '—'}
                      </td>
                      <td className="p-6">
                        <p className="text-xs font-bold text-slate-400">
                          {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] font-medium text-slate-600">
                          {new Date(tx.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="p-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          tx.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : tx.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-32 text-center space-y-4">
             <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-700">
                <History size={32} />
             </div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">No activity detected</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
