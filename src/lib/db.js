import { getSupabaseAdmin } from "./supabaseAdmin";

/**
 * Simple DB helper functions using Supabase.
 */

export async function createCampaign({ name, niche, target_description, offer, tone }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("campaigns")
    .insert([{ name, niche, target_description, offer, tone }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listCampaigns() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getCampaign(id) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function saveEmailTemplates(campaign_id, templates) {
  const supabase = getSupabaseAdmin();
  const rows = Object.entries(templates).map(([type, tpl]) => ({
    campaign_id,
    type,
    subject: tpl.subject,
    body: tpl.body
  }));
  const { data, error } = await supabase
    .from("email_templates")
    .insert(rows)
    .select();
  if (error) throw error;
  return data;
}

export async function listEmailTemplates(campaign_id) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .eq("campaign_id", campaign_id)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addLeads(campaign_id, leads) {
  const supabase = getSupabaseAdmin();
  const rows = leads.map(l => ({
    campaign_id,
    name: l.name || null,
    company: l.company || null,
    email: l.email,
    extra_data: l.extra_data || null
  }));
  const { data, error } = await supabase
    .from("leads")
    .insert(rows)
    .select();
  if (error) throw error;
  return data;
}

export async function listLeads(campaign_id) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("campaign_id", campaign_id)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function scheduleEmails({ campaign_id, template_ids, send_from, max_per_run = 50 }) {
  const supabase = getSupabaseAdmin();

  const { data: leads, error: leadErr } = await supabase
    .from("leads")
    .select("*")
    .eq("campaign_id", campaign_id);
  if (leadErr) throw leadErr;

  const { data: templates, error: tplErr } = await supabase
    .from("email_templates")
    .select("*")
    .in("id", template_ids);
  if (tplErr) throw tplErr;

  const scheduledRows = [];
  let offsetMinutes = 0;

  for (const lead of leads) {
    for (const tpl of templates) {
      const scheduled_for = new Date(new Date(send_from).getTime() + offsetMinutes * 60000).toISOString();
      scheduledRows.push({
        campaign_id,
        lead_id: lead.id,
        template_id: tpl.id,
        scheduled_for,
        status: "pending"
      });
      offsetMinutes += 2; // kleine delay tussen mails
    }
  }

  if (!scheduledRows.length) return [];

  const { data, error } = await supabase
    .from("scheduled_emails")
    .insert(scheduledRows)
    .select();
  if (error) throw error;
  return data;
}

export async function getPendingEmails(limit = 20) {
  const supabase = getSupabaseAdmin();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("scheduled_emails")
    .select("*, leads(*), email_templates(*)")
    .eq("status", "pending")
    .lte("scheduled_for", nowIso)
    .order("scheduled_for", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function markEmailAsSent(id, provider_message_id) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("scheduled_emails")
    .update({
      status: "sent",
      provider_message_id
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Content items for generator + calendar **/

export async function saveContentItems(campaign_id, items) {
  const supabase = getSupabaseAdmin();
  const rows = items.map(it => ({
    campaign_id,
    type: it.type,
    title: it.title,
    body: it.body,
    scheduled_for: it.scheduled_for || null
  }));
  const { data, error } = await supabase
    .from("content_items")
    .insert(rows)
    .select();
  if (error) throw error;
  return data;
}

export async function listContentItems(campaign_id) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("content_items")
    .select("*")
    .eq("campaign_id", campaign_id)
    .order("scheduled_for", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function listCalendarItems() {
  const supabase = getSupabaseAdmin();
  const { data: emails, error: emailsErr } = await supabase
    .from("scheduled_emails")
    .select("id, scheduled_for, status, leads(email), email_templates(subject)")
    .order("scheduled_for", { ascending: true });

  if (emailsErr) throw emailsErr;

  const { data: content, error: contentErr } = await supabase
    .from("content_items")
    .select("*")
    .order("scheduled_for", { ascending: true });

  if (contentErr) throw contentErr;

  return { emails, content };
}
