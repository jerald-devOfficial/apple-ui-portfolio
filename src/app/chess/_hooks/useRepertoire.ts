import { fetcher } from '@/lib/fetcher'
import type { IRepertoire } from '@/models/Repertoire'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'

interface RepertoireResponse {
  repertoire: IRepertoire
  success: boolean
}

export const useRepertoire = () => {
  const { status } = useSession()

  const shouldFetch = status === 'authenticated'

  const { data, error, isLoading, mutate, isValidating } =
    useSWR<RepertoireResponse>(
      shouldFetch ? '/api/chess/repertoire' : null,
      fetcher,
      { revalidateOnFocus: true }
    )

  const updateRepertoire = async (update: Record<string, unknown>) => {
    const res = await fetch('/api/chess/repertoire', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ update })
    })

    if (!res.ok) {
      throw new Error('Failed to update repertoire')
    }

    const result = await res.json()
    await mutate(result, false)
    return result.repertoire as IRepertoire
  }

  const importPgn = async (sectionId: string, lineId: string, pgn: string) => {
    const res = await fetch('/api/chess/repertoire/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionId, lineId, pgn })
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(
        typeof body.msg === 'string' ? body.msg : 'Failed to import PGN'
      )
    }

    const result = await res.json()
    await mutate(result, false)
    return result.repertoire as IRepertoire
  }

  return {
    repertoire: data?.repertoire,
    isLoading: status === 'loading' || (shouldFetch && isLoading),
    isValidating,
    error,
    mutate,
    updateRepertoire,
    importPgn
  }
}
