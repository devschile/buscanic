import { NextRequest, NextResponse } from 'next/server'
import { createConnection } from 'net'
import { MAX_DOMAINS, MAX_DOMAIN_LENGTH, isValidDomainPart } from '@/lib/validation'

async function checkWhois(domain: string): Promise<'available' | 'registered' | 'unknown'> {
  return new Promise((resolve) => {
    const client = createConnection({ host: 'whois.nic.cl', port: 43 }, () => {
      client.write(domain + '\r\n')
    })

    let data = ''

    client.on('data', (chunk) => {
      data += chunk.toString()
    })

    client.on('end', () => {
      const lowerData = data.toLowerCase()
      if (lowerData.includes('no entries found') || lowerData.includes('no found')) {
        resolve('available')
      } else if (
        lowerData.includes('registrant name') ||
        lowerData.includes('creation date') ||
        lowerData.includes('expiration date') ||
        lowerData.includes('name server')
      ) {
        resolve('registered')
      } else {
        resolve('unknown')
      }
    })

    client.on('error', () => {
      resolve('unknown')
    })
  })
}

export async function POST(request: NextRequest) {
  let body: { domain?: unknown; domains?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { domain, domains } = body ?? {}

  let domainList: unknown[] = []

  if (Array.isArray(domains)) {
    domainList = domains
  } else if (typeof domain === 'string' && domain) {
    domainList = domain.split(',').map((d) => d.trim())
  }

  if (!domainList.every((d): d is string => typeof d === 'string')) {
    return NextResponse.json({ error: 'Domains must be strings' }, { status: 400 })
  }

  if (domainList.length === 0) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
  }

  if (domainList.length > MAX_DOMAINS) {
    return NextResponse.json({ error: `Maximum ${MAX_DOMAINS} domains per search` }, { status: 400 })
  }

  const results = await Promise.all(
    (domainList as string[]).map(async (d) => {
      const cleanDomain = d.toLowerCase().trim()

      if (!isValidDomainPart(cleanDomain)) {
        return { domain: cleanDomain.slice(0, MAX_DOMAIN_LENGTH), status: 'unknown' as const, invalid: true, error: 'Dominio inválido' }
      }
      const hasTld = cleanDomain.includes('.')
      const tld = hasTld ? cleanDomain.split('.').pop() : null
      
      if (tld && tld !== 'cl') {
        return { domain: d, status: 'unknown' as const, invalid: true, error: 'Solo se aceptan dominios .CL' }
      }
      
      const domainWithoutTld = cleanDomain.replace(/\.cl$/i, '')
      
      if (!domainWithoutTld || domainWithoutTld.length < 2) {
        return { domain: d, status: 'unknown' as const, invalid: true }
      }

      const fullDomain = domainWithoutTld.endsWith('.cl') ? domainWithoutTld : `${domainWithoutTld}.cl`
      const status = await checkWhois(fullDomain)

      return { domain: fullDomain, status, invalid: false }
    })
  )

  return NextResponse.json({
    results,
    checkedAt: new Date().toISOString(),
  })
}