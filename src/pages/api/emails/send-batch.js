import { getPendingEmails, markEmailAsSent } from "../../../lib/db";
import { sendMail } from "../../../lib/mailer";

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") return res.status(405).end();

  try {
    const secret = req.headers["x-cron-secret"] || req.query.secret;
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const pending = await getPendingEmails(20);
    let sentCount = 0;

    for (const item of pending) {
      const to = item.leads.email;
      const subject = item.email_templates.subject;
      let html = item.email_templates.body || "";
      if (item.leads.name) {
        html = html.replace(/{{name}}/gi, item.leads.name);
      }

      try {
        const messageId = await sendMail({ to, subject, html });
        await markEmailAsSent(item.id, messageId);
        sentCount++;
      } catch (err) {
        console.error("send email failed", err);
      }
    }

    res.status(200).json({ sent: sentCount });
  } catch (err) {
    console.error("send-batch error", err);
    res.status(500).json({ error: err.message });
  }
}
