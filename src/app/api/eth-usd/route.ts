import { NextResponse } from 'next/server'

// GET /api/eth-usd
export const GET = async () => {
  try {
    console.log('Fetching ETH-USD price from CoinGecko')
    const cgRes = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    )
    if (!cgRes.ok) {
      console.error('CoinGecko response not ok:', cgRes.status)
      return NextResponse.json(
        { msg: 'Failed to fetch from CoinGecko', status: cgRes.status },
        { status: 502 }
      )
    }
    const data = await cgRes.json()
    if (!data?.ethereum?.usd) {
      console.error('Unexpected CoinGecko response:', data)
      return NextResponse.json(
        { msg: 'Invalid data from CoinGecko', data },
        { status: 502 }
      )
    }
    console.log('ETH-USD price:', data.ethereum.usd)
    return NextResponse.json({ usd: data.ethereum.usd })
  } catch (error) {
    console.error('Error fetching ETH-USD price:', error)
    return NextResponse.json(
      {
        msg: 'Error fetching ETH-USD price',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
