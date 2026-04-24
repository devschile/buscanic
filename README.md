# .BuscaNic {}

Chuata, búscate la disponibilidad de dominios `.CL` en tiempo real usando el protocolo WHOIS de NIC Chile. Tal cual, piola.

## Uso

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador y mete tu wea de dominio. Pueden ser varios si te ponís creativo.

## API

```bash
curl -X POST http://localhost:3000/api/check \
  -H "Content-Type: application/json" \
  -d '{"domain": "midominio"}'
```

Te responde una weá así:

```json
{
  "domain": "midominio.cl",
  "status": "available",
  "checkedAt": "2026-04-24T03:37:02.148Z"
}
```

Si está `available` tay listoco, si está `registered` te fuiste, y si es `unknown` algo se pudrió.

## Tech Stack

- Next.js 16
- TypeScript
- IBM Plex Mono

Hecho con weas como malta con huevo y café.

Por los tremendos lokos de [devsChile](https://www.devschile.cl). Permiso: [MIT](LICENSE).
