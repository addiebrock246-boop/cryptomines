export default async function handler(req, res) {
    const { invoice_id } = req.query;
    const apiKey = process.env.NOWPAYMENTS_API_KEY;

    try {
        const response = await fetch(`https://api.nowpayments.io/v1/invoice/${invoice_id}`, {
            headers: { 'x-api-key': apiKey }
        });
        const data = await response.json();
        let status = data.payment_status;
        let paid = parseFloat(data.actually_paid) || 0; // USDT amount
        res.json({ status, paid });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}
