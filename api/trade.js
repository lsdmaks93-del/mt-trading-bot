export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { api_key, account_uuid, symbol, action, volume, stopLoss, takeProfit } = req.body;

  if (!api_key || !account_uuid || !symbol || !action || !volume) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const payload = {
    api_key: api_key,
    account_uuid: account_uuid,
    symbol: symbol.toUpperCase(),
    type: action === 'buy' ? 0 : 1,
    volume: Number(volume),
  };

  if (stopLoss) payload.stop_loss = Number(stopLoss);
  if (takeProfit) payload.take_profit = Number(takeProfit);

  try {
    const response = await fetch('https://metatraderapi.dev/v1/trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Trade failed');

    res.status(200).json({ success: true, tradeId: data.tradeId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
