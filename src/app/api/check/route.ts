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
  const { domain } = await request.json()

  if (!domain) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
  }

  const cleanDomain = domain.toLowerCase().replace(/\.cl$/i, '').trim()

  if (!cleanDomain || cleanDomain.length < 2) {
    return NextResponse.json({ error: 'Invalid domain' }, { status: 400 })
  }

  const fullDomain = cleanDomain.endsWith('.cl') ? cleanDomain : `${cleanDomain}.cl`

  try {
    const status = await checkWhois(fullDomain)

    return NextResponse.json({
      domain: fullDomain,
      status,
      checkedAt: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check domain availability' },
      { status: 500 }
    )
  }
}