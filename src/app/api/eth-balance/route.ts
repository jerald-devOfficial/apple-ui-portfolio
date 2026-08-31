import { ethAddressSchema } from '@/contracts/etherscan'
import { fetchEtherscanJson, unwrapEtherscanResult } from '@/lib/etherscan'
import { NextResponse } from 'next/server'
import { formatEther } from 'viem'

// GET /api/eth-balance?address=0x…
export const GET = async (req: Request) => {
  const address = ethAddressSchema.safeParse(
    new URL(req.url).searchParams.get('address')
  )

  if (!address.success) {
    return NextResponse.json(
      { msg: 'A valid Ethereum address is required' },
      { status: 400 }
    )
  }

  try {
    const wei = unwrapEtherscanResult(
      await fetchEtherscanJson({
        module: 'account',
        action: 'balance',
        address: address.data,
        tag: 'latest'
      })
    )

    return NextResponse.json({
      address: address.data,
      wei,
      // Etherscan returns wei as a decimal string; parsing it as a float would
      // drop the low digits that make up a dust balance.
      eth: Number(formatEther(BigInt(wei)))
    })
  } catch (error) {
    console.error('Error fetching ETH balance:', error)

    return NextResponse.json(
      { msg: 'Failed to fetch balance from Etherscan' },
      { status: 502 }
    )
  }
}
