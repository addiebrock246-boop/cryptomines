export default async function handler(req, res) {
    const { invoice_id, type } = req.query;   // type: "fiat" ya "crypto"
    const apiKey = process.env.NOWPAYMENTS_API_KEY;

    try {
        let url;
        if (type === 'fiat') {
            url = `https://api.nowpayments.io/v1/fiat/invoice/${invoice_id}`;
        } else {
            url = `https://api.nowpayments.io/v1/invoice/${invoice_id}`;
        }

        const response = await fetch(url, {
            headers: { 'x-api-key': apiKey }
        });
        const data = await response.json();

        // Dono hi response mein payment_status aur actually_paid hota hai (ya amount)
        let status = data.payment_status;
        let paid = parseFloat(data.actually_paid) || parseFloat(data.paid) || 0;

        res.json({ status, paid });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}
