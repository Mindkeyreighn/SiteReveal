'use strict';

async function verifyAdmin(req) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const adminEmail = (process.env.ADMIN_EMAIL || 'freesevenluck@gmail.com').toLowerCase();
  const authorization = req.headers.authorization || '';

  if (!supabaseUrl || !supabaseAnonKey || !authorization.startsWith('Bearer ')) {
    return null;
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: supabaseAnonKey, Authorization: authorization }
  });
  if (!response.ok) return null;

  const user = await response.json();
  if (String(user.email || '').toLowerCase() !== adminEmail) return null;
  return user;
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

module.exports = { verifyAdmin, sendJson };
