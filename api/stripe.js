// Stripe webhook -> Kit: tag the buyer as "client" so the onboarding sequence starts.
// Env vars (set in Vercel): STRIPE_WEBHOOK_SECRET, KIT_API_KEY
const crypto = require("crypto");

const KIT_CLIENT_TAG_ID = 25094695;

module.exports.config = { api: { bodyParser: false } };

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function verifyStripe(raw, header, secret) {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  const t = parts.t, v1 = parts.v1;
  if (!t || !v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${raw.toString("utf8")}`).digest("hex");
  try { return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1)); } catch { return false; }
}

async function kit(path, body) {
  const r = await fetch(`https://api.kit.com/v4${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Kit-Api-Key": process.env.KIT_API_KEY },
    body: JSON.stringify(body),
  });
  if (!r.ok && r.status !== 422) throw new Error(`Kit ${path} ${r.status}: ${await r.text()}`);
  return r.status;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const raw = await readRaw(req);
  if (!verifyStripe(raw, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET)) {
    return res.status(400).send("bad signature");
  }
  let event;
  try { event = JSON.parse(raw.toString("utf8")); } catch { return res.status(400).send("bad json"); }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object || {};
    const email = (s.customer_details && s.customer_details.email) || s.customer_email;
    const name = (s.customer_details && s.customer_details.name) || "";
    if (email) {
      try {
        await kit("/subscribers", { email_address: email, first_name: name.split(" ")[0] || undefined, state: "active" });
        await kit(`/tags/${KIT_CLIENT_TAG_ID}/subscribers`, { email_address: email });
      } catch (e) {
        console.error(e);
        return res.status(500).send("kit error");
      }
    }
  }
  res.status(200).json({ received: true });
};
