import { useEffect, useState } from 'react'
import { useTradeStore } from '../stores/tradeStore'
import { useAuthStore } from '../stores/authStore'
import { Search, Plus } from 'lucide-react'
import { toast } from 'sonner'
import CryptoCard from '../components/CryptoCard'
import BuyModal from '../components/BuyModal'
import RazorpayModal from '../components/RazorpayModal'

export default function Dashboard() {
  const { cryptoList, fetchCryptoList, searchCrypto } = useTradeStore()
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [buyModal, setBuyModal] = useState(false)
  const [selectedForBuy, setSelectedForBuy] = useState(null)
  const [razorpayModal, setRazorpayModal] = useState(false)

  useEffect(() => {
    fetchCryptoList(50)
  }, [fetchCryptoList])

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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Trade cryptocurrencies in real-time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-dark border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Available Balance</p>
          <div className="flex justify-between items-end">
            <p className="text-3xl font-bold text-white">${user?.balance?.toFixed(2) || '0.00'}</p>
            <button
              onClick={() => setRazorpayModal(true)}
              className="bg-primary hover:bg-primary/90 text-white p-2 rounded-lg transition-colors flex items-center gap-1"
              title="Add Funds"
            >
              <Plus size={18} />
            </button>
          </div>
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

      {cryptoList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cryptoList.map((crypto) => (
            <CryptoCard
              key={crypto.id}
              crypto={crypto}
              onBuy={handleBuy}
              onSellOrAdd={(coin) => toast.info(`Add ${coin.name} to watchlist`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-400">No cryptocurrencies found</p>
        </div>
      )}

      {buyModal && selectedForBuy && (
        <BuyModal
          crypto={selectedForBuy}
          onClose={() => {
            setBuyModal(false)
            setSelectedForBuy(null)
          }}
        />
      )}

      <RazorpayModal
        isOpen={razorpayModal}
        onClose={() => setRazorpayModal(false)}
        onSuccess={(data) => {
          toast.success(`New wallet balance: Rs ${data.newBalance.toFixed(2)}`)
        }}
      />
    </div>
  )
}
