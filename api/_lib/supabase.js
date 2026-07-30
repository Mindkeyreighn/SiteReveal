'use strict';

function config() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Supabase automation credentials are not configured.');
  return { url, serviceKey };
}

async function request(path, options = {}) {
  const { url, serviceKey } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: options.prefer || 'return=representation',
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(data?.message || data?.hint || `Supabase request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function getLead(id) {
  const rows = await request(`leads?id=eq.${encodeURIComponent(id)}&select=*`, { method: 'GET' });
  return rows?.[0] || null;
}

async function insertJob(row) {
  const rows = await request('generation_jobs', {
    method: 'POST',
    body: JSON.stringify(row)
  });
  return rows?.[0];
}

async function updateJob(id, row) {
  const rows = await request(`generation_jobs?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...row, updated_at: new Date().toISOString() })
  });
  return rows?.[0];
}

async function updateLead(id, row) {
  const rows = await request(`leads?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...row, updated_at: new Date().toISOString() })
  });
  return rows?.[0];
}

module.exports = { getLead, insertJob, updateJob, updateLead };
