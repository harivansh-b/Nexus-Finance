import { TrendingUp, TrendingDown, Heart } from 'lucide-react'
import { useState } from 'react'

export default function CryptoCard({ crypto, onBuy, onSellOrAdd }) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  const change24h = crypto.change24h || 0
  const isPositive = change24h >= 0

  return (
    <div className="bg-dark rounded-lg border border-slate-700 p-4 hover:border-primary transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {crypto.image && (
            <img src={crypto.image} alt={crypto.name} className="w-12 h-12 rounded-full" />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{crypto.name}</h3>
            <p className="text-sm text-slate-400">{crypto.symbol}</p>
          </div>
        </div>
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`p-2 rounded-lg transition-colors ${
            isWishlisted ? 'bg-danger/20 text-danger' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-2xl font-bold text-white mb-2">
          ${crypto.currentPrice?.toFixed(2) || '0.00'}
        </p>
        <div className={`flex items-center gap-1 ${isPositive ? 'text-success' : 'text-danger'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="text-sm font-semibold">{change24h.toFixed(2)}%</span>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => onBuy(crypto)}
          className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-lg font-semibold transition-colors"
        >
          Buy
        </button>
        <button
          onClick={() => onSellOrAdd(crypto)}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-semibold transition-colors"
        >
          Sell / Add to List
        </button>
      </div>
    </div>
  )
}
