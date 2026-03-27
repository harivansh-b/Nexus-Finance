import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export default function CoinHistoryChart({
  data = [],
  color = '#22D3EE',
  height = 260,
  compact = false,
}) {
  const chartData = useMemo(
    () =>
      data.map((point) => ({
        ...point,
        shortDate: new Date(point.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      })),
    [data]
  )

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: compact ? -28 : -8, bottom: 0 }}>
          {!compact && <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />}
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.42} />
              <stop offset="100%" stopColor={color} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="shortDate"
            tick={compact ? false : { fill: '#94A3B8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={compact ? false : { fill: '#94A3B8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={compact ? 0 : 80}
            tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
          />
          <Tooltip
            cursor={{ stroke: 'rgba(148,163,184,0.24)', strokeWidth: 1 }}
            contentStyle={{
              backgroundColor: '#020617',
              border: '1px solid rgba(34,211,238,0.22)',
              borderRadius: '14px',
              color: '#fff',
            }}
            formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Price']}
            labelFormatter={(value, payload) =>
              payload?.[0]?.payload?.date
                ? new Date(payload[0].payload.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : value
            }
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={compact ? 2 : 3}
            fill={`url(#gradient-${color.replace('#', '')})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
