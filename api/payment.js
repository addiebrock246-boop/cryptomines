// api/payment.js
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY || "8QJ5H1Y-B0F4BH4-PBZWYSE-4VFJ450";
const NOWPAYMENTS_BASE = "https://api.nowpayments.io/v1";

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const path = url.pathname.replace(/^\/api\/payment\/?/, "");

  // Route 1: Create deposit (POST /api/payment/create-deposit)
  if (req.method === "POST" && path === "create-deposit") {
    try {
      const body = await readBody(req);
      const { user_id, amount, currency = "INR" } = body;

      const invoiceResp = await fetch(`${NOWPAYMENTS_BASE}/invoice`, {
        method: "POST",
        headers: {
          "x-api-key": NOWPAYMENTS_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          price_amount: parseFloat(amount),
          price_currency: currency,
          pay_currency: "USDT",
          order_id: `dep_${user_id}_${Date.now()}`,
          order_description: `Deposit for user ${user_id}`,
          success_url: "https://cryptomines.vercel.app/deposit-success",
          cancel_url: "https://cryptomines.vercel.app/deposit-cancel"
        })
      });

      const invoice = await invoiceResp.json();
      if (invoiceResp.ok) {
        res.status(200).json({ invoice_id: invoice.id, checkout_url: invoice.invoice_url });
      } else {
        res.status(500).json({ error: invoice.message || "Failed to create invoice" });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Route 2: Check payment status (GET /api/payment/check-status?order_id=xxx)
  else if (req.method === "GET" && path === "check-status") {
    const orderId = url.searchParams.get("order_id");
    if (!orderId) return res.status(400).json({ error: "Missing order_id" });

    try {
      const statusResp = await fetch(`${NOWPAYMENTS_BASE}/invoice/${orderId}`, {
        headers: { "x-api-key": NOWPAYMENTS_API_KEY }
      });
      const invoice = await statusResp.json();
      if (statusResp.ok) {
        res.status(200).json({ status: invoice.payment_status, paid: invoice.actually_paid });
      } else {
        res.status(404).json({ error: "Invoice not found" });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  else {
    res.status(404).send("Not Found");
  }
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString());
}
