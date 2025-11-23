import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function CampaignDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [sendFrom, setSendFrom] = useState("");
  const [leadsText, setLeadsText] = useState("");

  async function loadData() {
    if (!id) return;
    const res = await fetch(`/api/campaigns/get?id=${id}`);
    const json = await res.json();
    if (!res.ok) {
      alert(json.error || "Kon campagne niet laden");
      return;
    }
    setData(json);
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function generateEmails() {
    if (!data?.campaign) return;
    setLoadingEmails(true);
    try {
      const res = await fetch("/api/emails/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: data.campaign.id,
          niche: data.campaign.niche,
          target_description: data.campaign.target_description,
          offer: data.campaign.offer,
          tone: data.campaign.tone
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error");
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Kon e-mails niet genereren: " + err.message);
    } finally {
      setLoadingEmails(false);
    }
  }

  async function addLeads() {
    if (!data?.campaign) return;
    setLoadingLeads(true);
    try {
      const lines = leadsText.split("\n").map(l => l.trim()).filter(Boolean);
      const leads = lines.map(l => {
        const [name, email, company] = l.split(",").map(x => x && x.trim());
        return { name, email, company };
      });

      const res = await fetch("/api/leads/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: data.campaign.id, leads })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error");
      setLeadsText("");
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Kon leads niet toevoegen: " + err.message);
    } finally {
      setLoadingLeads(false);
    }
  }

  async function schedule() {
    if (!data?.campaign) return;
    if (!selectedTemplates.length) {
      alert("Selecteer minstens 1 template");
      return;
    }
    setLoadingSchedule(true);
    try {
      const res = await fetch("/api/emails/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: data.campaign.id,
          template_ids: selectedTemplates,
          send_from: sendFrom || new Date().toISOString()
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error");
      alert(`Ingepland: ${json.scheduled.length} e-mails`);
    } catch (err) {
      console.error(err);
      alert("Kon e-mails niet inplannen: " + err.message);
    } finally {
      setLoadingSchedule(false);
    }
  }

  async function generateContent() {
    if (!data?.campaign) return;
    setLoadingContent(true);
    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: data.campaign.id,
          niche: data.campaign.niche,
          target_description: data.campaign.target_description,
          offer: data.campaign.offer,
          tone: data.campaign.tone
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error");
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Kon content niet genereren: " + err.message);
    } finally {
      setLoadingContent(false);
    }
  }

  if (!data) return <div className="container"><p>Loading...</p></div>;
  const { campaign, templates, leads, content } = data;

  return (
    <div className="container">
      <h1>{campaign.name}</h1>
      <p style={{ color: "#9ca3af" }}>{campaign.niche}</p>

      <div className="card">
        <h2>Koude e-mails</h2>
        <button className="btn" onClick={generateEmails} disabled={loadingEmails}>
          {loadingEmails ? "Bezig..." : "Genereer AI e-mails (3x)"}
        </button>

        <h3>Templates</h3>
        {(!templates || templates.length === 0) && <p>Nog geen templates.</p>}
        {templates && templates.length > 0 && (
          <div>
            {templates.map(t => (
              <div key={t.id} style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <input
                    type="checkbox"
                    checked={selectedTemplates.includes(t.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedTemplates(prev => [...prev, t.id]);
                      } else {
                        setSelectedTemplates(prev => prev.filter(x => x !== t.id));
                      }
                    }}
                  />
                  <span style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "#9ca3af" }}>{t.type}</span>
                </label>
                <div style={{ fontWeight: 600 }}>{t.subject}</div>
                <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem", background: "#020617", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #1f2937" }}>
                  {t.body}
                </pre>
              </div>
            ))}
          </div>
        )}

        <h3>Inplannen</h3>
        <label>
          Startmoment (optioneel, ISO of leeg = nu)
          <input
            value={sendFrom}
            onChange={e => setSendFrom(e.target.value)}
            placeholder={new Date().toISOString()}
          />
        </label>
        <button className="btn" onClick={schedule} disabled={loadingSchedule}>
          {loadingSchedule ? "Inplannen..." : "Plan e-mails in"}
        </button>
      </div>

      <div className="card">
        <h2>Leads</h2>
        <p>Formaat per regel: <code>naam, email, bedrijf</code></p>
        <textarea
          rows={6}
          placeholder={"Jan Jansen, jan@example.com, Jansen Makelaardij"}
          value={leadsText}
          onChange={e => setLeadsText(e.target.value)}
        />
        <button className="btn" onClick={addLeads} disabled={loadingLeads}>
          {loadingLeads ? "Toevoegen..." : "Leads toevoegen"}
        </button>

        <h3>Bestaande leads</h3>
        {(!leads || leads.length === 0) && <p>Nog geen leads.</p>}
        {leads && leads.length > 0 && (
          <ul>
            {leads.map(l => (
              <li key={l.id}>
                {l.name || "Naam onbekend"} – {l.email} {l.company && <>({l.company})</>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2>Content generator</h2>
        <button className="btn" onClick={generateContent} disabled={loadingContent}>
          {loadingContent ? "Bezig..." : "Genereer content (posts/ads/scripts)"}
        </button>

        <h3>Gegenereerde content</h3>
        {(!content || content.length === 0) && <p>Nog geen content.</p>}
        {content && content.length > 0 && (
          <ul>
            {content.map(c => (
              <li key={c.id}>
                <strong>{c.type}</strong>: {c.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
