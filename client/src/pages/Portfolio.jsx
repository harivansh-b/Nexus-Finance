import { useEffect } from 'react'
import { useTradeStore } from '../stores/tradeStore'
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function Portfolio() {
  const { portfolio, portfolioSummary, fetchPortfolio, fetchPortfolioSummary, sellCrypto } =
    useTradeStore()

  useEffect(() => {
    fetchPortfolio()
    fetchPortfolioSummary()
  }, [])

  const handleSell = async (coin, amount) => {
    try {
      await sellCrypto(coin.coingeckoId, amount)
      toast.success(`${amount} ${coin.symbol} sold!`)
    } catch (error) {
      toast.error(error.message || 'Failed to sell')
    }
  }

  if (!portfolioSummary) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-primary rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Portfolio</h1>
        <p className="text-slate-400">View your holdings and assets</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Total Invested</p>
          <p className="text-3xl font-bold text-white">${portfolioSummary.totalInvested?.toFixed(2)}</p>
        </div>
        <div className="bg-dark border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Total Value</p>
          <p className="text-3xl font-bold text-white">${portfolioSummary.totalValue?.toFixed(2)}</p>
        </div>
        <div className={`bg-dark border rounded-lg p-6 ${portfolioSummary.profitLoss >= 0 ? 'border-success' : 'border-danger'}`}>
          <p className="text-slate-400 text-sm mb-2">Profit / Loss</p>
          <div className="flex items-center gap-2">
            {portfolioSummary.profitLoss >= 0 ? (
              <TrendingUp className="text-success" />
            ) : (
              <TrendingDown className="text-danger" />
            )}
            <p className={`text-3xl font-bold ${portfolioSummary.profitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
              ${Math.abs(portfolioSummary.profitLoss).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="bg-dark border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Cash Balance</p>
          <p className="text-3xl font-bold text-white">${portfolioSummary.cashBalance?.toFixed(2)}</p>
        </div>
      </div>

      {/* Holdings */}
      <div className="bg-dark border border-slate-700 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Your Holdings</h2>
        </div>

        {portfolio.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700">
                <tr>
                  <th className="text-left p-4 text-slate-400 text-sm font-semibold">Cryptocurrency</th>
                  <th className="text-right p-4 text-slate-400 text-sm font-semibold">Amount</th>
                  <th className="text-right p-4 text-slate-400 text-sm font-semibold">Avg Buy Price</th>
                  <th className="text-right p-4 text-slate-400 text-sm font-semibold">Total Invested</th>
                  <th className="text-right p-4 text-slate-400 text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((holding) => (
                  <tr key={holding._id} className="border-b border-slate-700 hover:bg-slate-800/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {holding.coin.logo && (
                          <img src={holding.coin.logo} alt={holding.coin.name} className="w-8 h-8 rounded-full" />
                        )}
                        <div>
                          <p className="text-white font-semibold">{holding.coin.name}</p>
                          <p className="text-sm text-slate-400">{holding.coin.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right text-white">{holding.amount.toFixed(8)}</td>
                    <td className="p-4 text-right text-white">${holding.avgBuyPrice.toFixed(2)}</td>
                    <td className="p-4 text-right text-white">${holding.totalInvested.toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleSell(holding.coin, holding.amount)}
                        className="text-danger hover:text-danger/70 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-400">No holdings yet. Start trading!</p>
          </div>
        )}
      </div>
    </div>
  )
}
