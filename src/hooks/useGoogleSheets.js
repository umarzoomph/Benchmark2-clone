import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { MOCK_SOCIAL, MOCK_BROADCAST } from '../mockData';

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
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return parseRows(text);
  } catch (e) {
    console.warn('Failed to fetch CSV:', url, e.message);
    return null;
  }
}

export function useGoogleSheets(source) {
  const [social, setSocial] = useState(null);
  const [broadcast, setBroadcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!source) {
      setSocial(MOCK_SOCIAL);
      setBroadcast(MOCK_BROADCAST);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      fetchCSV(source.socialUrl),
      fetchCSV(source.broadcastUrl),
    ]).then(([s, b]) => {
      setSocial(s && s.length > 0 ? s : MOCK_SOCIAL);
      setBroadcast(b && b.length > 0 ? b : MOCK_BROADCAST);
      setLoading(false);
    }).catch(e => {
      setError(e.message);
      setSocial(MOCK_SOCIAL);
      setBroadcast(MOCK_BROADCAST);
      setLoading(false);
    });
  }, [source?.socialUrl, source?.broadcastUrl]);

  return { social, broadcast, loading, error };
}
