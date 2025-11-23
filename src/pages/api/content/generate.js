import { getOpenAIClient } from "../../../lib/openai";
import { saveContentItems } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { campaign_id, niche, target_description, offer, tone } = req.body;
    if (!campaign_id) return res.status(400).json({ error: "campaign_id is required" });

    const client = getOpenAIClient();

    const prompt = `
Genereer marketingcontent in JSON voor deze campagne:
Doelgroep: ${target_description}
Niche: ${niche}
Aanbod: ${offer}
Tone of voice: ${tone}

Output exact in dit JSON schema:

{
  "linkedin_posts": [ "...", "..." ],
  "instagram_captions": [ "...", "..." ],
  "ad_copy": [ "...", "..." ],
  "video_scripts": [ "...", "..." ]
}
`;

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      response_format: { type: "json_object" }
    });

    const text = completion.output[0].content[0].text;
    const json = JSON.parse(text);

    const items = [];

    (json.linkedin_posts || []).forEach((body, idx) => {
      items.push({ type: "linkedin_post", title: `LinkedIn post ${idx + 1}`, body });
    });

    (json.instagram_captions || []).forEach((body, idx) => {
      items.push({ type: "instagram_caption", title: `Instagram caption ${idx + 1}`, body });
    });

    (json.ad_copy || []).forEach((body, idx) => {
      items.push({ type: "ad_copy", title: `Ad copy ${idx + 1}`, body });
    });

    (json.video_scripts || []).forEach((body, idx) => {
      items.push({ type: "video_script", title: `Video script ${idx + 1}`, body });
    });

    const saved = await saveContentItems(campaign_id, items);

    res.status(200).json({ items: saved });
  } catch (err) {
    console.error("generate content error", err);
    res.status(500).json({ error: err.message });
  }
}
