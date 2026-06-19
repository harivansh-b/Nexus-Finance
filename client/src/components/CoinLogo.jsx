import { useEffect, useState } from 'react'

export default function CoinLogo({ src, symbol, name, className = '' }) {
  const [failed, setFailed] = useState(!src)
  const label = (symbol || name || '?').slice(0, 3).toUpperCase()

  useEffect(() => {
    setFailed(!src)
  }, [src])

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-800 text-xs font-black uppercase text-slate-300 ${className}`}
        aria-label={name || symbol || 'Coin'}
      >
        {label}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name || symbol || 'Coin'}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
