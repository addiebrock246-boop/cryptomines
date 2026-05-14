export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { amount, currency, is_fiat } = req.body; // frontend se is_fiat aayega
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    const baseUrl = process.env.BASE_URL || 'https://cryptomines.vercel.app';

    let priceCurrency = currency === "DEFAULT" ? "USD" : currency;
    let invoiceUrl, invoiceId, invoiceType;

    try {
        if (is_fiat) {
            // ===== Fiat On-Ramp Invoice =====
            const response = await fetch('https://api.nowpayments.io/v1/fiat/invoice', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: amount,
                    currency: priceCurrency,       // e.g. "INR"
                    pay_currency: "usdtbsc",       // tumhe USDT (BSC) milega
                    ipn_callback_url: `${baseUrl}/api/payment/ipn`,
                    order_id: 'ORDER-' + Date.now(),
                    order_description: 'Cash Mines Deposit'
                })
            });
            const data = await response.json();
            if (data.invoice_url) {
                invoiceUrl = data.invoice_url;
                invoiceId = data.id;
                invoiceType = "fiat";
            } else {
                return res.status(400).json({ error: data.message || 'Failed to create fiat invoice' });
            }
        } else {
            // ===== Regular Crypto Invoice =====
            const response = await fetch('https://api.nowpayments.io/v1/invoice', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json'
                },
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
            if (data.invoice_url) {
                invoiceUrl = data.invoice_url;
                invoiceId = data.id;
                invoiceType = "crypto";
            } else {
                return res.status(400).json({ error: data.message || 'Failed to create invoice' });
            }
        }

        res.status(200).json({
            checkout_url: invoiceUrl,
            invoice_id: invoiceId,
            type: invoiceType
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}
