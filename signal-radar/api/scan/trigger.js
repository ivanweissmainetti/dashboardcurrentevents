const { kvGet, kvSet, callGroq, SIGNALS_PROMPT, COMPETITORS_PROMPT, REGULATIONS_PROMPT, STAKEHOLDERS_PROMPT, OPPORTUNITIES_PROMPT } = require('./_shared');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    // Mark scan as running
    await kvSet('scan_status', { status: 'running', startedAt: new Date().toISOString() });
    
    // Run all generation in parallel
    const [signals, competitors, regulations, stakeholders, opportunities] = await Promise.all([
      callGroq('You are a market intelligence AI. Return ONLY valid JSON.', SIGNALS_PROMPT).catch(e => ({ signals: [] })),
      callGroq('You are a competitive intelligence AI. Return ONLY valid JSON.', COMPETITORS_PROMPT).catch(e => ({ competitors: [] })),
      callGroq('You are a regulatory affairs analyst. Return ONLY valid JSON.', REGULATIONS_PROMPT).catch(e => ({ regulations: [] })),
      callGroq('You are a stakeholder mapping analyst. Return ONLY valid JSON.', STAKEHOLDERS_PROMPT).catch(e => ({ stakeholders: [] })),
      callGroq('You are a strategic analyst. Return ONLY valid JSON.', OPPORTUNITIES_PROMPT).catch(e => ({ items: [] })),
    ]);
    
    // Cache all results
    await Promise.all([
      kvSet('signals', signals, 3600),
      kvSet('competitors', competitors, 7200),
      kvSet('regulations', regulations, 7200),
      kvSet('stakeholders', stakeholders, 7200),
      kvSet('opportunities', opportunities, 7200),
    ]);
    
    // Update metadata
    const meta = (await kvGet('scan_meta')) || { scanCount: 0 };
    meta.lastScanAt = new Date().toISOString();
    meta.scanCount = (meta.scanCount || 0) + 1;
    meta.totalSignals = signals.signals?.length || 0;
    meta.newSignals = signals.signals?.length || 0;
    await kvSet('scan_meta', meta);
    
    // Mark complete
    await kvSet('scan_status', {
      status: 'completed',
      completedAt: new Date().toISOString(),
      newSignals: signals.signals?.length || 0,
      summary: `Generated ${signals.signals?.length || 0} signals, ${competitors.competitors?.length || 0} competitor profiles, ${regulations.regulations?.length || 0} regulations.`,
    });
    
    res.status(200).json({
      status: 'completed',
      newSignals: signals.signals?.length || 0,
    });
  } catch (err) {
    console.error('scan error:', err);
    await kvSet('scan_status', { status: 'error', error: err.message });
    res.status(500).json({ error: err.message });
  }
};
