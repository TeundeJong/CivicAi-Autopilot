import { getOpenAIClient } from "../../../lib/openai";
import { saveEmailTemplates } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { campaign_id, niche, target_description, offer, tone } = req.body;
    if (!campaign_id) return res.status(400).json({ error: "campaign_id is required" });

    const client = getOpenAIClient();

    const prompt = `
Je bent een B2B sales copywriter. Schrijf:
- 1 koude e-mail
- 2 follow-up e-mails

Doelgroep: ${target_description}
Niche: ${niche}
Aanbod: ${offer}
Tone of voice: ${tone}

Gebruik korte, duidelijke zinnen en eindig elke mail met een simpele call-to-action.
Geef het resultaat terug in JSON met dit schema:

{
  "initial": { "subject": "...", "body": "..." },
  "followup1": { "subject": "...", "body": "..." },
  "followup2": { "subject": "...", "body": "..." }
}
`;

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      response_format: { type: "json_object" }
    });

    const text = completion.output[0].content[0].text;
    const json = JSON.parse(text);

    const templates = await saveEmailTemplates(campaign_id, json);

    res.status(200).json({ templates });
  } catch (err) {
    console.error("generate emails error", err);
    res.status(500).json({ error: err.message });
  }
}
