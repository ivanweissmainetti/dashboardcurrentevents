// Shared AI + storage layer for all API routes
// Uses Groq free tier (Llama 3.3 70B) for intelligence generation
// Uses Vercel KV (free tier) or in-memory fallback for caching

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// ============================================================
// Storage: Vercel KV if available, else in-memory Map
// ============================================================
let memoryStore = {};

async function kvGet(key) {
  if (process.env.KV_REST_API_URL) {
    try {
      const res = await fetch(`${process.env.KV_REST_API_URL}/get/${key}`, {
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
      });
      const data = await res.json();
      return data.result ? JSON.parse(data.result) : null;
    } catch { return null; }
  }
  return memoryStore[key] ? JSON.parse(memoryStore[key]) : null;
}

async function kvSet(key, value, exSeconds) {
  const json = JSON.stringify(value);
  if (process.env.KV_REST_API_URL) {
    try {
      const url = exSeconds
        ? `${process.env.KV_REST_API_URL}/set/${key}/${encodeURIComponent(json)}/ex/${exSeconds}`
        : `${process.env.KV_REST_API_URL}/set/${key}/${encodeURIComponent(json)}`;
      await fetch(url, {
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
      });
    } catch {}
  } else {
    memoryStore[key] = json;
  }
}

// ============================================================
// Groq AI call
// ============================================================
async function callGroq(systemPrompt, userPrompt, temperature = 0.4) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '{}';
  return JSON.parse(text);
}

// ============================================================
// CORS helper
// ============================================================
function headers() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
  };
}

// ============================================================
// System prompts
// ============================================================
const MAINETTI_CONTEXT = `You are an AI market intelligence analyst for Mainetti, a global retail packaging and garment hanger company.

Mainetti is transforming from a hanger manufacturer into an integrated retail solutions partner, organised into three suites:
1. "Product Branding" — labels, tags, trims, creative packaging (led by Philip Eckhardt)
2. "Retail Experience" — in-store products: hangers, bags, gift packaging (led by Gemma Ward)
3. "Supply Chain" — flexible packaging, polybags, LDPE film, Polyloop circular system (led by Michelle Boon)

Key markets: UK, EU (esp. France, Italy, Spain, Benelux), US. Key customers: H&M, Primark, Nordstrom, PVH, River Island, Next, M&S, luxury brands.

Key competitors:
- Product Branding: Avery Dennison RBIS, SML Group, Trimco, CCL Industries
- Retail Experience: Tam/Braiform, mainetti direct competitors in hangers
- Supply Chain: Berry Global, Novamont, Sealed Air, film converters

Key regulatory issues: PPWR (EU Packaging and Packaging Waste Regulation), EPR schemes, Spanish recycled content tax, EN 15343, GRS/RCS certifications.

Sustainability is central: Polyloop (closed-loop polybag recycling), Hangerloop (hanger reuse/recycling), post-consumer recycled content (PCR), LDPE recyclability vs. corrugated perception gap.`;

const SIGNALS_PROMPT = `${MAINETTI_CONTEXT}

Generate a JSON array of 12-15 market intelligence signals that would be relevant to Mainetti RIGHT NOW (March 2026). Each signal should be realistic and based on real industry trends.

Return JSON: { "signals": [ { "id": "SIG-001", "title": "...", "summary": "2-3 sentence summary", "body": "Detailed 3-4 sentence analysis with implications for Mainetti", "category": "regulatory|competitor|market|customer|sustainability|pricing|innovation|supply", "suite": "Product Branding|Retail Experience|Supply Chain", "urgency": "critical|high|medium|low", "impact": "high|medium-high|medium|low-medium|low", "source": "Source name (e.g. Reuters, PackagingEurope, company press release)", "date": "2026-03-XX", "tags": ["tag1", "tag2"] } ] }

Mix categories and suites. Include 2-3 critical/high urgency items. Make signals specific and actionable, not generic.`;

const COMPETITORS_PROMPT = `${MAINETTI_CONTEXT}

Generate a competitive intelligence report as JSON. Cover the main competitors across all three suites.

Return JSON: { "competitors": [ { "id": "COMP-001", "name": "Company name", "suite": "Product Branding|Retail Experience|Supply Chain", "threat": "high|medium|low", "recentMoves": "What they've done recently (2-3 sentences)", "strengths": ["str1", "str2", "str3"], "weaknesses": ["w1", "w2"], "marketShare": "estimated % or qualitative", "watchItems": ["specific thing to monitor"] } ] }

Include 8-10 competitors total.`;

const REGULATIONS_PROMPT = `${MAINETTI_CONTEXT}

Generate a regulatory/policy tracker for packaging regulations affecting Mainetti in EU, UK, and key markets.

Return JSON: { "regulations": [ { "id": "REG-001", "name": "Regulation name", "jurisdiction": "EU|UK|Spain|France|Italy|Germany|Global", "status": "enacted|proposed|consultation|pending", "deadline": "2026-XX-XX or null", "impact": "high|medium|low", "suite": "Product Branding|Retail Experience|Supply Chain", "summary": "2-3 sentence summary of what it requires and how it affects Mainetti", "action": "What Mainetti should do", "source": "Source" } ] }

Include 8-10 regulations. Focus on PPWR, EPR, recycled content mandates, plastic taxes.`;

const STAKEHOLDERS_PROMPT = `${MAINETTI_CONTEXT}

Generate a stakeholder map showing key internal and external stakeholders relevant to Mainetti's EU marketing and commercial strategy.

Return JSON: { "stakeholders": [ { "id": "STK-001", "name": "Person or role name", "organization": "Mainetti|Customer|Competitor|Industry body|Government", "role": "Their title or function", "influence": "high|medium|low", "alignment": "champion|supporter|neutral|skeptic|blocker", "suite": "Product Branding|Retail Experience|Supply Chain|All", "notes": "Key context about this stakeholder" } ] }

Include 12-15 stakeholders mixing internal Mainetti people, key customer contacts, industry bodies, and regulatory actors.`;

const OPPORTUNITIES_PROMPT = `${MAINETTI_CONTEXT}

Generate an opportunities and risks assessment for Mainetti's three suites.

Return JSON: { "items": [ { "id": "OPP-001", "type": "opportunity|risk", "title": "Short title", "description": "2-3 sentence description", "suite": "Product Branding|Retail Experience|Supply Chain", "probability": "high|medium|low", "impact": "high|medium|low", "timeframe": "immediate|short-term|medium-term|long-term", "action": "Recommended action for Mainetti" } ] }

Include 10-12 items, mix of opportunities and risks across all suites.`;

module.exports = {
  callGroq, kvGet, kvSet, headers,
  SIGNALS_PROMPT, COMPETITORS_PROMPT, REGULATIONS_PROMPT,
  STAKEHOLDERS_PROMPT, OPPORTUNITIES_PROMPT, MAINETTI_CONTEXT,
};
