export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { amount, currency, is_fiat } = req.body;
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    const baseUrl = process.env.BASE_URL || 'https://cryptomines.vercel.app';
    let priceCurrency = currency === "DEFAULT" ? "USD" : currency;

    try {
        if (is_fiat) {
            const response = await fetch('https://api.nowpayments.io/v1/fiat/invoice', {
                method: 'POST',
                headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amount,
                    currency: priceCurrency,
                    pay_currency: "usdtbsc",
                    ipn_callback_url: `${baseUrl}/api/payment/ipn`,
                    order_id: 'ORDER-' + Date.now(),
                    order_description: 'Cash Mines Deposit'
                })
            });
            const data = await response.json();
            if (data.invoice_url) return res.status(200).json({ checkout_url: data.invoice_url, invoice_id: data.id, type: "fiat" });
            else return res.status(400).json({ error: data.message || 'Failed to create fiat invoice' });
        } else {
            const response = await fetch('https://api.nowpayments.io/v1/invoice', {
                method: 'POST',
                headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    price_amount: amount,
                    price_currency: priceCurrency,
                    pay_currency: "usdtbsc",
                    ipn_callback_url: `${baseUrl}/api/payment/ipn`,
                    order_id: 'ORDER-' + Date.now(),
                    order_description: 'Cash Mines Deposit'
                })
            });
            const data = await response.json();
            if (data.invoice_url) return res.status(200).json({ checkout_url: data.invoice_url, invoice_id: data.id, type: "crypto" });
            else return res.status(400).json({ error: data.message || 'Failed to create invoice' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}
