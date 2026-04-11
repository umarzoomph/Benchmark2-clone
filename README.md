# Benchmark 2.0

A Zoomph-style sponsorship analytics dashboard built with React. Visualizes social media brand exposure data across NFL teams, sponsors, assets, and platforms.

**Live App:** [nickcroninzoomph.github.io/Benchmark2](https://nickcroninzoomph.github.io/Benchmark2)

---

## Features

- **4 Group By modes** — Exposures, Rights Holders (Teams), Assets, Brands
- **Sortable data table** with total row pinned at bottom
- **Scout Insights** — AI-style insight cards with key performance callouts
- **Filter sidebar** — filter by Social Network, Content Type, League, Team, Brand, Asset with AND/OR logic
- **Posts view** — card-based view of individual posts
- **CSV Export** — download filtered data
- **Social + Broadcast** data type toggle
- Dark theme matching Zoomph's Benchmark UI

---

## Data Source

**Source Sheet:** [NFL Team Owned Social Data (Google Sheets)](https://docs.google.com/spreadsheets/d/1skg95Bmr137xbDWTJuhOL7qLMMQXOx3cDWs0s2ceOBw/edit?usp=sharing)

The app loads from a published Google Sheets CSV (`public/data.csv`). To update the data:

1. Export your Zoomph CSV
2. Replace `public/data.csv` with the new file
3. Run `npm run deploy` to redeploy

### Required CSV Columns

| Column | Description |
|---|---|
| `Partner` | Brand / sponsor name |
| `PartnerExposureCreatorName` | Team / rights holder name |
| `PartnerAssetLabel` | Asset type (Jersey, Signage, etc.) |
| `ServiceType` | Platform (Instagram, TikTok, etc.) |
| `ContentType` | Post type (Photo, Video, Carousel) |
| `Impressions` | Post impressions |
| `Engagement` | Total engagements |
| `EngagementRate` | Engagement rate (e.g. `7.54%`) |
| `BrandExposureValue` | Brand / logo detection value |
| `PostValue` | Social / earned media value |
| `ViewCount` | Video views |
| `FollowerCount` | Account follower count |
| `Url` | Post URL |
| `Message` | Post caption |
| `PartnerExposureDate` | Post date |

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

---

## Tech Stack

- React 19 (Create React App)
- PapaParse — CSV parsing
- GitHub Pages — hosting
- Pure CSS dark theme (no UI library)

---

Built by Zoomph · [github.com/NickCroninZoomph/Benchmark2](https://github.com/NickCroninZoomph/Benchmark2)
