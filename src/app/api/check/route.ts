import { NextRequest, NextResponse } from 'next/server'
import { createConnection } from 'net'

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
  const { domain, domains } = await request.json()

  let domainList: string[] = []

  if (domains && Array.isArray(domains)) {
    domainList = domains
  } else if (domain) {
    domainList = domain.split(',').map((d: string) => d.trim())
  }

  if (domainList.length === 0) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
  }

  if (domainList.length > 5) {
    return NextResponse.json({ error: 'Maximum 5 domains per search' }, { status: 400 })
  }

  const results = await Promise.all(
    domainList.map(async (d: string) => {
      const cleanDomain = d.toLowerCase().trim()
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