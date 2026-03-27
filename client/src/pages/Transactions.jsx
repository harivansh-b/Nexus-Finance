import { useEffect } from 'react'
import { useTradeStore } from '../stores/tradeStore'
import { ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown } from 'lucide-react'

export default function Transactions() {
  const { transactions, fetchTransactions } = useTradeStore()

  useEffect(() => {
    fetchTransactions(50)
  }, [])

  const getTransactionIcon = (type) => {
    if (type === 'BUY' || type === 'DEPOSIT') {
      return <ArrowDownLeft className="text-success" size={20} />
    }
    return <ArrowUpRight className="text-danger" size={20} />
  }

  const getTransactionColor = (type) => {
    if (type === 'BUY' || type === 'DEPOSIT') {
      return 'text-success'
    }
    return 'text-danger'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Transactions</h1>
        <p className="text-slate-400">View your trading history</p>
      </div>

      {/* Transactions List */}
      <div className="bg-dark border border-slate-700 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Transaction History</h2>
        </div>

        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700">
                <tr>
                  <th className="text-left p-4 text-slate-400 text-sm font-semibold">Type</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-semibold">Cryptocurrency</th>
                  <th className="text-right p-4 text-slate-400 text-sm font-semibold">Amount</th>
                  <th className="text-right p-4 text-slate-400 text-sm font-semibold">Price</th>
                  <th className="text-right p-4 text-slate-400 text-sm font-semibold">Total Value</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-semibold">Date</th>
                  <th className="text-left p-4 text-slate-400 text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} className="border-b border-slate-700 hover:bg-slate-800/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(tx.type)}
                        <span className={`font-semibold ${getTransactionColor(tx.type)}`}>
                          {tx.type}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white font-semibold">{tx.coin?.name || 'USD'}</p>
                        <p className="text-sm text-slate-400">{tx.coin?.symbol || 'USD'}</p>
                      </div>
                    </td>
                    <td className="p-4 text-right text-white">
                      {tx.amount?.toFixed(8) || '—'}
                    </td>
                    <td className="p-4 text-right text-white">
                      ${tx.price?.toFixed(2) || '—'}
                    </td>
                    <td className="p-4 text-right text-white">
                      ${tx.totalValue?.toFixed(2) || '—'}
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {new Date(tx.createdAt).toLocaleDateString()}{' '}
                      {new Date(tx.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tx.status === 'COMPLETED'
                          ? 'bg-success/20 text-success'
                          : tx.status === 'PENDING'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-danger/20 text-danger'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-400">No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
