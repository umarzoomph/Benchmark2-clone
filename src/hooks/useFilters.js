import { useState, useMemo } from 'react';
import { parseDateStr } from '../utils/formatters';
import { aggregate, buildTotalRow } from '../utils/aggregator';

const INITIAL = {
  groupBy:      'exposures',
  dateFrom:     '',
  dateTo:       '',
  networks:     [],
  contentTypes: [],
  leagues:      [],
  teams:        [],
  brands:       [],
  assets:       [],
  logic: {
    networks:     'AND',
    contentTypes: 'AND',
    leagues:      'AND',
    teams:        'AND',
    brands:       'AND',
    assets:       'AND',
  },
};

function matchesMulti(value, selected, logic) {
  if (!selected.length) return true;
  if (logic === 'OR') return selected.some(s => s === value);
  return selected.every(s => s === value); // AND for single value = same as OR for single field
}

// For AND across sections: each section must match
function matchesSection(value, selected) {
  if (!selected.length) return true;
  return selected.includes(value);
}

export function useFilters(rawRows, dataType) {
  const [filters, setFilters] = useState(INITIAL);

  // Derived unique values for sidebar dropdowns
  const uniques = useMemo(() => {
    if (!rawRows) return { networks:[], contentTypes:[], leagues:[], teams:[], brands:[], assets:[] };
    const toStr = v => (v != null && v !== '') ? String(v) : null;
    return {
      networks:     [...new Set(rawRows.map(r => toStr(r.ServiceType)).filter(Boolean))].sort(),
      contentTypes: [...new Set(rawRows.map(r => toStr(r.ContentType)).filter(Boolean))].sort(),
      leagues:      [...new Set(rawRows.map(r => toStr(r.League)).filter(Boolean))].sort(),
      teams:        [...new Set(rawRows.map(r => toStr(r.PartnerExposureCreatorName)).filter(Boolean))].sort(),
      brands:       [...new Set(rawRows.map(r => toStr(r.Partner)).filter(Boolean))].sort(),
      assets:       [...new Set(rawRows.map(r => toStr(r.PartnerAssetLabel)).filter(Boolean))].sort(),
    };
  }, [rawRows]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (!rawRows) return [];
    const { dateFrom, dateTo, networks, contentTypes, leagues, teams, brands, assets } = filters;
    const from = parseDateStr(dateFrom);
    const to   = parseDateStr(dateTo);

    return rawRows.filter(r => {
      const d = parseDateStr(r.PartnerExposureDate);
      if (from && d && d < from) return false;
      if (to   && d && d > to)   return false;
      if (!matchesSection(r.ServiceType,               networks))     return false;
      if (!matchesSection(r.ContentType,               contentTypes)) return false;
      if (!matchesSection(r.League,                    leagues))      return false;
      if (!matchesSection(r.PartnerExposureCreatorName, teams))       return false;
      if (!matchesSection(r.Partner,                   brands))       return false;
      if (!matchesSection(r.PartnerAssetLabel,         assets))       return false;
      return true;
    });
  }, [rawRows, filters]);

  // Aggregated rows
  const derivedRows = useMemo(() => {
    const agg = aggregate(filteredRows, filters.groupBy);
    const isRH = filters.groupBy === 'rights_holders';
    return agg.sort((a, b) => (isRH ? b.socialValue - a.socialValue : b.brandValue - a.brandValue));
  }, [filteredRows, filters.groupBy]);

  // Total row
  const totalRow = useMemo(() => buildTotalRow(derivedRows, filters.groupBy), [derivedRows, filters.groupBy]);

  // Active chips
  const activeChips = useMemo(() => {
    const chips = [];
    chips.push({ key: 'groupBy', label: `Group By: ${filters.groupBy.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}`, removable: false });
    filters.networks.forEach(v     => chips.push({ key: `network:${v}`,     label: `Network: ${v}`,      field: 'networks',     value: v }));
    filters.contentTypes.forEach(v => chips.push({ key: `ct:${v}`,          label: `Type: ${v}`,         field: 'contentTypes', value: v }));
    filters.leagues.forEach(v      => chips.push({ key: `league:${v}`,      label: `League: ${v}`,       field: 'leagues',      value: v }));
    filters.teams.forEach(v        => chips.push({ key: `team:${v}`,        label: `Team: ${v}`,         field: 'teams',        value: v }));
    filters.brands.forEach(v       => chips.push({ key: `brand:${v}`,       label: `Brand: ${v}`,        field: 'brands',       value: v }));
    filters.assets.forEach(v       => chips.push({ key: `asset:${v}`,       label: `Asset: ${v}`,        field: 'assets',       value: v }));
    if (filters.dateFrom || filters.dateTo) {
      chips.push({ key: 'date', label: `Date: ${filters.dateFrom||'…'} – ${filters.dateTo||'…'}`, field: 'date' });
    }
    return chips;
  }, [filters]);

  function setGroupBy(v)    { setFilters(f => ({ ...f, groupBy: v })); }
  function setDateFrom(v)   { setFilters(f => ({ ...f, dateFrom: v })); }
  function setDateTo(v)     { setFilters(f => ({ ...f, dateTo: v })); }
  function setLogic(field, v) { setFilters(f => ({ ...f, logic: { ...f.logic, [field]: v } })); }

  function toggleTag(field, value) {
    setFilters(f => {
      const arr = f[field];
      const next = arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value];
      return { ...f, [field]: next };
    });
  }

  function removeChip(chip) {
    if (!chip.field || !chip.value) {
      if (chip.field === 'date') setFilters(f => ({ ...f, dateFrom: '', dateTo: '' }));
      return;
    }
    setFilters(f => ({ ...f, [chip.field]: f[chip.field].filter(x => x !== chip.value) }));
  }

  function clearAll() {
    setFilters(f => ({ ...INITIAL, groupBy: f.groupBy }));
  }

  function saveFilters() {
    try { localStorage.setItem('benchmark2_filters', JSON.stringify(filters)); } catch (e) {}
  }

  return {
    filters,
    setGroupBy,
    setDateFrom,
    setDateTo,
    setLogic,
    toggleTag,
    removeChip,
    clearAll,
    saveFilters,
    uniques,
    filteredRows,
    derivedRows,
    totalRow,
    activeChips,
  };
}
