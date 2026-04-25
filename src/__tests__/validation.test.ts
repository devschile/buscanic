import { describe, it, expect } from 'vitest'
import { validateDomains } from '@/lib/validation'

describe('🔍 Domain Validation Module', () => {
  describe('📋 Input Limits', () => {
    it('[LIMIT] ✓ Accepts exactly 5 domains', () => {
      const input = 'a,b,c,d,e'
      const result = validateDomains(input)
      expect(result, `Should accept 5 domains → [${input}]`).toEqual(['a', 'b', 'c', 'd', 'e'])
    })

    it('[LIMIT] ✗ Rejects more than 5 domains', () => {
      const input = 'a.cl,b.cl,c.cl,d.cl,e.cl,f.cl'
      const result = validateDomains(input)
      expect(result, `Should reject 6+ domains (limit is 5) → [${input}]`).toBeNull()
    })
  })

  describe('🏛️ TLD Validation', () => {
    it('[TLD] ✓ Accepts .cl domains', () => {
      const input = 'devschile.cl'
      const result = validateDomains(input)
      expect(result, `Should accept .cl TLD → ${input}`).toEqual(['devschile.cl'])
    })

    it('[TLD] ✓ Accepts domains without TLD', () => {
      const input = 'devschile'
      const result = validateDomains(input)
      expect(result, `Should accept domain without TLD → ${input}`).toEqual(['devschile'])
    })

    it('[TLD] ✗ Rejects .com domains', () => {
      const input = 'example.com'
      const result = validateDomains(input)
      expect(result, `Should reject .com TLD → ${input}`).toBeNull()
    })

    it('[TLD] ✗ Rejects mixed TLDs', () => {
      const input = 'a.cl,b.com'
      const result = validateDomains(input)
      expect(result, `Should reject when any domain has non-.cl TLD → [${input}]`).toBeNull()
    })
  })

  describe('📝 String Formatting', () => {
    it('[FORMAT] ✓ Trims whitespace', () => {
      const input = ' devschile.cl , beerjs '
      const result = validateDomains(input)
      expect(result, `Should trim spaces from input → [${input}]`).toEqual(['devschile.cl', 'beerjs'])
    })

    it('[FORMAT] ✓ Converts to lowercase', () => {
      const input = 'DevSchile.CL,BeerJS'
      const result = validateDomains(input)
      expect(result, `Should normalize case to lowercase → [${input}]`).toEqual(['devschile.cl', 'beerjs'])
    })

    it('[FORMAT] ✓ Handles mixed case and spaces', () => {
      const input = ' DevSchile.CL , BeerJS '
      const result = validateDomains(input)
      expect(result, `Should normalize completely → [${input}]`).toEqual(['devschile.cl', 'beerjs'])
    })
  })

  describe('🔗 Multiple Domains Parsing', () => {
    it('[PARSE] ✓ Parses comma-separated domains', () => {
      const input = 'devschile.cl,beerjs,hack.cl'
      const result = validateDomains(input)
      expect(result, `Should parse all domains → [${input}]`).toEqual(['devschile.cl', 'beerjs', 'hack.cl'])
    })

    it('[PARSE] ✓ Filters empty parts between commas', () => {
      const input = 'devschile.cl,,beerjs,'
      const result = validateDomains(input)
      expect(result, `Should filter empty parts → [${input}]`).toEqual(['devschile.cl', 'beerjs'])
    })

    it('[PARSE] ✓ Handles leading commas', () => {
      const input = ',domain1,domain2'
      const result = validateDomains(input)
      expect(result, `Should ignore leading comma → [${input}]`).toEqual(['domain1', 'domain2'])
    })

    it('[PARSE] ✓ Handles trailing commas', () => {
      const input = 'domain1,domain2,'
      const result = validateDomains(input)
      expect(result, `Should ignore trailing comma → [${input}]`).toEqual(['domain1', 'domain2'])
    })
  })

  describe('🚫 Empty/Invalid Input', () => {
    it('[EMPTY] ✗ Returns empty array for empty string', () => {
      const input = ''
      const result = validateDomains(input)
      expect(result, `Should return [] for empty input → "${input}"`).toEqual([])
    })

    it('[EMPTY] ✗ Returns empty array for only commas', () => {
      const input = ','
      const result = validateDomains(input)
      expect(result, `Should return [] for only commas → "${input}"`).toEqual([])
    })

    it('[EMPTY] ✗ Returns empty array for multiple commas', () => {
      const input = ',,,'
      const result = validateDomains(input)
      expect(result, `Should return [] for multiple commas → "${input}"`).toEqual([])
    })

    it('[EMPTY] ✗ Returns empty array for spaces and commas', () => {
      const input = ' , , '
      const result = validateDomains(input)
      expect(result, `Should return [] for spaces+commas → "${input}"`).toEqual([])
    })
  })

  describe('🔤 Special Characters Support', () => {
    it('[CHARS] ✓ Accepts domains with hyphens', () => {
      const input = 'dev-schile.cl'
      const result = validateDomains(input)
      expect(result, `Should accept hyphens → ${input}`).toEqual(['dev-schile.cl'])
    })

    it('[CHARS] ✓ Accepts domains with numbers', () => {
      const input = 'dev123.cl'
      const result = validateDomains(input)
      expect(result, `Should accept numbers → ${input}`).toEqual(['dev123.cl'])
    })

    it('[CHARS] ✓ Accepts domains starting with numbers', () => {
      const input = '123test'
      const result = validateDomains(input)
      expect(result, `Should accept leading numbers → ${input}`).toEqual(['123test'])
    })

    it('[CHARS] ✓ Accepts complex domains', () => {
      const input = 'test-123.cl'
      const result = validateDomains(input)
      expect(result, `Should accept hyphens+numbers → ${input}`).toEqual(['test-123.cl'])
    })

    it('[CHARS] ✓ Accepts domains with tildes (á, é, í, ó, ú)', () => {
      const input = 'café.cl'
      const result = validateDomains(input)
      expect(result, `Should accept tildes → ${input}`).toEqual(['café.cl'])
    })

    it('[CHARS] ✓ Accepts domains with ñ', () => {
      const input = 'niño.cl'
      const result = validateDomains(input)
      expect(result, `Should accept ñ → ${input}`).toEqual(['niño.cl'])
    })

    it('[CHARS] ✓ Accepts domains with uppercase tildes', () => {
      const input = 'CAFÉ.CL'
      const result = validateDomains(input)
      expect(result, `Should accept uppercase tildes → ${input}`).toEqual(['café.cl'])
    })

    it('[CHARS] ✓ Accepts multiple domains with tildes', () => {
      const input = 'café,niño,mañana.cl'
      const result = validateDomains(input)
      expect(result, `Should accept multiple domains with tildes → [${input}]`).toEqual(['café', 'niño', 'mañana.cl'])
    })
  })
})