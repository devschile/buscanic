// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ writes: [] as string[] }))

vi.mock('net', async () => {
  const { EventEmitter } = await import('node:events')
  return {
    createConnection: vi.fn((_opts: unknown, onConnect: () => void) => {
      const client = new EventEmitter() as InstanceType<typeof EventEmitter> & {
        write: (s: string) => void
      }
      client.write = (s) => {
        mocks.writes.push(s)
      }
      setTimeout(() => {
        onConnect()
        client.emit('data', Buffer.from('No entries found'))
        client.emit('end')
      }, 0)
      return client
    }),
  }
})

import { POST } from '@/app/api/check/route'

const post = (body: unknown) =>
  POST(
    new NextRequest('http://localhost/api/check', {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  )

describe('🌐 POST /api/check', () => {
  beforeEach(() => {
    mocks.writes.length = 0
  })

  describe('📏 Domain Length Limit', () => {
    it('[LENGTH] ✓ Queries whois for a domain longer than 16 chars', async () => {
      const res = await post({ domain: 'a'.repeat(30) })
      const data = await res.json()
      expect(res.status, 'Should respond 200').toBe(200)
      expect(data.results[0].invalid, 'Should not be flagged invalid').toBe(false)
      expect(mocks.writes, 'Should query whois once').toEqual([`${'a'.repeat(30)}.cl\r\n`])
    })

    it('[LENGTH] ✓ Queries whois for exactly 56 characters', async () => {
      const domain = 'a'.repeat(53) + '.cl'
      const res = await post({ domain })
      const data = await res.json()
      expect(data.results[0].invalid, 'Should accept 56 chars').toBe(false)
      expect(mocks.writes, 'Should query whois once').toEqual([`${domain}\r\n`])
    })

    it('[LENGTH] ✗ Flags 57 characters as invalid without querying whois', async () => {
      const domain = 'a'.repeat(54) + '.cl'
      const res = await post({ domain })
      const data = await res.json()
      expect(data.results[0].invalid, 'Should flag 57 chars as invalid').toBe(true)
      expect(mocks.writes, 'Should not open a whois query').toEqual([])
    })
  })

  describe('🛡️ Input Safety', () => {
    it('[SAFE] ✗ Rejects CRLF injection without querying whois', async () => {
      const res = await post({ domains: ['evil.cl\r\nsecond-query'] })
      const data = await res.json()
      expect(data.results[0].invalid, 'Should flag CRLF payload as invalid').toBe(true)
      expect(mocks.writes, 'Nothing must reach the whois socket').toEqual([])
    })

    it('[SAFE] ✗ Returns 400 when domains contains non-strings', async () => {
      const res = await post({ domains: [123, { a: 1 }] })
      expect(res.status, 'Should respond 400').toBe(400)
      expect(mocks.writes, 'Should not query whois').toEqual([])
    })

    it('[SAFE] ✗ Returns 400 when domain is not a string', async () => {
      const res = await post({ domain: 42 })
      expect(res.status, 'Should respond 400 (no domain provided)').toBe(400)
    })

    it('[SAFE] ✗ Returns 400 on malformed JSON', async () => {
      const res = await post('{not json')
      expect(res.status, 'Should respond 400').toBe(400)
    })

    it('[SAFE] ✗ Returns 400 for an empty domain', async () => {
      const res = await post({ domain: '' })
      expect(res.status, 'Should respond 400').toBe(400)
    })

    it('[SAFE] ✗ Returns 400 for more than 5 domains', async () => {
      const res = await post({ domain: 'a1,b1,c1,d1,e1,f1' })
      expect(res.status, 'Should respond 400').toBe(400)
      expect(mocks.writes, 'Should not query whois').toEqual([])
    })
  })

  describe('🏛️ TLD Validation', () => {
    it('[TLD] ✗ Keeps rejecting non-.cl domains', async () => {
      const res = await post({ domain: 'example.com' })
      const data = await res.json()
      expect(data.results[0].invalid, 'Should flag .com as invalid').toBe(true)
      expect(mocks.writes, 'Should not query whois').toEqual([])
    })
  })
})
