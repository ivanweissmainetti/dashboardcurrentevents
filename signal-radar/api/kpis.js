const { kvGet, headers } = require('./_shared');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    const signals = await kvGet('signals');
    const meta = (await kvGet('scan_meta')) || {};
    const regs = await kvGet('regulations');
    const comps = await kvGet('competitors');
    
    const signalList = signals?.signals || [];
    const regList = regs?.regulations || [];
    const compList = comps?.competitors || [];
    
    const critical = signalList.filter(s => s.urgency === 'critical' || s.urgency === 'high').length;
    const pending = regList.filter(r => r.status === 'proposed' || r.status === 'consultation' || r.status === 'pending').length;
    const highThreat = compList.filter(c => c.threat === 'high').length;
    
    res.status(200).json({
      totalSignals: signalList.length,
      highPriorityAlerts: critical,
      pendingPolicies: pending || regList.length,
      competitorMoves: highThreat || compList.length,
      lastScanAt: meta.lastScanAt || null,
      scanCount: meta.scanCount || 0,
    });
  } catch (err) {
    console.error('kpis error:', err);
    res.status(500).json({ error: err.message });
  }
};
