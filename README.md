# BuscaNic

Chuta, consulta la disponibilidad de dominios `.CL` en tiempo real usando el protocolo WHOIS de NIC Chile. Ya po, funciona bien.

## Uso

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador y Busca tu wea de dominio.

## API

```bash
curl -X POST http://localhost:3000/api/check \
  -H "Content-Type: application/json" \
  -d '{"domain": "midominio"}'
```

Te responde algo así:
```json
{
  "domain": "midominio.cl",
  "status": "available",
  "checkedAt": "2026-04-24T03:37:02.148Z"
}
```

Si está `available` está frei, si está `registered` ya está ocupado, y si es `unknown` alguma se pudrió.

## Tech Stack

- Next.js 16
- TypeScript
- IBM Plex Mono

Hecho con wea malta y cafe.