export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { amount, currency, is_fiat } = req.body; // is_fiat ab frontend se aayega
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    const baseUrl = process.env.BASE_URL || 'https://cryptomines.vercel.app';

    // currency: "USD" (DEFAULT mode) ya "INR", "EUR", etc.
    let priceCurrency = currency === "DEFAULT" ? "USD" : currency;

    try {
        const payload = {
            price_amount: amount,
            price_currency: priceCurrency,
            pay_currency: "usdtbsc",        // hamesha USDT (BSC) mein settlement
            ipn_callback_url: `${baseUrl}/api/payment/ipn`,
            order_id: 'ORDER-' + Date.now(),
            order_description: 'Cash Mines Deposit'
        };

        // Agar fiat currency hai to is_fiat true karo, nahi to crypto invoice
        if (is_fiat) {
            payload.is_fiat = true;
        }

        const response = await fetch('https://api.nowpayments.io/v1/invoice', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
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
