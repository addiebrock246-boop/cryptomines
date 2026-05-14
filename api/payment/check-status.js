export default async function handler(req, res) {
    const { session_id } = req.query;
    const crossmintApiKey = process.env.CROSSMINT_API_KEY;

    const crossmintBase = crossmintApiKey.startsWith('sk_staging')
        ? 'https://staging.crossmint.com'
        : 'https://www.crossmint.com';

    try {
        const response = await fetch(`${crossmintBase}/api/2022-06-09/checkout/sessions/${session_id}`, {
            headers: { 'x-api-key': crossmintApiKey }
        });
        const data = await response.json();
        const status = data.status;  // 'pending', 'processing', 'completed', 'failed'
        res.json({
            status: status === 'completed' ? 'finished' : status,
            paid: status === 'completed'
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}
