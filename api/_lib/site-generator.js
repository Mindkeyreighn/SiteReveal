'use strict';

const DESIGN_FAMILIES = [
  'Field-service editorial',
  'Heritage specialist',
  'Premium appointment/service',
  'Warm neighborhood business',
  'Technical/trades authority',
  'Landscape-led local service'
];

// Purely decorative, hand-authored SVG artwork keyed by verified lead category.
// These are static markup only — never populated from AI output — so there is
// no way for generated text (a prompt, a motif description, an internal label)
// to appear inside the hero visual. If a category has no explicit entry, the
// generic "default" pattern is used.
const CATEGORY_VISUALS = {
  cleaning: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="120" cy="140" r="70" fill="none" stroke="#fff" stroke-width="2"/><circle cx="250" cy="90" r="34" fill="none" stroke="#fff" stroke-width="2"/><circle cx="290" cy="260" r="95" fill="none" stroke="#fff" stroke-width="2"/><circle cx="80" cy="300" r="30" fill="none" stroke="#fff" stroke-width="2"/></svg>`,
  irrigation: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M40 260 Q120 200 200 260 T360 260" fill="none" stroke="#fff" stroke-width="2"/><path d="M20 200 Q100 140 180 200 T340 200" fill="none" stroke="#fff" stroke-width="2"/><circle cx="300" cy="110" r="16" fill="#fff" opacity=".5"/><circle cx="250" cy="150" r="10" fill="#fff" opacity=".4"/></svg>`,
  landscaping: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M60 340 Q60 200 120 120" fill="none" stroke="#fff" stroke-width="2"/><path d="M120 340 Q130 220 210 140" fill="none" stroke="#fff" stroke-width="2"/><path d="M190 340 Q210 240 300 170" fill="none" stroke="#fff" stroke-width="2"/><path d="M270 340 Q290 260 360 210" fill="none" stroke="#fff" stroke-width="2"/></svg>`,
  trades: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M40 340 L200 60 L360 340 Z" fill="none" stroke="#fff" stroke-width="2"/><line x1="100" y1="240" x2="300" y2="240" stroke="#fff" stroke-width="2"/><line x1="140" y1="160" x2="260" y2="160" stroke="#fff" stroke-width="2"/></svg>`,
  moving: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="60" y="180" width="110" height="110" fill="none" stroke="#fff" stroke-width="2"/><rect x="190" y="120" width="140" height="140" fill="none" stroke="#fff" stroke-width="2"/><line x1="60" y1="180" x2="115" y2="140" stroke="#fff" stroke-width="2"/><line x1="170" y1="180" x2="225" y2="140" stroke="#fff" stroke-width="2"/></svg>`,
  hauling: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><line x1="0" y1="340" x2="400" y2="340" stroke="#fff" stroke-width="2"/><line x1="60" y1="40" x2="0" y2="340" stroke="#fff" stroke-width="2"/><line x1="220" y1="40" x2="160" y2="340" stroke="#fff" stroke-width="2"/><line x1="380" y1="40" x2="320" y2="340" stroke="#fff" stroke-width="2"/></svg>`,
  logistics: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="90" cy="120" r="12" fill="#fff"/><circle cx="300" cy="90" r="12" fill="#fff"/><circle cx="220" cy="240" r="12" fill="#fff"/><circle cx="340" cy="300" r="12" fill="#fff"/><circle cx="80" cy="300" r="12" fill="#fff"/><line x1="90" y1="120" x2="300" y2="90" stroke="#fff" stroke-width="2"/><line x1="300" y1="90" x2="220" y2="240" stroke="#fff" stroke-width="2"/><line x1="220" y1="240" x2="340" y2="300" stroke="#fff" stroke-width="2"/><line x1="220" y1="240" x2="80" y2="300" stroke="#fff" stroke-width="2"/></svg>`,
  painting: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M20 80 Q140 40 380 100" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".55"/><path d="M20 180 Q160 130 380 200" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" opacity=".4"/><path d="M20 290 Q150 250 380 320" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".6"/></svg>`,
  default: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="300" cy="90" r="150" fill="none" stroke="#fff" stroke-width="2"/><circle cx="90" cy="320" r="90" fill="none" stroke="#fff" stroke-width="2"/></svg>`
};

function pickCategoryVisual(category) {
  const key = String(category || '').toLowerCase().trim();
  const known = Object.prototype.hasOwnProperty.call(CATEGORY_VISUALS, key) && key !== 'default';
  return { key: known ? key : 'default', svg: known ? CATEGORY_VISUALS[key] : CATEGORY_VISUALS.default };
}

const SPEC_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'designFamily',
    'headline',
    'tagline',
    'description',
    'primaryColor',
    'secondaryColor',
    'ctaLabel',
    'services',
    'trustPoints',
    'visualMotif',
    'signatureModuleTitle',
    'signatureModuleItems',
    'factsUsed',
    'factsNeedingConfirmation'
  ],
  properties: {
    designFamily: { type: 'string', enum: DESIGN_FAMILIES },
    headline: { type: 'string', minLength: 8, maxLength: 80 },
    tagline: { type: 'string', minLength: 4, maxLength: 90 },
    description: { type: 'string', minLength: 20, maxLength: 320 },
    primaryColor: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
    secondaryColor: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
    ctaLabel: { type: 'string', minLength: 3, maxLength: 30 },
    services: {
      type: 'array',
      minItems: 3,
      maxItems: 6,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'summary'],
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 60 },
          summary: { type: 'string', minLength: 18, maxLength: 150 }
        }
      }
    },
    trustPoints: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'detail'],
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 60 },
          detail: { type: 'string', minLength: 18, maxLength: 140 }
        }
      }
    },
    visualMotif: { type: 'string', minLength: 12, maxLength: 100 },
    signatureModuleTitle: { type: 'string', minLength: 4, maxLength: 70 },
    signatureModuleItems: {
      type: 'array',
      minItems: 3,
      maxItems: 5,
      items: { type: 'string', minLength: 3, maxLength: 90 }
    },
    factsUsed: {
      type: 'array',
      maxItems: 20,
      items: { type: 'string', maxLength: 180 }
    },
    factsNeedingConfirmation: {
      type: 'array',
      maxItems: 20,
      items: { type: 'string', maxLength: 180 }
    }
  }
};

function clean(value, max = 500) {
  return String(value || '').trim().slice(0, max);
}

function normalizeLocation(value) {
  const raw = clean(value, 220);
  const parts = raw.split(',').map(part => part.trim()).filter(Boolean);
  if (parts.length >= 3) {
    const country = /^(usa|united states)$/i.test(parts.at(-1)) ? parts.pop() : '';
    const regionMatch = (parts.at(-1) || '').match(/^([A-Z]{2})(?:\s+\d{5}(?:-\d{4})?)?$/i);
    if (regionMatch) {
      const region = regionMatch[1].toUpperCase();
      const locality = parts.at(-2) || '';
      return { raw, locality, region, label: [locality, region].filter(Boolean).join(', '), country };
    }
  }
  if (parts.length === 2 && /^[A-Z]{2}$/i.test(parts[1])) {
    return { raw, locality: parts[0], region: parts[1].toUpperCase(), label: `${parts[0]}, ${parts[1].toUpperCase()}`, country: '' };
  }
  return { raw, locality: raw, region: '', label: raw, country: '' };
}

function leadFacts(lead) {
  const location = normalizeLocation(lead.city);
  return {
    businessName: clean(lead.business_name, 140),
    category: clean(lead.category, 100),
    address: location.raw,
    locality: location.locality,
    region: location.region,
    locationLabel: location.label,
    phone: clean(lead.phone, 40),
    email: clean(lead.email, 180),
    suppliedTagline: clean(lead.tagline, 140),
    suppliedDescription: clean(lead.description, 800),
    suppliedAccentColor: /^#[0-9a-fA-F]{6}$/.test(lead.color || '') ? lead.color : '#1a56db',
    googleMapsUrl: clean(lead.google_maps_url, 800),
    googleRating: Number(lead.source_rating) || null,
    googleReviewCount: Number(lead.source_review_count) || null,
    discoveryQuery: clean(lead.source_search_query, 180)
  };
}

function buildPrompt(lead, reviewNotes = '') {
  const facts = leadFacts(lead);
  return [
    'Create a concise SiteSpec for a SiteReveal preview website.',
    'Use only the supplied facts. Never invent an owner name, years in business, credentials, license, guarantee, price, rating, review quote, service area, availability, or exact service that is not explicitly supplied.',
    'If the supplied description is sparse, use industry knowledge only to organize likely customer questions and neutral category-level topics. Do not present those topics as confirmed offerings.',
    'The site is an independent preview, not the official business website.',
    'Choose exactly one locked structural family and create one business-specific signature module.',
    'Create 3–6 distinct service-topic cards. Each needs a different useful name and summary. Do not repeat "to confirm", "details and availability", or the business name across cards. Put uncertainty in factsNeedingConfirmation instead.',
    'Write three distinct trust points with practical customer benefits. Do not reuse service copy.',
    'Choose a visualMotif that is unmistakably relevant to the category, described as an abstract composition without inventing a business photo.',
    'Avoid generic filler such as dependable place to start, quality service, your trusted partner, or take the next step unless supplied.',
    'Use locationLabel for display copy. Treat address as a full address, not a city name.',
    'Keep the language practical, local, and professional. Avoid hype and unverifiable superiority claims.',
    reviewNotes ? `HUMAN REVIEW NOTES (follow these unless they conflict with factual-safety rules):\n${clean(reviewNotes, 600)}` : '',
    `LOCKED FAMILIES: ${DESIGN_FAMILIES.join('; ')}`,
    `VERIFIED/SUPPLIED LEAD DATA:\n${JSON.stringify(facts, null, 2)}`
  ].join('\n\n');
}

function extractOutputText(data) {
  if (typeof data?.output_text === 'string') return data.output_text;
  for (const output of data?.output || []) {
    for (const content of output?.content || []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') return content.text;
    }
  }
  return '';
}

async function createSiteSpec(lead, reviewNotes = '') {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-5.6';
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured.');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      input: buildPrompt(lead, reviewNotes),
      text: {
        format: {
          type: 'json_schema',
          name: 'site_reveal_site_spec',
          strict: true,
          schema: SPEC_SCHEMA
        }
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const detail = data?.error?.message || `OpenAI request failed (${response.status}).`;
    throw new Error(detail);
  }

  const outputText = extractOutputText(data);
  if (!outputText) throw new Error('OpenAI returned no structured site specification.');

  let spec;
  try {
    spec = JSON.parse(outputText);
  } catch {
    throw new Error('OpenAI returned an invalid site specification.');
  }
  return { spec, model, responseId: data.id || '' };
}

// Generates an optional photographic hero image via OpenAI's image API.
// The prompt is built only from verified structured facts (never freeform
// GPT copy), and explicitly forbids rendering any text/words/logos into the
// image — the standard mitigation for the "prompt leaked into the image"
// failure mode. This is a soft-fail feature: if generation is unavailable,
// errors, or times out, callers must fall back to the category SVG artwork
// and continue — it never blocks site generation.
async function generateHeroImage(lead, spec) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const imageModel = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
  const facts = leadFacts(lead);

  const prompt = [
    `A professional, photorealistic marketing photograph representing a ${facts.category || 'local service'} business in ${facts.locationLabel || 'a US city'}.`,
    'Depict a realistic, relevant scene for this category (appropriate setting, tools, or environment) with natural lighting and a candid, editorial feel, in the manner of real small-business marketing photography.',
    'Absolutely no text, words, letters, numbers, logos, signage, labels, price tags, or writing of any kind may appear anywhere in the image, on any surface, sign, vehicle, clothing, or object.',
    'Do not depict any real, identifiable brand, logo, or trademark.',
    'If a person appears, keep them secondary and not identifiable (from behind, at a distance, or with their face not in sharp focus).'
  ].join(' ');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: imageModel, prompt, size: '1536x1024', n: 1 }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    const data = await response.json();
    if (!response.ok) {
      console.error('Hero image generation failed', data?.error?.message || response.status);
      return null;
    }
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) return null;
    return { dataUrl: `data:image/png;base64,${b64}`, model: imageModel, promptUsed: prompt };
  } catch (error) {
    console.error('Hero image generation error', error?.message || error);
    return null;
  }
}


function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

function safeHref(value, fallback = '#contact') {
  const text = String(value || '').trim();
  if (/^(https?:|tel:|mailto:)/i.test(text)) return escapeHtml(text);
  return fallback;
}

function renderList(items, className) {
  return items.map(item => `<li class="${className}">${escapeHtml(item)}</li>`).join('');
}

function renderSite(lead, spec, heroImage = null) {
  const facts = leadFacts(lead);
  const initials = facts.businessName.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  const phoneHref = facts.phone ? `tel:${facts.phone.replace(/[^\d+]/g, '')}` : '#contact';
  const emailHref = facts.email ? `mailto:${facts.email}` : '#contact';
  const mapHref = facts.googleMapsUrl || '#contact';
  const contactNote = facts.phone || facts.email
    ? 'Use the verified contact information below.'
    : 'Contact details must be confirmed before launch.';
  const familyClass = `family-${DESIGN_FAMILIES.indexOf(spec.designFamily) + 1}`;
  const artwork = pickCategoryVisual(facts.category);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(facts.businessName)} | SiteReveal Preview</title>
  <meta name="description" content="${escapeHtml(spec.description)}">
  <style>
    :root{--ink:#0d1714;--paper:#f7f5ef;--primary:${escapeHtml(spec.primaryColor)};--secondary:${escapeHtml(spec.secondaryColor)};--line:#d9dedb;--white:#fff}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--ink);background:var(--paper);font:16px/1.55 Arial,sans-serif}
    a{color:inherit}.preview{padding:9px 18px;text-align:center;background:var(--secondary);color:#fff;font-size:12px;font-weight:800;letter-spacing:.08em}
    .wrap{width:min(1160px,calc(100% - 36px));margin:auto}.nav{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:22px 0}
    .brand{display:flex;align-items:center;gap:12px;font-weight:900}.mark{width:46px;height:46px;display:grid;place-items:center;background:var(--primary);color:#fff;border-radius:12px}
    .navlinks{display:flex;gap:18px;align-items:center}.button{display:inline-block;text-decoration:none;border:1px solid var(--ink);background:var(--ink);color:#fff;padding:12px 18px;border-radius:999px;font-weight:800}
    .hero{min-height:620px;display:grid;grid-template-columns:1.12fr .88fr;border:1px solid var(--line);border-radius:28px;overflow:hidden;background:#fff}
    .hero-copy{padding:clamp(42px,7vw,90px);display:flex;flex-direction:column;justify-content:center}.eyebrow{color:var(--primary);font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}
    h1{font-size:clamp(48px,7vw,96px);line-height:.92;letter-spacing:-.055em;margin:22px 0}.lede{font-size:clamp(18px,2vw,24px);max-width:650px;color:#4f5c57}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:25px}
    .outline{background:transparent;color:var(--ink)}.visual{position:relative;min-height:430px;overflow:hidden;background:linear-gradient(145deg,var(--primary),var(--secondary))}
    .visual:before,.visual:after{content:"";position:absolute;border:1px solid #ffffff66;border-radius:50%}.visual:before{width:420px;height:420px;right:-100px;top:-70px}.visual:after{width:250px;height:250px;left:-80px;bottom:-40px}
    .visual svg{position:absolute;inset:0;width:100%;height:100%;opacity:.6}
    section{padding:90px 0}.section-head{display:grid;grid-template-columns:1fr 1fr;gap:35px;align-items:end;margin-bottom:36px}h2{font-size:clamp(36px,5vw,64px);line-height:1;letter-spacing:-.04em;margin:0}
    .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:28px}.card span{color:var(--primary);font-weight:900}
    .signature{background:#0c1512;color:#fff;border-radius:28px;padding:clamp(36px,6vw,76px);display:grid;grid-template-columns:.8fr 1.2fr;gap:45px}.signature ul{list-style:none;padding:0;margin:0;display:grid;gap:12px}.signature li{padding:16px 18px;border:1px solid #ffffff2e;border-radius:12px;background:#ffffff0a}
    .contact{display:grid;grid-template-columns:1fr auto;gap:35px;align-items:center;background:var(--primary);color:#fff;border-radius:28px;padding:clamp(35px,6vw,70px)}footer{padding:40px 0;color:#5d6965;font-size:13px}
    .family-1 .hero{grid-template-columns:.9fr 1.1fr}.family-2 .hero{border-radius:4px}.family-3 .hero-copy{text-align:center}.family-3 .actions{justify-content:center}.family-4 .hero{border-radius:46px}.family-5 .visual{background-color:#07141d;background-image:linear-gradient(#ffffff12 1px,transparent 1px),linear-gradient(90deg,#ffffff12 1px,transparent 1px);background-size:34px 34px}.family-6 .visual{background:linear-gradient(150deg,#173e2b,var(--primary))}
    @media(max-width:800px){.navlinks a:not(.button){display:none}.hero,.section-head,.signature,.contact{grid-template-columns:1fr}.visual{order:-1}.cards{grid-template-columns:1fr}section{padding:62px 0}h1{font-size:52px}}
  </style>
</head>
<body class="${familyClass}">
  <div class="preview">SITEREVEAL PREVIEW · BUSINESS DETAILS MUST BE APPROVED BEFORE LAUNCH</div>
  <header class="wrap nav">
    <div class="brand"><span class="mark">${escapeHtml(initials || 'SR')}</span><span>${escapeHtml(facts.businessName)}</span></div>
    <nav class="navlinks"><a href="#services">Services</a><a href="#about">About</a><a class="button" href="#contact">${escapeHtml(spec.ctaLabel)}</a></nav>
  </header>
  <main class="wrap">
    <div class="hero">
      <div class="hero-copy">
        <div class="eyebrow">${[escapeHtml(facts.category), escapeHtml(facts.locationLabel || 'Location to confirm')].filter(Boolean).join(' · ')}</div>
        <h1>${escapeHtml(spec.headline)}</h1>
        <p class="lede">${escapeHtml(spec.description)}</p>
        <div class="actions">
          <a class="button" href="${safeHref(phoneHref)}">${escapeHtml(facts.phone ? `Call ${facts.phone}` : spec.ctaLabel)}</a>
          <a class="button outline" href="#services">Explore services</a>
        </div>
      </div>
      <div class="visual" data-visual="${artwork.key}"${heroImage?.dataUrl ? ` data-hero-image="ai-generated" style="background-image:url('${heroImage.dataUrl}');background-size:cover;background-position:center"` : ''}>${heroImage?.dataUrl ? '' : artwork.svg}</div>
    </div>
    <section id="services">
      <div class="section-head"><div><div class="eyebrow">What customers may need</div><h2>Useful information, organized clearly.</h2></div><p>This independent preview uses supplied lead details and industry-relevant structure. Specific offerings must be confirmed before launch.</p></div>
      <div class="cards">${spec.services.map((service, index) => `<article class="card"><span>0${index + 1}</span><h3>${escapeHtml(service.name)}</h3><p>${escapeHtml(service.summary)}</p></article>`).join('')}</div>
    </section>
    <section id="about">
      <div class="signature">
        <div><div class="eyebrow">Business-specific guide</div><h2>${escapeHtml(spec.signatureModuleTitle)}</h2></div>
        <ul>${renderList(spec.signatureModuleItems, 'signature-item')}</ul>
      </div>
    </section>
    <section>
      <div class="section-head"><div><div class="eyebrow">Why this preview works</div><h2>A dependable place to start.</h2></div><p>${escapeHtml(spec.tagline)}</p></div>
      <div class="cards">${spec.trustPoints.map((point, index) => `<article class="card"><span>0${index + 1}</span><h3>${escapeHtml(point.title)}</h3><p>${escapeHtml(point.detail)}</p></article>`).join('')}</div>
    </section>
    <section id="contact">
      <div class="contact">
        <div><div class="eyebrow" style="color:#fff">Contact</div><h2>Take the next step.</h2><p>${escapeHtml(contactNote)}</p></div>
        <div class="actions">
          ${facts.phone ? `<a class="button" href="${safeHref(phoneHref)}">Call ${escapeHtml(facts.phone)}</a>` : ''}
          ${facts.email ? `<a class="button" href="${safeHref(emailHref)}">Email business</a>` : ''}
          ${facts.googleMapsUrl ? `<a class="button outline" style="color:#fff;border-color:#fff" href="${safeHref(mapHref)}" target="_blank" rel="noopener">View on Google Maps</a>` : ''}
        </div>
      </div>
    </section>
  </main>
  <footer class="wrap">Independent SiteReveal preview for ${escapeHtml(facts.businessName)}. Not the official business website unless purchased and approved by the owner.</footer>
</body>
</html>`;
}

function runQa(lead, spec, html, heroImage = null) {
  const checks = [];
  const add = (id, label, passed, detail) => checks.push({ id, label, passed: Boolean(passed), detail });
  add('verified', 'Lead is verified', lead.verification === 'Verified', `Verification: ${lead.verification || 'missing'}`);
  add('not_published', 'Lead remains unpublished', !lead.published, lead.published ? 'Lead is currently public.' : 'Draft remains private.');
  add('family', 'Locked structural family selected', DESIGN_FAMILIES.includes(spec.designFamily), spec.designFamily);
  add('preview_notice', 'Preview disclaimer included', html.includes('BUSINESS DETAILS MUST BE APPROVED'), 'Required preview language.');
  add('responsive', 'Responsive viewport and mobile rule included', html.includes('width=device-width') && html.includes('@media(max-width:800px)'), 'Static renderer check.');
  add('contact', 'At least one verified contact route or explicit confirmation notice', Boolean(lead.phone || lead.email || html.includes('Contact details must be confirmed')), lead.phone || lead.email || 'Contact confirmation notice included.');
  add('facts', 'Fact ledger produced', Array.isArray(spec.factsUsed) && Array.isArray(spec.factsNeedingConfirmation), `${spec.factsUsed?.length || 0} used, ${spec.factsNeedingConfirmation?.length || 0} to confirm.`);
  add('no_scripts', 'Generated draft contains no executable scripts', !/<script[\s>]/i.test(html), 'Renderer does not emit scripts.');
  const leakedFamilyLabel = DESIGN_FAMILIES.find(family => html.includes(family));
  add('no_internal_labels', 'No internal design-family label visible in the draft', !leakedFamilyLabel, leakedFamilyLabel ? `Found "${leakedFamilyLabel}" rendered as visible text.` : 'No internal labels present.');
  const motifLeaked = Boolean(spec.visualMotif) && html.includes(spec.visualMotif);
  add('no_motif_leak', 'AI visual-direction text is not rendered as visible copy', !motifLeaked, motifLeaked ? 'The visualMotif field appears verbatim in the rendered HTML.' : 'visualMotif was not found in visible output.');
  const promptLanguagePattern = /\b(abstract composition|digital art|illustration of|photo of|photograph of|rendered in the style of|image of|depicting|art direction|visual motif)\b/i;
  const copyFields = [
    spec.headline, spec.tagline, spec.description, spec.signatureModuleTitle,
    ...(spec.services || []).flatMap(s => [s.name, s.summary]),
    ...(spec.trustPoints || []).flatMap(t => [t.title, t.detail]),
    ...(spec.signatureModuleItems || [])
  ].filter(Boolean);
  const promptLeakField = copyFields.find(text => promptLanguagePattern.test(text));
  add('no_prompt_language', 'Customer-facing copy contains no AI art-direction phrasing', !promptLeakField, promptLeakField ? `Found art-direction language in copy: "${promptLeakField}"` : 'No art-direction phrasing detected in copy fields.');
  const artworkRendered = /data-visual="[a-z]+"/.test(html) && (/<svg[\s>]/i.test(html) || /data-hero-image="ai-generated"/.test(html));
  add('category_artwork_rendered', 'Hero visual rendered successfully (artwork or photo)', artworkRendered, artworkRendered ? 'Hero artwork present.' : 'Hero visual is missing its category artwork.');
  const serviceNames = (spec.services || []).map(item => String(item.name || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim());
  const serviceCopy = (spec.services || []).map(item => `${item.name || ''} ${item.summary || ''}`.toLowerCase());
  add('distinct_services', 'Service topics are distinct', new Set(serviceNames).size === serviceNames.length, `${new Set(serviceNames).size} unique names across ${serviceNames.length} cards.`);
  const placeholderCount = serviceCopy.filter(text => /to confirm|details and availability|service details/i.test(text)).length;
  add('low_placeholder_density', 'Placeholder language is consolidated', placeholderCount <= 1, `${placeholderCount} service cards contain repetitive confirmation wording.`);
  const location = normalizeLocation(lead.city);
  add('normalized_location', 'Location is normalized for display', !location.label.match(/^\d+\s/) && location.label.length > 1, `Display location: ${location.label || 'missing'}`);
  const paletteDistinct = String(spec.primaryColor || '').toLowerCase() !== String(spec.secondaryColor || '').toLowerCase();
  add('distinct_palette', 'Primary and secondary colors are distinct', paletteDistinct, `${spec.primaryColor} / ${spec.secondaryColor}`);
  const safetyIds = new Set(['verified', 'not_published', 'preview_notice', 'contact', 'facts', 'no_scripts', 'no_internal_labels', 'no_motif_leak', 'no_prompt_language']);
  const contentIds = new Set(['distinct_services', 'low_placeholder_density', 'normalized_location']);
  const score = ids => {
    const group = checks.filter(check => ids.has(check.id));
    return group.length ? Math.round(group.filter(check => check.passed).length / group.length * 100) : 0;
  };
  return {
    passed: checks.every(check => check.passed),
    passedCount: checks.filter(check => check.passed).length,
    totalCount: checks.length,
    checks,
    requiresVisualReview: Boolean(heroImage?.dataUrl),
    visualReviewNote: heroImage?.dataUrl
      ? 'This draft includes an AI-generated hero photo. Automated checks cannot verify image pixel content — visually confirm there is no embedded text, watermark, logo, or distorted imagery before catalog approval.'
      : '',
    scores: {
      safety: score(safetyIds),
      content: score(contentIds),
      design: score(new Set(['family', 'distinct_palette', 'category_artwork_rendered'])),
      responsive: score(new Set(['responsive']))
    }
  };
}

module.exports = {
  DESIGN_FAMILIES,
  CATEGORY_VISUALS,
  SPEC_SCHEMA,
  normalizeLocation,
  pickCategoryVisual,
  buildPrompt,
  createSiteSpec,
  generateHeroImage,
  renderSite,
  runQa,
  leadFacts
};
