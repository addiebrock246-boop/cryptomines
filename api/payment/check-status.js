export default async function handler(req, res) {
    const { gateway, id } = req.query;

    try {
        if (gateway === 'crossmint') {
            const apiKey = process.env.CROSSMINT_API_KEY;
            const crossmintBase = apiKey.startsWith('sk_staging')
                ? 'https://staging.crossmint.com'
                : 'https://www.crossmint.com';

            const resp = await fetch(`${crossmintBase}/api/2022-06-09/orders/${id}`, {
                headers: { 'x-api-key': apiKey }
            });
            const data = await resp.json();

            // Crossmint में 'phase' या 'status' के 'completed' का मतलब पेमेंट हो गई
            const isCompleted = (data.order && data.order.phase === 'completed');
            res.json({
                status: isCompleted ? 'finished' : (data.order ? data.order.phase : 'pending'),
                paid: isCompleted
            });
        } else {
            // NOWPayments
            const apiKey = process.env.NOWPAYMENTS_API_KEY;
            const resp = await fetch(`https://api.nowpayments.io/v1/invoice/${id}`, {
                headers: { 'x-api-key': apiKey }
            });
            const data = await resp.json();
            res.json({
                status: data.payment_status,
                paid: data.payment_status === 'finished'
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Status check failed' });
    }
}
