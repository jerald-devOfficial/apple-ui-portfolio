'use client'

import { IDiary } from '@/models/Diary'
import useSWR, { Fetcher } from 'swr'

const Diaries = () => {
  const fetcher: Fetcher<IDiary[], string> = (url) =>
    fetch(url).then((res) => res.json())

  const { data, error, isLoading, mutate } = useSWR('/api/diary', fetcher)

  console.log('data: ', data)

  return (
    <main>
      <div>Diaries</div>
      {data &&
        data.map((diary: IDiary) => <div key={diary._id}>{diary.title}</div>)}
    </main>
  )
}

export default Diaries
