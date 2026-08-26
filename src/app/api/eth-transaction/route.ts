import { ethTransactionSchema, ethTxHashSchema } from '@/contracts/etherscan'
import { buildEtherscanUrl, unwrapEtherscanProxyResult } from '@/lib/etherscan'
import { NextResponse } from 'next/server'

// GET /api/eth-transaction?hash=0x…
export const GET = async (req: Request) => {
  const hash = ethTxHashSchema.safeParse(
    new URL(req.url).searchParams.get('hash')
  )

  if (!hash.success) {
    return NextResponse.json(
      { msg: 'A valid 32-byte transaction hash is required' },
      { status: 400 }
    )
  }

  try {
    const res = await fetch(
      buildEtherscanUrl({
        module: 'proxy',
        action: 'eth_getTransactionByHash',
        txhash: hash.data
      })
    )
    const result = unwrapEtherscanProxyResult(await res.json())

    if (!result) {
      return NextResponse.json(
        { msg: 'Transaction not found' },
        { status: 404 }
      )
    }

    const transaction = ethTransactionSchema.safeParse(result)

    if (!transaction.success) {
      console.error(
        'Unexpected Etherscan transaction shape:',
        transaction.error.issues
      )

      return NextResponse.json(
        { msg: 'Unexpected response from Etherscan' },
        { status: 502 }
      )
    }

    return NextResponse.json({ transaction: transaction.data })
  } catch (error) {
    console.error('Error fetching transaction:', error)

    return NextResponse.json(
      { msg: 'Failed to fetch the transaction from Etherscan' },
      { status: 502 }
    )
  }
}
