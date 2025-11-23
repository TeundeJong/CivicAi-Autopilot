import { createCampaign } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { name, niche, target_description, offer, tone } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const campaign = await createCampaign({
      name,
      niche: niche || "",
      target_description: target_description || "",
      offer: offer || "",
      tone: tone || "friendly"
    });

    res.status(200).json(campaign);
  } catch (err) {
    console.error("create campaign error", err);
    res.status(500).json({ error: err.message });
  }
}
