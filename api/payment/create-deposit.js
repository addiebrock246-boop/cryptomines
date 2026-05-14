export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { amount, currency } = req.body;
    const crossmintApiKey = process.env.CROSSMINT_API_KEY;
    const baseUrl = process.env.BASE_URL || 'https://cryptomines.vercel.app';

    const crossmintBase = crossmintApiKey.startsWith('sk_staging')
        ? 'https://staging.crossmint.com'
        : 'https://www.crossmint.com';

    const recipientAddress = '0x8A1018cc24824300CeB8c9D2A284DaC7D118aec4';
    const chain = 'bsc';
    const settleCurrency = 'usdt';

    try {
        const response = await fetch(`${crossmintBase}/api/2022-06-09/checkout/sessions`, {
            method: 'POST',
            headers: {
                'x-api-key': crossmintApiKey,
                'Content-Type': 'application/json'
            },
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

        // ⚠️ Temporary logging – Vercel logs mein Crossmint ka response dikhega
        console.log('Crossmint response:', JSON.stringify(data));

        if (data.checkoutUrl) {
            res.status(200).json({
                checkout_url: data.checkoutUrl,
                session_id: data.id
            });
        } else {
            // Log the error details as well
            console.error('Crossmint error:', data);
            res.status(400).json({ error: data.message || 'Failed to create session' });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}
