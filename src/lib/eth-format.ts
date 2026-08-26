/**
 * Smallest amount shown as a number. Below this, MetaMask itself switches to
 * `<0.00001`, and rounding to a fixed number of decimals would print `0.0000`
 * for a wallet that is not actually empty.
 */
const MIN_DISPLAYED_ETH = 0.00001
const MIN_DISPLAYED_USD = 0.01
const ETH_DISPLAY_DECIMALS = 5

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

export const formatEthBalance = (eth: number) => {
  if (!Number.isFinite(eth) || eth <= 0) return '0'
  if (eth < MIN_DISPLAYED_ETH) {
    return `<${MIN_DISPLAYED_ETH.toFixed(ETH_DISPLAY_DECIMALS)}`
  }

  return eth.toFixed(ETH_DISPLAY_DECIMALS).replace(/0+$/, '').replace(/\.$/, '')
}

export const formatUsdBalance = (usd: number) => {
  if (!Number.isFinite(usd) || usd <= 0) return usdFormatter.format(0)
  if (usd < MIN_DISPLAYED_USD)
    return `<${usdFormatter.format(MIN_DISPLAYED_USD)}`

  return usdFormatter.format(usd)
}
