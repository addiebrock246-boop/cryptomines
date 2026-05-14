export default async function handler(req, res) {
    const { invoice_id, type } = req.query;
    const apiKey = process.env.NOWPAYMENTS_API_KEY;

    try {
        let url = type === 'fiat'
            ? `https://api.nowpayments.io/v1/fiat/invoice/${invoice_id}`
            : `https://api.nowpayments.io/v1/invoice/${invoice_id}`;

        const response = await fetch(url, { headers: { 'x-api-key': apiKey } });
        const data = await response.json();
        let status = data.payment_status;
        let paid = parseFloat(data.actually_paid) || parseFloat(data.paid) || 0;
        res.json({ status, paid });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}
