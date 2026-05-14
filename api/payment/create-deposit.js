export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { amount, currency } = req.body; // e.g., amount: 100, currency: "USD", "INR", etc.
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    const baseUrl = process.env.BASE_URL || 'https://cryptomines.vercel.app';

    try {
        const response = await fetch('https://api.nowpayments.io/v1/invoice', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                price_amount: amount,
                price_currency: currency.toLowerCase(),
                pay_currency: currency.toLowerCase(),   // user same currency se pay karega (ya tu crypto ke liye alag kar sakta hai)
                ipn_callback_url: `${baseUrl}/api/payment/ipn`, // optional
                order_id: 'ORDER-' + Date.now(),
                order_description: 'Cash Mines Deposit'
            })
        });

        const data = await response.json();
        if (data.invoice_url) {
            res.status(200).json({ checkout_url: data.invoice_url, invoice_id: data.id });
        } else {
            res.status(400).json({ error: data.message || 'Failed to create invoice' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}
