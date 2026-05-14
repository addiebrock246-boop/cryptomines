export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { amount, currency } = req.body; // amount: user ka entered USDT amount, currency: "USD"
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    const baseUrl = process.env.BASE_URL || 'https://cryptomines.vercel.app';

    if (!apiKey) {
        return res.status(500).json({ error: 'Server misconfiguration: API key missing' });
    }

    try {
        const response = await fetch('https://api.nowpayments.io/v1/invoice', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                price_amount: amount,
                price_currency: 'USD',
                pay_currency: 'usdtbsc',          // आपके USDT (BSC) वॉलेट में सेटल होगा
                ipn_callback_url: `${baseUrl}/api/payment/ipn`,
                order_id: 'ORDER-' + Date.now(),
                order_description: 'Cash Mines Deposit'
            })
        });

        const data = await response.json();

        if (data.invoice_url) {
            res.status(200).json({
                checkout_url: data.invoice_url,
                invoice_id: data.id
            });
        } else {
            console.error('NOWPayments error:', data);
            res.status(400).json({ error: data.message || 'Failed to create invoice' });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}
