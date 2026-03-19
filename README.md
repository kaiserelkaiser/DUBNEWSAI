# DUBNEWSAI

Production-oriented full-stack DUBNEWSAI platform for Dubai real-estate intelligence. The repository now includes a FastAPI backend, Celery workers, PostgreSQL, Redis, and a Next.js frontend prepared for containerized deployment.

## Stack

- FastAPI with async SQLAlchemy 2.0
- PostgreSQL 15 and Redis 7
- Celery with Redis broker/result backend
- Loguru logging, SlowAPI rate limiting, Prometheus instrumentation
- Pydantic v2 schemas and JWT authentication
- Next.js 14 frontend with TypeScript, Tailwind CSS, Zustand, TanStack Query, and native WebSocket realtime updates

## Project Layout

The repository follows the Phase 1 layout under `app/`, `tests/`, `alembic/`, `docker/`, and `scripts/`.

## Production Setup

1. Open [`.env`](C:\Users\KIASER\Documents\Back Up\Back Up\KAISER\WORK\PROJECTS\DUBNEWSAI\.env) and fill in every secret and provider key.
2. Adjust [`.env.local`](C:\Users\KIASER\Documents\Back Up\Back Up\KAISER\WORK\PROJECTS\DUBNEWSAI\dubnewsai-frontend\.env.local) only if you want to run the frontend outside Docker.
3. Build and start the full stack:

```bash
docker compose up --build -d
```

4. Verify the backend health endpoint:

```bash
curl http://localhost:8000/health
```

5. Open the frontend:

```bash
http://localhost:3000
```

6. Optional: seed a local admin and sample article.
   Set `SEED_ADMIN_PASSWORD` in `.env` first, then run:

```bash
docker compose exec backend python scripts/seed_data.py
docker compose exec backend python scripts/seed_watchlist.py
```

## Free Hosting Deployment

### Backend on Railway

- Railway uses the root [Dockerfile](C:\Users\KIASER\Documents\Back Up\Back Up\KAISER\WORK\PROJECTS\DUBNEWSAI\Dockerfile) and [railway.toml](C:\Users\KIASER\Documents\Back Up\Back Up\KAISER\WORK\PROJECTS\DUBNEWSAI\railway.toml).
- `railway.toml` runs `alembic upgrade head` as the pre-deploy step and uses `/health` for health checks.
- Copy values from [`.env.production.example`](C:\Users\KIASER\Documents\Back Up\Back Up\KAISER\WORK\PROJECTS\DUBNEWSAI\.env.production.example) into Railway service variables.

### Database on Supabase

- Put your main persistent Supabase Postgres connection into `DATABASE_URL`.
- Keep `DATABASE_URL_POOLER` as an optional pooler string for tooling or special cases.
- For a long-running backend like Railway, prefer the persistent/direct connection Supabase shows in the dashboard when available.

### Redis on Upstash

- Use TLS-enabled `rediss://` URLs for `REDIS_URL`, `CELERY_BROKER_URL`, and `CELERY_RESULT_BACKEND`.
- The template in [`.env.production.example`](C:\Users\KIASER\Documents\Back Up\Back Up\KAISER\WORK\PROJECTS\DUBNEWSAI\.env.production.example) already matches Upstash's hosted format.

### Frontend on Vercel

- Import the frontend from [dubnewsai-frontend](C:\Users\KIASER\Documents\Back Up\Back Up\KAISER\WORK\PROJECTS\DUBNEWSAI\dubnewsai-frontend) as the Vercel project root.
- Vercel config lives in [vercel.json](C:\Users\KIASER\Documents\Back Up\Back Up\KAISER\WORK\PROJECTS\DUBNEWSAI\dubnewsai-frontend\vercel.json).
- Fill the frontend variables from [dubnewsai-frontend/.env.production.example](C:\Users\KIASER\Documents\Back Up\Back Up\KAISER\WORK\PROJECTS\DUBNEWSAI\dubnewsai-frontend\.env.production.example) in the Vercel project settings.

## API Surface

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/news/`
- `POST /api/v1/news/`
- `GET /api/v1/news/{news_id}`
- `GET /api/v1/news/featured/top`
- `GET /api/v1/news/trending/today`
- `GET /api/v1/market/overview`
- `GET /api/v1/market/stocks`
- `GET /api/v1/market/real-estate-companies`
- `GET /api/v1/market/symbol/{symbol}`
- `GET /api/v1/admin/stats`
- `POST /api/v1/admin/trigger-news-fetch`
- `GET /health`
- `GET /docs`
- `GET /metrics`

## Testing

Run tests locally with:

```bash
pytest
```

The test suite uses SQLite with `aiosqlite` so it can run without PostgreSQL.

## Authentication Notes

- `POST /api/v1/auth/register` accepts JSON with `email`, `password`, and optional `full_name`.
- `POST /api/v1/auth/login` accepts JSON credentials and returns `access_token` plus `refresh_token`.
- Protected endpoints expect `Authorization: Bearer <access_token>`.
- `POST /api/v1/auth/refresh` expects a bearer refresh token and returns a new token pair.
- The frontend uses the backend JWT flow directly and refreshes access tokens automatically.

## News Aggregation Notes

- News articles are deduplicated by SHA-256 URL hash before insert.
- The backend includes a retrying NewsAPI client plus RSS parsing for multiple regional feeds.
- Celery beat schedules NewsAPI fetches every 15 minutes, RSS fetches every 30 minutes, and article cleanup daily.
- News listing supports pagination plus category, source, sentiment, date-range, and search filters.

## Market Data Notes

- Market data now tracks watchlist-based stock and index snapshots, currency rates, and economic indicators.
- Use `python scripts/seed_watchlist.py` to seed the initial set of Dubai and real-estate-relevant symbols.
- Celery beat schedules stock updates every 5 minutes and currency rate refreshes hourly.
- `/api/v1/market/overview` returns stocks, indices, latest currencies, and real-estate company snapshots in one response.

## Container Services

- `frontend`: Next.js production server on port `3000`
- `backend`: FastAPI API on port `8000`
- `celery_worker`: async jobs for ingestion and AI analysis
- `celery_beat`: scheduled jobs
- `postgres`: primary relational database
- `redis`: cache, websocket pub/sub, rate limiting, and Celery broker/backend
