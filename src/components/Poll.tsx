import { useEffect, useState } from 'react';

interface PollProps {
  id: string;
  question: string;
}

interface Counts { yes: number; no: number }

type Choice = 'yes' | 'no';

const API = import.meta.env.PUBLIC_POLL_API ?? '';
const storageKey = (id: string) => `poll:${id}`;

export default function Poll({ id, question }: PollProps) {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [voted, setVoted] = useState<Choice | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prior = localStorage.getItem(storageKey(id));
    if (prior === 'yes' || prior === 'no') setVoted(prior);

    if (!API) {
      setError('Poll API not configured');
      return;
    }
    fetch(`${API}/poll/${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: Counts) => setCounts(data))
      .catch(() => setError('Could not load votes'));
  }, [id]);

  const vote = async (choice: Choice) => {
    if (voted || !API) return;
    setVoted(choice);
    localStorage.setItem(storageKey(id), choice);
    setCounts((prev) => (prev ? { ...prev, [choice]: prev[choice] + 1 } : prev));

    try {
      const r = await fetch(`${API}/poll/${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ vote: choice }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data: Counts = await r.json();
      setCounts(data);
    } catch {
      setError('Vote failed to save');
    }
  };

  const total = counts ? counts.yes + counts.no : 0;
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  return (
    <div className="poll">
      <p className="poll-q">{question}</p>
      {!voted ? (
        <div className="poll-buttons">
          <button className="poll-btn" onClick={() => vote('yes')} disabled={!counts && !error}>Yes</button>
          <button className="poll-btn" onClick={() => vote('no')} disabled={!counts && !error}>No</button>
        </div>
      ) : (
        <div className="poll-results">
          {(['yes', 'no'] as const).map((k) => (
            <div className="poll-row" key={k}>
              <span className="poll-label">{k === 'yes' ? 'Yes' : 'No'}</span>
              <div className="poll-bar">
                <div className="poll-bar-fill" style={{ width: `${pct(counts?.[k] ?? 0)}%` }} />
              </div>
              <span className="poll-count">{pct(counts?.[k] ?? 0)}% · {counts?.[k] ?? 0}</span>
            </div>
          ))}
          <p className="poll-meta">
            {total} vote{total === 1 ? '' : 's'} · you voted {voted}
          </p>
        </div>
      )}
      {error && <p className="poll-meta" style={{ color: '#b54a1f' }}>{error}</p>}
    </div>
  );
}
