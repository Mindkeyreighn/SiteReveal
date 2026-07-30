'use strict';

const DESIGN_FAMILIES = [
  'Field-service editorial',
  'Heritage specialist',
  'Premium appointment/service',
  'Warm neighborhood business',
  'Technical/trades authority',
  'Landscape-led local service'
];

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
      items: { type: 'string', minLength: 2, maxLength: 60 }
    },
    trustPoints: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: { type: 'string', minLength: 3, maxLength: 90 }
    },
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

function leadFacts(lead) {
  return {
    businessName: clean(lead.business_name, 140),
    category: clean(lead.category, 100),
    city: clean(lead.city, 180),
    phone: clean(lead.phone, 40),
    email: clean(lead.email, 180),
    suppliedTagline: clean(lead.tagline, 140),
    suppliedDescription: clean(lead.description, 800),
    suppliedAccentColor: /^#[0-9a-fA-F]{6}$/.test(lead.color || '') ? lead.color : '#1a56db',
    googleMapsUrl: clean(lead.google_maps_url, 800)
  };
}

function buildPrompt(lead) {
  const facts = leadFacts(lead);
  return [
    'Create a concise SiteSpec for a SiteReveal preview website.',
    'Use only the supplied facts. Never invent an owner name, years in business, credentials, license, guarantee, price, rating, review quote, service area, availability, or exact service that is not explicitly supplied.',
    'If the supplied description is sparse, keep wording general to the category and list unknown details under factsNeedingConfirmation.',
    'The site is an independent preview, not the official business website.',
    'Choose exactly one locked structural family and create one business-specific signature module.',
    'Services must be grounded in suppliedDescription. If none are supplied, use cautious category-level labels such as "Service details to confirm".',
    'Keep the language practical, local, and professional. Avoid hype and unverifiable superiority claims.',
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

async function createSiteSpec(lead) {
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
      input: buildPrompt(lead),
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

function renderSite(lead, spec) {
  const facts = leadFacts(lead);
  const initials = facts.businessName.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  const phoneHref = facts.phone ? `tel:${facts.phone.replace(/[^\d+]/g, '')}` : '#contact';
  const emailHref = facts.email ? `mailto:${facts.email}` : '#contact';
  const mapHref = facts.googleMapsUrl || '#contact';
  const contactNote = facts.phone || facts.email
    ? 'Use the verified contact information below.'
    : 'Contact details must be confirmed before launch.';
  const familyClass = `family-${DESIGN_FAMILIES.indexOf(spec.designFamily) + 1}`;

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
    .visual-card{position:absolute;inset:auto 32px 32px;background:#0b1210dc;color:#fff;border:1px solid #ffffff38;border-radius:18px;padding:26px}.visual-card strong{display:block;font-size:28px;margin-top:8px}
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
        <div class="eyebrow">${escapeHtml(facts.category)} · ${escapeHtml(facts.city || 'Location to confirm')}</div>
        <h1>${escapeHtml(spec.headline)}</h1>
        <p class="lede">${escapeHtml(spec.description)}</p>
        <div class="actions">
          <a class="button" href="${safeHref(phoneHref)}">${escapeHtml(facts.phone ? `Call ${facts.phone}` : spec.ctaLabel)}</a>
          <a class="button outline" href="#services">Explore services</a>
        </div>
      </div>
      <div class="visual">
        <div class="visual-card"><span>${escapeHtml(spec.designFamily)}</span><strong>${escapeHtml(spec.tagline)}</strong></div>
      </div>
    </div>
    <section id="services">
      <div class="section-head"><div><div class="eyebrow">What we can present</div><h2>Services, clearly organized.</h2></div><p>Every service shown in this preview comes from the supplied lead information and must be confirmed before launch.</p></div>
      <div class="cards">${spec.services.map((service, index) => `<article class="card"><span>0${index + 1}</span><h3>${escapeHtml(service)}</h3><p>Details and availability to be confirmed with ${escapeHtml(facts.businessName)}.</p></article>`).join('')}</div>
    </section>
    <section id="about">
      <div class="signature">
        <div><div class="eyebrow">Business-specific guide</div><h2>${escapeHtml(spec.signatureModuleTitle)}</h2></div>
        <ul>${renderList(spec.signatureModuleItems, 'signature-item')}</ul>
      </div>
    </section>
    <section>
      <div class="section-head"><div><div class="eyebrow">Why this preview works</div><h2>A dependable place to start.</h2></div><p>${escapeHtml(spec.tagline)}</p></div>
      <div class="cards">${spec.trustPoints.map((point, index) => `<article class="card"><span>0${index + 1}</span><h3>${escapeHtml(point)}</h3></article>`).join('')}</div>
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

function runQa(lead, spec, html) {
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
  return {
    passed: checks.every(check => check.passed),
    passedCount: checks.filter(check => check.passed).length,
    totalCount: checks.length,
    checks
  };
}

module.exports = {
  DESIGN_FAMILIES,
  SPEC_SCHEMA,
  buildPrompt,
  createSiteSpec,
  renderSite,
  runQa,
  leadFacts
};
