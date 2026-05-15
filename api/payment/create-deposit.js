export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { amount, currency, is_fiat } = req.body;
    const baseUrl = process.env.BASE_URL || 'https://cryptomines.vercel.app';
    const recipientAddress = '0x8A1018cc24824300CeB8c9D2A284DaC7D118aec4';
    const chain = 'bsc';
    const settleCurrency = 'usdt';

    try {
        if (is_fiat) {
            // ---- Crossmint (Google Pay, Cards, etc.) ----
            const crossmintApiKey = process.env.CROSSMINT_API_KEY;
            if (!crossmintApiKey) throw new Error('CROSSMINT_API_KEY not set');

            const crossmintBase = crossmintApiKey.startsWith('sk_staging')
                ? 'https://staging.crossmint.com'
                : 'https://www.crossmint.com';

            const response = await fetch(`${crossmintBase}/api/2022-06-09/checkout/sessions`, {
                method: 'POST',
                headers: { 'x-api-key': crossmintApiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient: {
                        walletAddress: recipientAddress,
                        chain: chain,
                        currency: settleCurrency
                    },
                    paymentMethods: ['card', 'googlePay'],
                    lineItems: [{
                        title: 'Cash Mines Deposit',
                        description: `Deposit ${amount} ${currency}`,
                        price: {
                            amount: amount.toString(),
                            currency: currency.toLowerCase()
                        },
                        quantity: 1
                    }],
                    successUrl: `${baseUrl}/?payment=success`,
                    cancelUrl: `${baseUrl}/?payment=cancel`
                })
            });

            const data = await response.json();
            if (data.checkoutUrl) {
                res.status(200).json({
                    checkout_url: data.checkoutUrl,
                    session_id: data.id,
                    gateway: 'crossmint'
                });
            } else {
                res.status(400).json({ error: data.message || 'Failed to create session' });
            }

        } else {
            // ---- NOWPayments (USDT/Crypto) ----
            const nowApiKey = process.env.NOWPAYMENTS_API_KEY;
            if (!nowApiKey) throw new Error('NOWPAYMENTS_API_KEY not set');

            const response = await fetch('https://api.nowpayments.io/v1/invoice', {
                method: 'POST',
                headers: { 'x-api-key': nowApiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    price_amount: amount,
                    price_currency: 'USD',
                    pay_currency: 'usdtbsc',
                    ipn_callback_url: `${baseUrl}/api/payment/ipn`,
                    order_id: 'ORDER-' + Date.now(),
                    order_description: 'Cash Mines Deposit'
                })
            });

            const data = await response.json();
            if (data.invoice_url) {
                res.status(200).json({
                    checkout_url: data.invoice_url,
                    invoice_id: data.id,
                    gateway: 'nowpayments'
                });
            } else {
                res.status(400).json({ error: data.message || 'Failed to create invoice' });
            }
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
}
