const { kvGet, kvSet, callGroq, headers, SIGNALS_PROMPT } = require('./_shared');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    let data = await kvGet('signals');
    
    if (!data || !data.signals) {
      // Generate fresh signals
      data = await callGroq(
        'You are a market intelligence AI. Return ONLY valid JSON, no markdown.',
        SIGNALS_PROMPT
      );
      await kvSet('signals', data, 3600); // cache 1 hour
      
      // Update scan metadata
      const meta = (await kvGet('scan_meta')) || {};
      meta.lastScanAt = new Date().toISOString();
      meta.totalSignals = data.signals?.length || 0;
      await kvSet('scan_meta', meta);
    }
    
    res.status(200).json(data.signals || []);
  } catch (err) {
    console.error('signals error:', err);
    res.status(500).json({ error: err.message });
  }
};
