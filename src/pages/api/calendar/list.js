import { listCalendarItems } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const data = await listCalendarItems();
    res.status(200).json(data);
  } catch (err) {
    console.error("calendar list error", err);
    res.status(500).json({ error: err.message });
  }
}
