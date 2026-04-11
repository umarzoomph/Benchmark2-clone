export const DATA_SOURCES = [
  {
    id: 'nfl-2026',
    label: 'NFL · 2026',
    socialUrl: process.env.REACT_APP_SOCIAL_CSV_URL,
    broadcastUrl: process.env.REACT_APP_BROADCAST_CSV_URL,
  },
];

export const GROUP_BY_OPTIONS = [
  { value: 'exposures', label: 'Exposures' },
  { value: 'rights_holders', label: 'Rights Holders' },
  { value: 'assets', label: 'Assets' },
  { value: 'brands', label: 'Brands' },
];

export const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
