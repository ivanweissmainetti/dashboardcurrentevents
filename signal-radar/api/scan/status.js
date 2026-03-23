const { kvGet } = require('./_shared');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    const status = await kvGet('scan_status');
    res.status(200).json(status || { status: 'idle' });
  } catch (err) {
    res.status(200).json({ status: 'idle' });
  }
};
