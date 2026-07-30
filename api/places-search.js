const GOOGLE_ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function verifyAdmin(req) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const adminEmail = (process.env.ADMIN_EMAIL || 'freesevenluck@gmail.com').toLowerCase();
  const authorization = req.headers.authorization || '';

  if (!supabaseUrl || !supabaseAnonKey || !authorization.startsWith('Bearer ')) return false;

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: supabaseAnonKey, Authorization: authorization }
  });
  if (!response.ok) return false;
  const user = await response.json();
  return String(user.email || '').toLowerCase() === adminEmail;
}

function normalizePlace(place) {
  return {
    placeId: place.id || '',
    businessName: place.displayName?.text || '',
    category: place.primaryTypeDisplayName?.text || '',
    address: place.formattedAddress || '',
    phone: place.nationalPhoneNumber || '',
    rating: Number(place.rating || 0),
    reviewCount: Number(place.userRatingCount || 0),
    businessStatus: place.businessStatus || '',
    websiteUri: place.websiteUri || '',
    googleMapsUrl: place.googleMapsUri || ''
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'Method not allowed.' });
  }

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.GOOGLE_PLACES_API_KEY) {
      return send(res, 503, {
        error: 'The Lead Finder environment variables are not configured yet.',
        setupRequired: true
      });
    }

    if (!(await verifyAdmin(req))) {
      return send(res, 401, { error: 'Admin authentication is required.' });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const category = String(body.category || '').trim().slice(0, 80);
    const location = String(body.location || '').trim().slice(0, 120);
    const pageToken = String(body.pageToken || '').trim().slice(0, 2000);
    if (!category || !location) {
      return send(res, 400, { error: 'Enter both a business category and a location.' });
    }

    const googleBody = { textQuery: `${category} in ${location}`, pageSize: 20 };
    if (pageToken) googleBody.pageToken = pageToken;

    const response = await fetch(GOOGLE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.primaryTypeDisplayName',
          'places.formattedAddress',
          'places.nationalPhoneNumber',
          'places.rating',
          'places.userRatingCount',
          'places.businessStatus',
          'places.websiteUri',
          'places.googleMapsUri',
          'nextPageToken'
        ].join(',')
      },
      body: JSON.stringify(googleBody)
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Google Places error', response.status, data?.error?.status || '');
      return send(res, 502, {
        error: data?.error?.message || 'Google Places could not complete the search.'
      });
    }

    const allPlaces = (data.places || []).map(normalizePlace);
    const candidates = allPlaces.filter(place =>
      !place.websiteUri && place.businessStatus !== 'CLOSED_PERMANENTLY'
    );

    return send(res, 200, {
      query: `${category} in ${location}`,
      candidates,
      resultCount: allPlaces.length,
      excludedWithWebsite: allPlaces.filter(place => place.websiteUri).length,
      nextPageToken: data.nextPageToken || ''
    });
  } catch (error) {
    console.error('Places search failed', error);
    return send(res, 500, { error: 'The business search could not be completed.' });
  }
};
