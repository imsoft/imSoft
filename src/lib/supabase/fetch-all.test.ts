import { describe, expect, it } from 'vitest'
import { fetchAll } from './fetch-all'

const table = Array.from({ length: 2501 }, (_, i) => ({ id: i }))
const page = (from: number, to: number) => Promise.resolve({ data: table.slice(from, to + 1), error: null })

describe('fetchAll', () => {
  it('reads past the 1,000-row cap, page by page (1,801 contacts on 2026-11-13)', async () => {
    expect((await fetchAll(page)).length).toBe(2501)
  })

  it('stops after an exact multiple of the page size', async () => {
    const two = table.slice(0, 2000)
    let calls = 0
    const rows = await fetchAll((from, to) => { calls += 1; return Promise.resolve({ data: two.slice(from, to + 1), error: null }) })
    expect(rows.length).toBe(2000)
    expect(calls).toBe(3)
  })

  it('throws on a Supabase error instead of returning a partial list', async () => {
    await expect(fetchAll(() => Promise.resolve({ data: null, error: { message: 'boom' } }))).rejects.toThrow('boom')
  })
})
