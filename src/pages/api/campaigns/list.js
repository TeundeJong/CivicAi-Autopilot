import { listCampaigns } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const campaigns = await listCampaigns();
    res.status(200).json(campaigns);
  } catch (err) {
    console.error("list campaigns error", err);
    res.status(500).json({ error: err.message });
  }
}
