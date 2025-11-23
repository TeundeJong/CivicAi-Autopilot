import { getCampaign, listEmailTemplates, listLeads, listContentItems } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const { id } = req.query;
    const campaign = await getCampaign(id);
    const templates = await listEmailTemplates(id);
    const leads = await listLeads(id);
    const content = await listContentItems(id);

    res.status(200).json({ campaign, templates, leads, content });
  } catch (err) {
    console.error("get campaign error", err);
    res.status(500).json({ error: err.message });
  }
}
