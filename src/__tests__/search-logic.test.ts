import { describe, it, expect } from 'vitest'
import { validateDomains } from '@/lib/validation'

// Additional integration tests for search logic
describe('Search Logic Integration', () => {
  it('should handle real-world domain search scenarios', () => {
    // Test cases that cover the main search scenarios

    // Single domain
    expect(validateDomains('devschile.cl'), 'Single .cl domain should be accepted').toEqual(['devschile.cl'])

    // Multiple domains
    expect(validateDomains('devschile.cl,beerjs,hack.cl'), 'Multiple valid domains should be parsed').toEqual(['devschile.cl', 'beerjs', 'hack.cl'])

    // Domains with spaces (should be trimmed)
    expect(validateDomains(' devschile.cl , beerjs '), 'Domains with extra spaces should be trimmed').toEqual(['devschile.cl', 'beerjs'])

    // Invalid cases
    expect(validateDomains('example.com'), 'Non-CL TLD should be rejected').toBeNull()
    expect(validateDomains('a,b,c,d,e,f'), 'More than 5 domains should be rejected').toBeNull() // More than 5
    expect(validateDomains(','), 'Only comma should return empty array').toEqual([]) // Only commas
    expect(validateDomains(''), 'Empty string should return empty array').toEqual([]) // Empty
  })

  it('should validate domain format constraints', () => {
    // Valid formats
    expect(validateDomains('test'), 'Domain without TLD should be valid').toEqual(['test'])
    expect(validateDomains('test.cl'), 'Domain with .cl TLD should be valid').toEqual(['test.cl'])
    expect(validateDomains('test-123.cl'), 'Domain with hyphens and numbers should be valid').toEqual(['test-123.cl'])
    expect(validateDomains('123test'), 'Domain starting with numbers should be valid').toEqual(['123test'])

    // Invalid TLDs
    expect(validateDomains('test.com'), '.com TLD should be rejected').toBeNull()
    expect(validateDomains('test.org'), '.org TLD should be rejected').toBeNull()
    expect(validateDomains('test.net'), '.net TLD should be rejected').toBeNull()

    // Mixed valid/invalid
    expect(validateDomains('valid.cl,invalid.com'), 'Mixed valid/invalid TLDs should be rejected').toBeNull()
  })

  it('should handle edge cases with commas', () => {
    expect(validateDomains('domain1,domain2,'), 'Trailing comma should be ignored').toEqual(['domain1', 'domain2'])
    expect(validateDomains(',domain1,domain2'), 'Leading comma should be ignored').toEqual(['domain1', 'domain2'])
    expect(validateDomains('domain1,,domain2'), 'Empty part between commas should be filtered').toEqual(['domain1', 'domain2'])
    expect(validateDomains(',,,'), 'Multiple commas should return empty array').toEqual([])
    expect(validateDomains(' , , '), 'Spaces and commas should return empty array').toEqual([])
  })

  it('should respect the 5 domain limit', () => {
    expect(validateDomains('a,b,c,d,e'), 'Exactly 5 domains should be accepted').toEqual(['a', 'b', 'c', 'd', 'e'])
    expect(validateDomains('a,b,c,d,e,f'), '6 domains should be rejected').toBeNull()
    expect(validateDomains('a.cl,b.cl,c.cl,d.cl,e.cl'), 'Exactly 5 .cl domains should be accepted').toEqual(['a.cl', 'b.cl', 'c.cl', 'd.cl', 'e.cl'])
    expect(validateDomains('a.cl,b.cl,c.cl,d.cl,e.cl,f.cl'), '6 .cl domains should be rejected').toBeNull()
  })

  it('should support NIC Chile special characters (tildes and hyphens)', () => {
    // Domains with tildes
    expect(validateDomains('café.cl'), 'Domains with tildes should be accepted').toEqual(['café.cl'])
    expect(validateDomains('niño'), 'Domains with ñ should be accepted').toEqual(['niño'])
    expect(validateDomains('mañana.cl'), 'Domains with tildes and hyphens should be accepted').toEqual(['mañana.cl'])
    
    // Mixed with other valid characters
    expect(validateDomains('café-niño.cl'), 'Domains with tildes and hyphens should be accepted').toEqual(['café-niño.cl'])
    expect(validateDomains('café,niño.cl,mañana'), 'Multiple domains with tildes should be accepted').toEqual(['café', 'niño.cl', 'mañana'])
    
    // Uppercase tildes should be normalized to lowercase
    expect(validateDomains('CAFÉ.CL'), 'Uppercase tildes should be normalized').toEqual(['café.cl'])
    expect(validateDomains('NIÑO'), 'Uppercase ñ should be normalized').toEqual(['niño'])
  })
})