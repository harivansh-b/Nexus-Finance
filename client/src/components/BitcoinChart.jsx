import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import apiClient from '../services/api'

const ranges = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
]

const formatAxisDate = (value, days) => {
  const date = new Date(value)
  return days <= 7
    ? date.toLocaleDateString('en-US', { weekday: 'short' })
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function BitcoinChart() {
  const [selectedRange, setSelectedRange] = useState(30)
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchHistory = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await apiClient.get(`/crypto/bitcoin/history?days=${selectedRange}`)
        if (isMounted) {
          setHistory(response.data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load Bitcoin history')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchHistory()

    return () => {
      isMounted = false
    }
  }, [selectedRange])

  const trend = useMemo(() => {
    if (history.length < 2) return { change: 0, percentage: 0 }

    const first = history[0].price
    const last = history[history.length - 1].price
    const change = last - first
    const percentage = first ? (change / first) * 100 : 0

    return { change, percentage }
  }, [history])

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-amber-400/20 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_38%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(2,6,23,0.92))] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
      <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/80">
              Bitcoin Pulse
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">BTC market structure</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              Live historical pricing from CoinGecko, shaped into a focused view for trend and momentum.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {ranges.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedRange(range.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  selectedRange === range.value
                    ? 'bg-amber-300 text-slate-950 shadow-[0_10px_30px_rgba(252,211,77,0.28)]'
                    : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Latest Close</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {history.length ? `$${history[history.length - 1].price.toLocaleString()}` : '--'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Range Move</p>
            <p className={`mt-3 text-3xl font-semibold ${trend.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.change >= 0 ? '+' : ''}${Math.abs(trend.change).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Momentum</p>
            <p className={`mt-3 text-3xl font-semibold ${trend.percentage >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.percentage >= 0 ? '+' : ''}{trend.percentage.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="h-[340px] rounded-[24px] border border-white/8 bg-slate-950/45 p-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-slate-400">
              Loading Bitcoin chart...
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center text-rose-300">
              {error}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="btcArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  tickFormatter={(value) => formatAxisDate(value, selectedRange)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '16px',
                    color: '#fff',
                  }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'BTC']}
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  }
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  fill="url(#btcArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  )
}
