"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import styles from "./page.module.css";
import { validateDomains } from "@/lib/validation";

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    const validated = validateDomains(domain.trim());

    if (!validated || validated.length === 0) {
      const parts = domain.trim().split(',').filter(d => d.trim());
      if (parts.length > 5) {
        setError('Tranquilein, hasta 5 dominios por búsqueda');
      } else if (parts.length === 0) {
        setError('Ingresa al menos un dominio válido');
      } else {
        setError('Cammao, solo .CL machucao.');
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
        body: JSON.stringify({ domain: validated.join(",") }),
      });

      const data: CheckResponse | ErrorResponse = await res.json();

      if (!res.ok) {
        setError("error" in data ? data.error || "Error checking domains" : "Error checking domains");
      } else {
        if ("results" in data) {
          setResults(data.results);
          setDomain("");
        } else {
          setError("Error checking domains");
        }
      }
    } catch {
      setError("Error checking domains");
    } finally {
      setLoading(false);
    }
  };

  const currentValidation = validateDomains(domain.trim());
  const isSubmitDisabled =
    loading ||
    !domain.trim() ||
    !currentValidation ||
    currentValidation.length === 0;

  return (
    <div>
      <div className={styles.container}>
        <h1 className={styles.title}>.BuscaNic &#123;&#125;</h1>
        <p className={styles.description}>
          Lorea la disponibilidad de dominios .CL en tiempo real. La firme.
        </p>

        <form onSubmit={handleSearch} className={styles.form}>
          <input
            type="text"
            value={domain}
            onChange={(e) => {
              const sanitized = e.target.value
                .replace(/\s/g, "")
                .replace(/[^a-zA-Z0-9.,\-áéíóúñÁÉÍÓÚÑ]/g, "");
              const parts = sanitized.split(',');
              const capped = parts.map(p => p.slice(0, 16));
              setDomain(capped.join(','));
            }}
            placeholder="devschile.cl"
            className={styles.input}
          />
          <button type="submit" disabled={isSubmitDisabled} className={styles.button}>
            {loading ? "buscando..." : "_aver"}
          </button>
        </form>
        <p className={styles.hint}>¿Ansioso? Busca hartos, sepáralos por coma (beerjs, huemul, generacv.cl)</p>

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
                    {r.status === "available" && "_taweno"}
                    {r.status === "registered" && "_tatomao"}
                    {r.status === "unknown" && "_quesesto"}
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
          No tenemos relación con <a href="https://www.nic.cl/" target="_blank" rel="noopener noreferrer">Nic Chile</a>. Si nos banean hasta ahí llegó esta weá.
        </p>
      </footer>
    </div>
  );
}