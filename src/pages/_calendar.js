import { useEffect, useState } from "react";

export default function CalendarPage() {
  const [data, setData] = useState({ emails: [], content: [] });

  async function load() {
    try {
      const res = await fetch("/api/calendar/list");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error");
      setData(json);
    } catch (err) {
      console.error(err);
      alert("Kon kalender niet laden: " + err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="container">
      <h1>Kalender & planning</h1>

      <div className="card">
        <h2>Geplande e-mails</h2>
        {(!data.emails || data.emails.length === 0) && <p>Geen e-mails ingepland.</p>}
        {data.emails && data.emails.length > 0 && (
          <ul>
            {data.emails.map(e => (
              <li key={e.id}>
                {e.scheduled_for} – {e.email_templates?.subject} → {e.leads?.email} ({e.status})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2>Content items</h2>
        {(!data.content || data.content.length === 0) && <p>Geen content items.</p>}
        {data.content && data.content.length > 0 && (
          <ul>
            {data.content.map(c => (
              <li key={c.id}>
                {c.scheduled_for || "geen datum"} – <strong>{c.type}</strong> – {c.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
