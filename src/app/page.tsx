"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface CheckResult {
  domain: string;
  status: "available" | "registered" | "unknown";
  checkedAt: string;
}

export default function Home() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    const input = domain.trim().toLowerCase();
    const hasTld = input.includes('.');
    const tld = hasTld ? input.split('.').pop() : null;

    if (tld && tld !== 'cl') {
      setError('Solo se aceptan dominios .CL');
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error checking domain");
      } else {
        setResult(data);
      }
    } catch {
      setError("Error checking domain");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>BuscaNic</h1>
      <p className={styles.description}>
        Consulta la disponibilidad de dominios .CL en tiempo real
      </p>

      <form onSubmit={handleSearch} className={styles.form}>
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="midominio"
          className={styles.input}
        />
        <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "buscando..." : "buscar"}
          </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <div className={styles.result}>
          <div className={styles.resultRow}>
            <span className={styles.domain}>{result.domain}</span>
            <a
              href={`https://www.nic.cl/registry/Whois.do?d=${result.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.status} ${
                result.status === "available"
                  ? styles.available
                  : result.status === "registered"
                  ? styles.registered
                  : styles.unknown
              }`}
            >
              {result.status === "available" && "disponible"}
              {result.status === "registered" && "registrado"}
              {result.status === "unknown" && "desconocido"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}