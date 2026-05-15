export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { api_key, account_uuid, symbol, action, volume, stopLoss, takeProfit } = req.body;
    
    // Validate required fields
    if (!api_key || !account_uuid || !symbol || !action || !volume) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Prepare payload for metatraderapi.dev
    const payload = {
      api_key: api_key,
      account_uuid: account_uuid,
      symbol: symbol.toUpperCase(),
      type: action === 'buy' ? 0 : 1,
      volume: Number(volume),
    };
    
    if (stopLoss) payload.stop_loss = Number(stopLoss);
    if (takeProfit) payload.take_profit = Number(takeProfit);
    
    // Send to metatraderapi.dev
    const response = await fetch('https://metatraderapi.dev/v1/trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Trade execution failed');
    }
    
    return res.status(200).json({ 
      success: true, 
      tradeId: data.tradeId,
      message: 'Trade executed successfully' 
    });
    
  } catch (error) {
    console.error('Trade error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
