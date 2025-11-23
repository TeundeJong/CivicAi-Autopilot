import { scheduleEmails } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { campaign_id, template_ids, send_from } = req.body;
    if (!campaign_id || !Array.isArray(template_ids) || !template_ids.length) {
      return res.status(400).json({ error: "campaign_id and template_ids are required" });
    }

    const start = send_from || new Date().toISOString();

    const scheduled = await scheduleEmails({
      campaign_id,
      template_ids,
      send_from: start
    });

    res.status(200).json({ scheduled });
  } catch (err) {
    console.error("schedule emails error", err);
    res.status(500).json({ error: err.message });
  }
}
