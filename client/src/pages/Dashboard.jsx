import { useEffect, useState } from 'react'
import { useTradeStore } from '../stores/tradeStore'
import { useAuthStore } from '../stores/authStore'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'
import { toast } from 'sonner'
import CryptoCard from '../components/CryptoCard'
import BuyModal from '../components/BuyModal'

export default function Dashboard() {
  const { cryptoList, fetchCryptoList, selectedCrypto, setSelectedCrypto, searchCrypto } =
    useTradeStore()
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [buyModal, setBuyModal] = useState(false)
  const [selectedForBuy, setSelectedForBuy] = useState(null)

  useEffect(() => {
    fetchCryptoList(50)
  }, [])

  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    if (query.length >= 2) {
      searchCrypto(query)
    } else if (query.length === 0) {
      fetchCryptoList(50)
    }
  }

  const handleBuy = (crypto) => {
    setSelectedForBuy(crypto)
    setBuyModal(true)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Trade cryptocurrencies in real-time</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-dark border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Available Balance</p>
          <p className="text-3xl font-bold text-white">${user?.balance?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-dark border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Portfolio Value</p>
          <p className="text-3xl font-bold text-white">$0.00</p>
        </div>
        <div className="bg-dark border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Total Balance</p>
          <p className="text-3xl font-bold text-white">${user?.balance?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-dark border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Crypto List */}
      {cryptoList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cryptoList.map((crypto) => (
            <CryptoCard
              key={crypto.id}
              crypto={crypto}
              onBuy={handleBuy}
              onSellOrAdd={(crypto) => toast.info(`Add ${crypto.name} to watchlist`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-400">No cryptocurrencies found</p>
        </div>
      )}

      {/* Buy Modal */}
      {buyModal && selectedForBuy && (
        <BuyModal
          crypto={selectedForBuy}
          onClose={() => {
            setBuyModal(false)
            setSelectedForBuy(null)
          }}
        />
      )}
    </div>
  )
}
