import { useState, useEffect } from 'react';
import Papa from 'papaparse';

function parseRows(csvText) {
  const result = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return result.data || [];
}

async function fetchCSV(url) {
  if (!url) return null;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const text = await res.text();
  return parseRows(text);
}

export function useGoogleSheets(source) {
  const [social, setSocial] = useState(null);
  const [broadcast, setBroadcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!source) {
      setError('No data source configured.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      fetchCSV(source.socialUrl),
      fetchCSV(source.broadcastUrl),
    ]).then(([s, b]) => {
      setSocial(s);
      setBroadcast(b);
      setLoading(false);
    }).catch(e => {
      setError(e.message);
      setLoading(false);
    });
  }, [source?.socialUrl, source?.broadcastUrl]);

  return { social, broadcast, loading, error };
}
