# Mainetti Signal Radar

AI-powered market intelligence dashboard for Mainetti's EU marketing function. Monitors regulatory changes, competitor moves, pricing signals, and strategic opportunities across all three product suites.

**Stack:** React + Vite frontend, Vercel serverless API, Groq (free) running Llama 3.3 70B.  
**Cost:** $0/month — Groq free tier + Vercel free tier.

---

## How it works

1. **Frontend** (React/Vite) renders the dashboard with 6 pages: Overview, Signals Feed, Policy Tracker, Stakeholder Map, Competitor Watch, Opportunities & Risks
2. **API layer** (Vercel serverless functions in `/api`) handles data generation and caching
3. **AI engine** (Groq free API → Llama 3.3 70B) generates market intelligence signals, competitor profiles, regulatory tracking, stakeholder mapping, and opportunity/risk assessments
4. **Cache** (Vercel KV free tier, or in-memory fallback) stores generated data so you don't burn API calls on every page load

When you click "Update Now", the app calls Groq in parallel to regenerate all intelligence data. Results are cached for 1-2 hours.

---

## Deploy in 5 minutes

### Step 1: Get a free Groq API key

1. Go to [console.groq.com](https://console.groq.com/keys)
2. Sign up (no credit card needed)
3. Create an API key — copy it

### Step 2: Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add environment variable: `GROQ_API_KEY` = your key from Step 1
4. Click Deploy

That's it. Your dashboard will be live at `your-project.vercel.app`.

### Step 3 (optional): Add persistent cache

Without Vercel KV, the cache lives in memory and resets on cold starts (~15 min idle). To add persistent caching:

1. In your Vercel dashboard → Storage → Create KV Store (free tier: 30k requests/month)
2. Link it to your project — this auto-adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` env vars
3. Redeploy

---

## Local development

```bash
# Install dependencies
npm install

# Copy env template and add your Groq key
cp .env.example .env.local

# Start frontend dev server
npm run dev

# In another terminal, test API routes with Vercel CLI
npx vercel dev
```

The frontend runs on `localhost:5173` and proxies `/api/*` to the Vercel dev server.

---

## Project structure

```
├── api/                    # Vercel serverless functions
│   ├── _shared.js          # Groq client, KV cache, system prompts
│   ├── signals.js          # GET /api/signals
│   ├── kpis.js             # GET /api/kpis
│   ├── competitors.js      # GET /api/competitors
│   ├── regulations.js      # GET /api/regulations
│   ├── stakeholders.js     # GET /api/stakeholders
│   ├── opportunities-risks.js
│   └── scan/
│       ├── trigger.js      # POST /api/scan/trigger
│       └── status.js       # GET /api/scan/status
├── src/
│   ├── App.jsx             # Layout, routing, data context
│   ├── lib/utils.js        # Helpers, constants
│   ├── components/ui.jsx   # Shared UI components
│   └── pages/
│       ├── Overview.jsx
│       ├── Signals.jsx
│       ├── Policy.jsx
│       ├── Stakeholders.jsx
│       ├── Competitors.jsx
│       └── Opportunities.jsx
├── vercel.json             # Vercel deployment config
├── tailwind.config.js      # Mainetti brand colors
└── .env.example
```

---

## Customisation

### Changing the AI model

Edit `api/_shared.js` line 5:
```js
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // or 'llama-4-scout-17b-16e-instruct', 'qwen-qwq-32b', etc.
```

See [Groq supported models](https://console.groq.com/docs/models) for the full free list.

### Switching to a different AI provider

Replace the `callGroq` function in `api/_shared.js`. The prompts and caching layer stay the same — you just need to change the HTTP call and model name.

### Adding real data sources

The current version generates intelligence from the AI model's training data. To add live data:
1. Add web scraping (e.g. Cheerio) or RSS feeds to the scan trigger
2. Pass the scraped content into the Groq prompts as context
3. The AI will then analyse real-time data instead of generating from memory

---

## Groq free tier limits

- 30 requests/minute on Llama 3.3 70B
- 1,000 requests/day on 70B models
- A full scan uses 5 parallel requests (one per data type)
- With caching, a typical day uses ~10-20 requests total

This is well within free limits even with multiple daily refreshes.
