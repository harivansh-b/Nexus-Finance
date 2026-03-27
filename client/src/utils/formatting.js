// Format compact number (trillions, billions, etc)
export const formatCompactNumber = (value) => {
  if (value === undefined || value === null) return '0'
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

// Format currency
export const formatCurrency = (value, decimals = 2) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

// Format crypto amount
export const formatCryptoAmount = (value, decimals = 8) => {
  return parseFloat(value).toFixed(decimals)
}

// Format percentage
export const formatPercentage = (value, decimals = 2) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Get color based on value
export const getValueColor = (value) => {
  if (value > 0) return 'text-success'
  if (value < 0) return 'text-danger'
  return 'text-slate-400'
}

// Truncate address
export const truncateAddress = (address, chars = 4) => {
  if (!address) return ''
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`
}

// Debounce function
export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}
