"use client";

import { useState } from 'react';
import { TopicSelector } from '@/components/TopicSelector';
import { BriefResults } from '@/components/BriefResults';
import { Spinner } from '@/components/Spinner';
import { Topic } from '@/lib/sources';

const articleLimit = 5; 

const HomePage = () => {
  const [topics, setTopics] = useState<Topic[]>(["business"]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBrief = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics, limit: articleLimit }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Request failed");
      setArticles(data.items ?? []);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
  <main className="container">
    <div className="card" style={{ marginBottom: 16 }}>
      <h1 style={{ margin: 0 }}>Briefly</h1>
      <p className="small" style={{ marginTop: 6 }}>
        Pick topics and generate a quick daily brief.
      </p>

      <TopicSelector value={topics} onChange={setTopics} />

      <button className="primary" onClick={generateBrief} disabled={loading || topics.length === 0}>
        {loading ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Spinner /> Generating...
          </span>
        ) : (
          "Generate Brief"
        )}
      </button>

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}
    </div>

    <BriefResults articles={articles} />
  </main>
);
}

export default HomePage;
