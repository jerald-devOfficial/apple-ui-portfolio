/**
 * Etherscan retired the V1 host (`api.etherscan.io/api`): it now answers every
 * request with `{ status: '0', result: 'You are using a deprecated V1
 * endpoint' }`. V2 is multichain, so `chainid` is required.
 *
 * Only route handlers may import this module — `ETHERSCAN_API_KEY` is a
 * server-side secret and would be inlined into the client bundle otherwise.
 */
const ETHERSCAN_V2_ENDPOINT = 'https://api.etherscan.io/v2/api'
const ETHEREUM_MAINNET_CHAIN_ID = '1'

export const buildEtherscanUrl = (params: Record<string, string>) => {
  const url = new URL(ETHERSCAN_V2_ENDPOINT)

  url.searchParams.set('chainid', ETHEREUM_MAINNET_CHAIN_ID)

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const apiKey = getEtherscanApiKey()

  if (apiKey) url.searchParams.set('apikey', apiKey)

  return url.toString()
}

/** Server-only. Reads `ETHERSCAN_API_KEY`; the leftover public name is ignored. */
export const getEtherscanApiKey = () => process.env.ETHERSCAN_API_KEY ?? ''

export const fetchEtherscanJson = async (params: Record<string, string>) => {
  const res = await fetch(buildEtherscanUrl(params), {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'User-Agent': 'jeraldbaroro.xyz eth-proxy'
    }
  })

  if (!res.ok) {
    throw new Error(`Etherscan HTTP ${res.status}`)
  }

  return res.json() as Promise<EtherscanEnvelope>
}

type EtherscanEnvelope = {
  status?: string
  message?: string
  result?: unknown
  error?: { message?: string }
}

const failureReason = (payload: EtherscanEnvelope) =>
  typeof payload.result === 'string' && payload.result
    ? payload.result
    : (payload.message ?? 'Etherscan request failed')

/**
 * Reads the payload of a `module=account` response, turning the `status: '0'`
 * envelope (deprecation, rate limit, invalid key) into a thrown error so the
 * caller cannot mistake it for a balance.
 */
export const unwrapEtherscanResult = (payload: EtherscanEnvelope) => {
  if (payload.status === '1' && typeof payload.result === 'string') {
    return payload.result
  }

  throw new Error(failureReason(payload))
}

/**
 * Reads a `module=proxy` response. These carry a JSON-RPC result rather than
 * the `status` envelope, except when Etherscan itself rejects the request.
 * `null` means the node has no record of the hash.
 */
export const unwrapEtherscanProxyResult = (payload: EtherscanEnvelope) => {
  if (payload.error?.message) throw new Error(payload.error.message)
  if (payload.status === '0') throw new Error(failureReason(payload))
  if (payload.result === null || payload.result === undefined) return null

  if (typeof payload.result !== 'object') {
    throw new Error(failureReason(payload))
  }

  return payload.result as Record<string, unknown>
}
