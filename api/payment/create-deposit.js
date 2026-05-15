export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { amount, currency, is_fiat } = req.body;
    const baseUrl = process.env.BASE_URL || 'https://cryptomines.vercel.app';

    // तेरा वॉलेट (BSC और Polygon दोनों पर एक ही एड्रेस)
    const recipientAddress = '0x8A1018cc24824300CeB8c9D2A284DaC7D118aec4';

    // ✅ Polygon पर USDT का सही कॉन्ट्रैक्ट एड्रेस
    const polygonUsdtContract = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';

    try {
        if (is_fiat) {
            const crossmintApiKey = process.env.CROSSMINT_API_KEY;
            if (!crossmintApiKey) throw new Error('CROSSMINT_API_KEY not set');

            const crossmintBase = crossmintApiKey.startsWith('sk_staging')
                ? 'https://staging.crossmint.com'
                : 'https://www.crossmint.com';

            const response = await fetch(`${crossmintBase}/api/2022-06-09/orders`, {
                method: 'POST',
                headers: {
                    'x-api-key': crossmintApiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    lineItems: [
                        {
                            // ✅ सही tokenLocator: polygon:contract
                            tokenLocator: `polygon:${polygonUsdtContract}`,
                            executionParameters: {
                                mode: "exact-in",
                                amount: amount.toString(),
                            },
                        },
                    ],
                    payment: {
                        method: "card",
                        receiptEmail: "no-reply@example.com",
                    },
                    recipient: {
                        walletAddress: recipientAddress,
                    },
                })
            });

            const data = await response.json();

            if (data.order && data.order.orderId) {
                res.status(200).json({
                    checkout_url: `${crossmintBase}/checkout/${data.order.orderId}`,
                    order_id: data.order.orderId,
                    gateway: 'crossmint'
                });
            } else {
                console.error('Crossmint error:', JSON.stringify(data));
                res.status(400).json({ error: data.message || 'Failed to create order' });
            }

        } else {
            // ---- NOWPayments Crypto Invoice (USDT BSC) ----
            const nowApiKey = process.env.NOWPAYMENTS_API_KEY;
            if (!nowApiKey) throw new Error('NOWPAYMENTS_API_KEY not set');

            const response = await fetch('https://api.nowpayments.io/v1/invoice', {
                method: 'POST',
                headers: {
                    'x-api-key': nowApiKey,
                    'Content-Type': 'application/json'
                },
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
