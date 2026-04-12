# Benchmark 2.0 — Snowflake Data Infrastructure Spec

**Status:** Draft — Awaiting Engineering Review
**Author:** Nick Cronin
**Repo:** [NickCroninZoomph/Benchmark2](https://github.com/NickCroninZoomph/Benchmark2)
**Live App:** [nickcroninzoomph.github.io/Benchmark2](https://nickcroninzoomph.github.io/Benchmark2)

---

## Background

The Benchmark 2.0 dashboard visualizes processed brand exposure data (logo detections, social impressions, engagement, brand value) across NFL teams, sponsors, and assets.

**Current state:** Data is manually exported from Zoomph as a CSV → uploaded to Google Sheets → fetched as a static file by the React app. This works as a prototype but doesn't scale — data goes stale immediately and requires manual refreshes.

**Goal:** Replace the static CSV with a live Snowflake-backed API so the dashboard always reflects the latest processed data automatically.

---

## Existing Data Flow (Do Not Change)

The Zoomph platform already handles all data collection and AI processing. This spec does **not** touch that pipeline.

```
Social Platforms (Instagram, TikTok, YouTube, etc.)
        ↓
  Zoomph App — pulls via social APIs
        ↓
  AI Processing — logo detection, brand exposure scoring, sentiment
        ↓
  Output → Elasticsearch + S3  ← THIS IS WHERE WE PICK UP
```

---

## Proposed Addition

```
[Existing Zoomph Pipeline]
        ↓
  S3 (processed output files)
        ↓  ← Snowpipe watches this bucket (auto-ingest on file drop)
  Snowflake — zoomph_benchmark database
        ↓
  API Endpoint — /api/benchmark (new or added to existing Zoomph API)
        ↓
  Benchmark 2.0 React Dashboard
```

No changes to the existing Zoomph application or AI pipeline. We are only adding a downstream consumer of the already-processed S3 output.

---

## Snowflake Schema

### Database / Schema
```sql
CREATE DATABASE zoomph_benchmark;
CREATE SCHEMA zoomph_benchmark.social;
CREATE SCHEMA zoomph_benchmark.broadcast;
```

### Raw Table — `social.exposures_raw`
Mirrors the existing Zoomph CSV export format exactly so no transformation is needed on ingest.

```sql
CREATE TABLE zoomph_benchmark.social.exposures_raw (
  -- Identity
  Id                        STRING,
  Partner                   STRING,
  PartnerMentionType        STRING,

  -- Creator / Rights Holder
  PartnerExposureCreator    STRING,
  PartnerExposureCreatorName STRING,
  PartnerExposureDate       TIMESTAMP_NTZ,

  -- Platform
  ServiceType               STRING,   -- Instagram, TikTok, YouTube, etc.
  ContentType               STRING,   -- Photo, Video, Carousel

  -- Content
  Message                   STRING,
  Url                       STRING,
  PartnerAssetLabel         STRING,
  Tags                      STRING,

  -- Reach
  Impressions               NUMBER,
  FollowerCount             NUMBER,
  ViewCount                 NUMBER,
  LogoImpressions           NUMBER,

  -- Engagement
  Engagement                NUMBER,
  EngagementRate            STRING,   -- stored as "7.54%" in source
  LikeCount                 NUMBER,
  CommentCount              NUMBER,
  ShareCount                NUMBER,

  -- Value
  BrandExposureValue        FLOAT,
  PostValue                 FLOAT,
  FullMediaValue            FLOAT,
  BrandValueScore           FLOAT,

  -- Metadata (added on ingest)
  _ingested_at              TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
  _source_file              STRING,
  _job_id                   STRING
);
```

### Query View — `social.exposures_v`
Pre-cleans types for dashboard queries.

```sql
CREATE OR REPLACE VIEW zoomph_benchmark.social.exposures_v AS
SELECT
  *,
  TRY_TO_DECIMAL(REPLACE(EngagementRate, '%', ''), 10, 4) / 100 AS EngagementRateDecimal,
  TRY_TO_TIMESTAMP_NTZ(PartnerExposureDate) AS ExposureDate
FROM zoomph_benchmark.social.exposures_raw;
```

---

## Snowpipe Setup

Snowpipe auto-ingests new files the moment they land in S3 — no scheduler needed.

### Step 1 — Create S3 Stage
```sql
CREATE OR REPLACE STAGE zoomph_benchmark.social.s3_stage
  URL = 's3://YOUR-BUCKET/zoomph-processed/'
  CREDENTIALS = (
    AWS_KEY_ID     = '...'
    AWS_SECRET_KEY = '...'
  )
  FILE_FORMAT = (
    TYPE                      = 'CSV'
    FIELD_OPTIONALLY_ENCLOSED_BY = '"'
    SKIP_HEADER               = 1
    NULL_IF                   = ('NULL', 'null', '')
    EMPTY_FIELD_AS_NULL       = TRUE
  );
```

### Step 2 — Create Pipe
```sql
CREATE OR REPLACE PIPE zoomph_benchmark.social.ingest_pipe
  AUTO_INGEST = TRUE
AS
  COPY INTO zoomph_benchmark.social.exposures_raw
  FROM @zoomph_benchmark.social.s3_stage
  PATTERN = '.*\.csv'
  ON_ERROR = 'CONTINUE';
```

### Step 3 — Wire S3 Event Notification
```sql
-- Get the SQS ARN Snowpipe created
SHOW PIPES LIKE 'ingest_pipe';
-- Copy the value from "notification_channel" column
```

Then in AWS Console:
- S3 Bucket → **Properties** → **Event Notifications** → **Create**
- Event type: `s3:ObjectCreated:*`
- Prefix: `zoomph-processed/`
- Destination: **SQS Queue** → paste the Snowpipe SQS ARN

From this point, every file written to `s3://YOUR-BUCKET/zoomph-processed/` auto-loads into Snowflake within ~60 seconds.

---

## API Layer

A lightweight endpoint that queries Snowflake and returns aggregated JSON to the React app. Replaces the static CSV fetch.

### Recommended Approach
Add a new route to the **existing Zoomph API** to keep auth, infrastructure, and deployments unified. If that's not feasible, a standalone AWS Lambda + API Gateway works.

### Endpoint
```
GET /api/benchmark
```

#### Query Parameters
| Param | Type | Example | Description |
|---|---|---|---|
| `dataType` | string | `social` | `social` or `broadcast` |
| `groupBy` | string | `brands` | `exposures`, `rights_holders`, `assets`, `brands` |
| `dateFrom` | string | `2026-01-01` | Filter start date |
| `dateTo` | string | `2026-04-01` | Filter end date |
| `networks` | string | `Instagram,TikTok` | Comma-separated |
| `contentTypes` | string | `Photo,Video` | Comma-separated |
| `teams` | string | `Kansas+City+Chiefs` | Comma-separated |
| `brands` | string | `Nike,Pepsi` | Comma-separated |
| `assets` | string | `Jersey` | Comma-separated |
| `page` | number | `1` | Pagination |
| `perPage` | number | `25` | Page size |

#### Response Shape
```json
{
  "rows": [
    {
      "groupKey": "Nike",
      "partner": "Nike",
      "organicPosts": 3,
      "impressions": 6600000,
      "engagement": 349000,
      "engagementRate": 0.0539,
      "videoViews": 1900000,
      "brandValue": 113200,
      "socialValue": 8200
    }
  ],
  "totalRow": {
    "organicPosts": 20,
    "impressions": 24400000,
    "engagement": 1400000,
    "engagementRate": 0.0513,
    "brandValue": 348020
  },
  "total": 8289,
  "page": 1,
  "perPage": 25
}
```

### Sample Snowflake Query (Brands groupBy)
```sql
SELECT
  Partner                      AS groupKey,
  Partner                      AS partner,
  COUNT(*)                     AS organicPosts,
  SUM(Impressions)             AS impressions,
  SUM(Engagement)              AS engagement,
  AVG(EngagementRateDecimal)   AS engagementRate,
  SUM(ViewCount)               AS videoViews,
  SUM(BrandExposureValue)      AS brandValue,
  SUM(PostValue)               AS socialValue
FROM zoomph_benchmark.social.exposures_v
WHERE ExposureDate BETWEEN :dateFrom AND :dateTo
  AND (:networks IS NULL OR ServiceType IN (:networks))
  AND (:brands   IS NULL OR Partner    IN (:brands))
GROUP BY Partner
ORDER BY brandValue DESC
LIMIT :perPage OFFSET :offset;
```

---

## React App Changes

In `src/hooks/useGoogleSheets.js` — swap CSV fetch for API call:

```js
// Before
const res = await fetch('/data.csv');
const text = await res.text();
const rows = Papa.parse(text, { header: true }).data;

// After
const params = new URLSearchParams({ groupBy, dateFrom, dateTo, ...filters });
const res = await fetch(`${API_BASE}/benchmark?${params}`);
const { rows, totalRow, total } = await res.json();
```

Aggregation (`aggregator.js`) moves from client-side JS to Snowflake SQL — significantly faster for large datasets.

---

## Open Questions for Engineering

These need answers before work begins:

| # | Question | Why It Matters |
|---|---|---|
| 1 | When Zoomph finishes processing a job, does it write a file to S3? What is the S3 path / file naming convention? | Required to configure the Snowpipe stage and event trigger |
| 2 | Does Zoomph already have a Snowflake account? If so, which cloud provider and region? | Must co-locate with S3 (same region) to avoid data transfer costs |
| 3 | Is Elasticsearch the source of truth for processed data, or does S3 hold the canonical output? | Determines whether we ingest from S3 (ideal) or need an ES → S3 export step |
| 4 | What is the typical data refresh cadence? (Real-time, hourly, nightly batch?) | Affects Snowpipe vs Snowflake Tasks decision and warehouse sizing |
| 5 | Should the `/api/benchmark` endpoint live inside the existing Zoomph API or as a standalone service? | Affects auth strategy, deployment, and how the React app authenticates |
| 6 | Should the dashboard remain public or require authentication? | Determines whether we need JWT/OAuth in front of the API |
| 7 | How many rows are ingested per day on average? | Required for Snowflake credit/warehouse sizing |
| 8 | How far back should historical data be loaded on day one? | Affects initial backfill strategy from S3 |

---

## Effort Estimate

| Phase | Task | Estimate |
|---|---|---|
| 1 | Snowflake DB + schema + views | 1 day |
| 2 | Snowpipe + S3 event notification | 1 day |
| 3 | API endpoint (new route or Lambda) | 2–3 days |
| 4 | React app — swap CSV for API | 1 day |
| 5 | Backfill historical data from S3 | 1 day |
| 6 | Testing + data validation | 1–2 days |
| | **Total** | **~1.5 weeks** |

---

## Decisions Needed Before Starting

- [ ] Confirm S3 bucket name + file path structure
- [ ] Confirm Snowflake account exists (or provision new one)
- [ ] Choose API hosting: existing Zoomph API vs standalone Lambda
- [ ] Agree on auth strategy for the dashboard API
- [ ] Agree on historical data backfill window

---

*Draft created April 2026. Please comment with answers to the Open Questions above.*
