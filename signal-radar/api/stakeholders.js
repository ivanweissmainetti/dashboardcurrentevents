const { kvGet, kvSet, callGroq, headers, STAKEHOLDERS_PROMPT } = require('./_shared');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    let data = await kvGet('stakeholders');
    
    if (!data || !data.stakeholders) {
      data = await callGroq(
        'You are a stakeholder mapping analyst. Return ONLY valid JSON, no markdown.',
        STAKEHOLDERS_PROMPT
      );
      await kvSet('stakeholders', data, 7200);
    }
    
    res.status(200).json(data.stakeholders || []);
  } catch (err) {
    console.error('stakeholders error:', err);
    res.status(500).json({ error: err.message });
  }
};
