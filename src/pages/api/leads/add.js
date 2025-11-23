import { addLeads } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { campaign_id, leads } = req.body;
    if (!campaign_id) return res.status(400).json({ error: "campaign_id is required" });
    if (!Array.isArray(leads)) return res.status(400).json({ error: "leads must be array" });

    const inserted = await addLeads(campaign_id, leads);
    res.status(200).json({ leads: inserted });
  } catch (err) {
    console.error("add leads error", err);
    res.status(500).json({ error: err.message });
  }
}
