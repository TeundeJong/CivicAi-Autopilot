import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState({
    name: "",
    niche: "",
    target_description: "",
    offer: "",
    tone: "vriendelijk en direct"
  });
  const [loading, setLoading] = useState(false);

  async function loadCampaigns() {
    try {
      const res = await fetch("/api/campaigns/list");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setCampaigns(data);
    } catch (err) {
      console.error(err);
      alert("Kon campagnes niet laden");
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function createCampaign(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setForm({
        name: "",
        niche: "",
        target_description: "",
        offer: "",
        tone: "vriendelijk en direct"
      });
      await loadCampaigns();
    } catch (err) {
      console.error(err);
      alert("Kon campagne niet aanmaken: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>CivicAI Autopilot</h1>
      <p>Alles-in-één: koude mails, content & kalender.</p>

      <div className="card">
        <h2>Nieuwe campagne</h2>
        <form onSubmit={createCampaign}>
          <label>
            Naam campagne
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Makelaars NL - ContractGuard demo"
              required
            />
          </label>
          <label>
            Niche / sector
            <input
              value={form.niche}
              onChange={e => setForm({ ...form, niche: e.target.value })}
              placeholder="Makelaars, vastgoed, advocaten, HR..."
            />
          </label>
          <label>
            Doelgroep beschrijving
            <textarea
              value={form.target_description}
              onChange={e => setForm({ ...form, target_description: e.target.value })}
              placeholder="Bijv. Eigenaren van kleine makelaarskantoren in Nederland..."
            />
          </label>
          <label>
            Aanbod / pitch
            <textarea
              value={form.offer}
              onChange={e => setForm({ ...form, offer: e.target.value })}
              placeholder="Bijv. AI die contracten in 10 seconden scant en risico's markeert..."
            />
          </label>
          <label>
            Tone of voice
            <input
              value={form.tone}
              onChange={e => setForm({ ...form, tone: e.target.value })}
            />
          </label>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Aanmaken..." : "Campagne aanmaken"}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Campagnes</h2>
        {campaigns.length === 0 && <p>Nog geen campagnes.</p>}
        <ul>
          {campaigns.map(c => (
            <li key={c.id}>
              <Link href={`/campaigns/${c.id}`}>
                {c.name} – <span style={{ color: "#9ca3af" }}>{c.niche}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2>Kalender & planning</h2>
        <Link href="/_calendar">
          <button className="btn-secondary">Bekijk kalender</button>
        </Link>
      </div>
    </div>
  );
}
