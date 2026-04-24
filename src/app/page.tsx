"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import styles from "./page.module.css";

interface DomainResult {
  domain: string;
  status: "available" | "registered" | "unknown";
  invalid?: boolean;
}

interface CheckResponse {
  results: DomainResult[];
  checkedAt: string;
}

export default function Home() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DomainResult[] | null>(null);
  const [error, setError] = useState("");

  const validateDomains = (input: string): string[] | null => {
    const parts = input.split(',').map(d => d.trim().toLowerCase());
    
    if (parts.length > 5) {
      return null;
    }
    
    for (const part of parts) {
      if (!part) continue;
      
      const hasTld = part.includes('.');
      const tld = hasTld ? part.split('.').pop() : null;
      
      if (tld && tld !== 'cl') {
        return null;
      }
    }
    
    return parts.filter(d => d.length > 0);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    const validated = validateDomains(domain.trim());

    if (!validated) {
      const parts = domain.trim().split(',').filter(d => d.trim());
      if (parts.length > 5) {
        setError('Máximo 5 dominios por búsqueda');
      } else {
        setError('Solo se aceptan dominios .CL');
      }
      setResults(null);
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      const data: CheckResponse = await res.json();

      if (!res.ok) {
        setError(data.results ? 'Error checking domains' : (data as any).error || "Error checking domains");
      } else {
        setResults(data.results);
        setDomain("");
      }
    } catch {
      setError("Error checking domains");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.container}>
        <h1 className={styles.title}>.BuscaNic &#123;&#125;</h1>
        <p className={styles.description}>
          Consulta la disponibilidad de dominios .CL en tiempo real
        </p>

        <form onSubmit={handleSearch} className={styles.form}>
          <input
            type="text"
            value={domain}
            onChange={(e) => {
              const sanitized = e.target.value
                .replace(/\s/g, "")
                .replace(/[^a-zA-Z0-9.,\-]/g, "");
              const parts = sanitized.split(',');
              const capped = parts.map(p => p.slice(0, 12));
              setDomain(capped.join(','));
            }}
            placeholder="devschile.cl"
            className={styles.input}
          />
          <button type="submit" disabled={loading || !domain.trim()} className={styles.button}>
            {loading ? "buscando..." : "_buscar"}
          </button>
        </form>
        <p className={styles.hint}>Para buscar múltiples dominios, sepáralos por coma (beerjs, huemul, generacv.cl)</p>

        {error && <p className={styles.error}>{error}</p>}

        {results && (
          <div className={styles.resultsList}>
            {results.map((r, i) => (
              <div key={i} className={styles.result}>
                <div className={styles.resultRow}>
                  <span className={styles.domain}>{r.domain}</span>
                  <a
                    href={`https://www.nic.cl/registry/Whois.do?d=${r.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.status} ${
                      r.status === "available"
                        ? styles.available
                        : r.status === "registered"
                        ? styles.registered
                        : styles.unknown
                    }`}
                  >
                    {r.status === "available" && "_disponible"}
                    {r.status === "registered" && "_registrado"}
                    {r.status === "unknown" && "_desconocido"}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <footer className={styles.footer}>
        <p>
          &copy; {new Date().getFullYear()} .BuscaNic &#123;&#125; por{" "} 
          <a href="https://www.devschile.cl/" target="_blank" rel="noopener noreferrer">
            devsChile
          </a>
          .{" "}
          No tenemos relación con <a href="https://www.nic.cl/" target="_blank" rel="noopener noreferrer">Nic Chile</a>, si nos banean hasta ahí llegó este proyecto.
        </p>
      </footer>
    </div>
  );
}