const { kvGet, kvSet, callGroq, headers, OPPORTUNITIES_PROMPT } = require('./_shared');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    let data = await kvGet('opportunities');
    
    if (!data || !data.items) {
      data = await callGroq(
        'You are a strategic risk and opportunity analyst. Return ONLY valid JSON, no markdown.',
        OPPORTUNITIES_PROMPT
      );
      await kvSet('opportunities', data, 7200);
    }
    
    res.status(200).json(data.items || []);
  } catch (err) {
    console.error('opportunities error:', err);
    res.status(500).json({ error: err.message });
  }
};
