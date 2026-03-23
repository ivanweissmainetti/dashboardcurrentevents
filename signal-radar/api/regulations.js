const { kvGet, kvSet, callGroq, headers, REGULATIONS_PROMPT } = require('./_shared');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    let data = await kvGet('regulations');
    
    if (!data || !data.regulations) {
      data = await callGroq(
        'You are a regulatory affairs analyst. Return ONLY valid JSON, no markdown.',
        REGULATIONS_PROMPT
      );
      await kvSet('regulations', data, 7200);
    }
    
    res.status(200).json(data.regulations || []);
  } catch (err) {
    console.error('regulations error:', err);
    res.status(500).json({ error: err.message });
  }
};
