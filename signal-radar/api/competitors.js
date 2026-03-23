const { kvGet, kvSet, callGroq, headers, COMPETITORS_PROMPT } = require('./_shared');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    let data = await kvGet('competitors');
    
    if (!data || !data.competitors) {
      data = await callGroq(
        'You are a competitive intelligence AI. Return ONLY valid JSON, no markdown.',
        COMPETITORS_PROMPT
      );
      await kvSet('competitors', data, 7200);
    }
    
    res.status(200).json(data.competitors || []);
  } catch (err) {
    console.error('competitors error:', err);
    res.status(500).json({ error: err.message });
  }
};
