export default async function handler(req, res) {
    const { invoice_id } = req.query;
    const apiKey = process.env.NOWPAYMENTS_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Server misconfiguration: API key missing' });
    }

    try {
        const response = await fetch(`https://api.nowpayments.io/v1/invoice/${invoice_id}`, {
            headers: { 'x-api-key': apiKey }
        });

        const data = await response.json();
        // NOWPayments statuses: 'created', 'partially_paid', 'finished', 'failed', 'expired'
        res.json({
            status: data.payment_status,
            paid: parseFloat(data.actually_paid) || 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Status check failed' });
    }
}
