'use strict';

const FAMILY_SLUGS = {
  'Field-service editorial': 'field-editorial',
  'Heritage specialist': 'heritage-specialist',
  'Premium appointment/service': 'premium-appointment',
  'Warm neighborhood business': 'warm-neighborhood',
  'Technical/trades authority': 'technical-authority',
  'Landscape-led local service': 'landscape-local'
};

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

function href(value, fallback = '#contact') {
  const text = String(value || '').trim();
  return /^(https?:|tel:|mailto:)/i.test(text) ? esc(text) : fallback;
}

function contactLinks(facts, light = false) {
  const cls = light ? 'button button-light' : 'button';
  return [
    facts.phone ? `<a class="${cls}" href="tel:${esc(facts.phone.replace(/[^\d+]/g, ''))}">Call ${esc(facts.phone)}</a>` : '',
    facts.email ? `<a class="${cls}" href="mailto:${esc(facts.email)}">Email business</a>` : '',
    facts.googleMapsUrl ? `<a class="${cls} button-outline" href="${href(facts.googleMapsUrl)}" target="_blank" rel="noopener">View on Google Maps</a>` : ''
  ].filter(Boolean).join('');
}

function serviceItems(spec, mode = 'cards') {
  return spec.services.map((item, index) => `<article class="service-item ${mode}"><b class="number">0${index + 1}</b><div><h3>${esc(item.name)}</h3><p>${esc(item.summary)}</p></div></article>`).join('');
}

function trustItems(spec) {
  return spec.trustPoints.map((item, index) => `<article class="trust-item"><b>0${index + 1}</b><h3>${esc(item.title)}</h3><p>${esc(item.detail)}</p></article>`).join('');
}

function proofItems(spec) {
  return spec.proofPoints.map(item => `<div class="proof-item"><strong>${esc(item.title)}</strong><span>${esc(item.detail)}</span></div>`).join('');
}

function processItems(spec) {
  return spec.processSteps.map((item, index) => `<article class="process-step"><b>0${index + 1}</b><div><h3>${esc(item.title)}</h3><p>${esc(item.detail)}</p></div></article>`).join('');
}

function signatureItems(spec) {
  return spec.signatureModuleItems.map((item, index) => `<li><b>0${index + 1}</b><span>${esc(item)}</span></li>`).join('');
}

function visual(spec, artwork, heroImage) {
  const imageStyle = heroImage?.dataUrl
    ? ` style="background-image:linear-gradient(180deg,transparent 55%,#07130d88),url('${heroImage.dataUrl}')" data-hero-image="ai-generated"`
    : '';
  return `<div class="hero-visual" data-visual="${esc(artwork.key)}"${imageStyle}>${heroImage?.dataUrl ? '' : artwork.svg}<div class="visual-caption"><span>${esc(spec.visualLabel)}</span><strong>${esc(spec.visualCaption)}</strong></div></div>`;
}

function header(facts) {
  const initials = facts.businessName.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  return `<div class="preview">SITEREVEAL PREVIEW · BUSINESS DETAILS MUST BE APPROVED BEFORE LAUNCH</div><header class="site-header wrap"><a class="brand" href="#top"><span class="brand-mark">${esc(initials || 'SR')}</span><span>${esc(facts.businessName)}</span></a><nav aria-label="Primary navigation"><a href="#services">Services</a><a href="#guide">Guide</a><a href="#contact">Contact</a></nav>${facts.phone ? `<a class="header-call" href="tel:${esc(facts.phone.replace(/[^\d+]/g, ''))}">${esc(facts.phone)}</a>` : ''}</header>`;
}

function heroCopy(facts, spec) {
  return `<div class="hero-copy"><div class="kicker">${[facts.category, facts.locationLabel].filter(Boolean).map(esc).join(' · ')}</div><h1>${esc(spec.headline)}</h1><p class="lede">${esc(spec.description)}</p><div class="actions">${contactLinks(facts)}<a class="button button-outline" href="#services">Explore details</a></div></div>`;
}

function contact(facts, spec) {
  return `<section class="contact-section" id="contact" data-layout="contact"><div class="wrap contact-shell"><div><div class="kicker">Contact ${esc(facts.businessName)}</div><h2>${esc(spec.contactTitle)}</h2><p>${esc(spec.contactIntro)}</p></div><div class="contact-actions">${contactLinks(facts, true)}</div></div></section>`;
}

function fieldEditorial(facts, spec, artwork, heroImage) {
  return `<main id="top" data-family-renderer="field-editorial">
    <section class="hero hero-editorial wrap" data-layout="split-hero">${heroCopy(facts, spec)}${visual(spec, artwork, heroImage)}</section>
    <aside class="proof-strip" data-layout="proof-strip"><div class="wrap proof-grid">${proofItems(spec)}</div></aside>
    <section class="section services-editorial" id="services" data-layout="service-ledger"><div class="wrap"><div class="section-head"><div><div class="kicker">Project capabilities</div><h2>${esc(spec.serviceSectionTitle)}</h2></div><p>${esc(spec.serviceSectionIntro)}</p></div><div class="service-ledger">${serviceItems(spec, 'ledger')}</div></div></section>
    <section class="signature signature-board" id="guide" data-layout="signature-board"><div class="wrap signature-grid"><div><div class="kicker">Business-specific guide</div><h2>${esc(spec.signatureModuleTitle)}</h2><p>${esc(spec.signatureModuleIntro)}</p></div><ol>${signatureItems(spec)}</ol></div></section>
    <section class="section process-editorial" data-layout="process-steps"><div class="wrap process-grid"><div><div class="kicker">A clearer starting point</div><h2>${esc(spec.processTitle)}</h2><p>${esc(spec.processIntro)}</p></div><div class="process-list">${processItems(spec)}</div></div></section>
    <section class="section trust-editorial" data-layout="trust-panels"><div class="wrap"><div class="section-head"><div><div class="kicker">Business information</div><h2>${esc(spec.trustSectionTitle)}</h2></div><p>${esc(spec.tagline)}</p></div><div class="trust-grid">${trustItems(spec)}</div></div></section>
    ${contact(facts, spec)}
  </main>`;
}

function heritageSpecialist(facts, spec, artwork, heroImage) {
  return `<main id="top" data-family-renderer="heritage-specialist">
    <section class="hero hero-heritage" data-layout="cinematic-hero"><div class="wrap heritage-copy">${heroCopy(facts, spec)}</div>${visual(spec, artwork, heroImage)}</section>
    <section class="section heritage-intro" data-layout="editorial-intro"><div class="wrap intro-grid"><div><div class="kicker">Specialist perspective</div><h2>${esc(spec.introTitle)}</h2></div><div><p class="large-copy">${esc(spec.introBody)}</p><div class="proof-grid compact">${proofItems(spec)}</div></div></div></section>
    <section class="section heritage-services" id="services" data-layout="numbered-catalog"><div class="wrap"><div class="section-head"><div><div class="kicker">Areas to discuss</div><h2>${esc(spec.serviceSectionTitle)}</h2></div><p>${esc(spec.serviceSectionIntro)}</p></div><div class="service-catalog">${serviceItems(spec, 'catalog')}</div></div></section>
    <section class="signature heritage-guide" id="guide" data-layout="two-panel-guide"><div class="wrap"><div class="guide-title"><div class="kicker">Specialist field guide</div><h2>${esc(spec.signatureModuleTitle)}</h2><p>${esc(spec.signatureModuleIntro)}</p></div><ol>${signatureItems(spec)}</ol></div></section>
    <section class="section heritage-process" data-layout="specialist-process"><div class="wrap"><div class="section-head"><div><div class="kicker">Prepare the conversation</div><h2>${esc(spec.processTitle)}</h2></div><p>${esc(spec.processIntro)}</p></div><div class="process-list horizontal">${processItems(spec)}</div></div></section>
    <section class="section heritage-trust" data-layout="trust-columns"><div class="wrap"><div class="section-head"><div><div class="kicker">What can be verified</div><h2>${esc(spec.trustSectionTitle)}</h2></div><p>${esc(spec.tagline)}</p></div><div class="trust-grid">${trustItems(spec)}</div></div></section>
    ${contact(facts, spec)}
  </main>`;
}

function premiumAppointment(facts, spec, artwork, heroImage) {
  return `<main id="top" data-family-renderer="premium-appointment">
    <section class="hero hero-premium" data-layout="centered-premium"><div class="wrap">${heroCopy(facts, spec)}${visual(spec, artwork, heroImage)}</div></section>
    <aside class="proof-strip premium-proof" data-layout="marquee-proof"><div class="wrap proof-grid">${proofItems(spec)}</div></aside>
    <section class="section premium-menu" id="services" data-layout="editorial-menu"><div class="wrap"><div class="section-head centered"><div><div class="kicker">Plan the experience</div><h2>${esc(spec.serviceSectionTitle)}</h2></div><p>${esc(spec.serviceSectionIntro)}</p></div><div class="service-menu">${serviceItems(spec, 'menu')}</div></div></section>
    <section class="signature premium-lookbook" id="guide" data-layout="lookbook"><div class="wrap"><div class="guide-title"><div class="kicker">Personal style brief</div><h2>${esc(spec.signatureModuleTitle)}</h2><p>${esc(spec.signatureModuleIntro)}</p></div><ol>${signatureItems(spec)}</ol></div></section>
    <section class="section premium-process" data-layout="appointment-journey"><div class="wrap"><div class="section-head"><div><div class="kicker">From idea to appointment</div><h2>${esc(spec.processTitle)}</h2></div><p>${esc(spec.processIntro)}</p></div><div class="process-list horizontal">${processItems(spec)}</div></div></section>
    <section class="section premium-trust" data-layout="trust-cards"><div class="wrap"><div class="section-head centered"><div><div class="kicker">Useful information</div><h2>${esc(spec.trustSectionTitle)}</h2></div><p>${esc(spec.tagline)}</p></div><div class="trust-grid">${trustItems(spec)}</div></div></section>
    ${contact(facts, spec)}
  </main>`;
}

function warmNeighborhood(facts, spec, artwork, heroImage) {
  return `<main id="top" data-family-renderer="warm-neighborhood">
    <section class="hero hero-warm" data-layout="friendly-hero"><div class="wrap warm-grid">${heroCopy(facts, spec)}${visual(spec, artwork, heroImage)}</div></section>
    <section class="section warm-welcome" data-layout="welcome-card"><div class="wrap intro-grid"><div><div class="kicker">Welcome in</div><h2>${esc(spec.introTitle)}</h2><p class="large-copy">${esc(spec.introBody)}</p></div><div class="address-card">${proofItems(spec)}</div></div></section>
    <section class="section warm-services" id="services" data-layout="service-cloud"><div class="wrap"><div class="section-head"><div><div class="kicker">Ways to get started</div><h2>${esc(spec.serviceSectionTitle)}</h2></div><p>${esc(spec.serviceSectionIntro)}</p></div><div class="service-cloud">${serviceItems(spec, 'cloud')}</div></div></section>
    <section class="section warm-journey" data-layout="neighborhood-journey"><div class="wrap"><div class="section-head"><div><div class="kicker">A comfortable first step</div><h2>${esc(spec.processTitle)}</h2></div><p>${esc(spec.processIntro)}</p></div><div class="process-list horizontal">${processItems(spec)}</div></div></section>
    <section class="signature warm-guide" id="guide" data-layout="postcard-guide"><div class="wrap signature-grid"><div><div class="kicker">Bring the right details</div><h2>${esc(spec.signatureModuleTitle)}</h2><p>${esc(spec.signatureModuleIntro)}</p></div><ol>${signatureItems(spec)}</ol></div></section>
    <section class="section warm-trust" data-layout="friendly-proof"><div class="wrap"><div class="section-head"><div><div class="kicker">Local information</div><h2>${esc(spec.trustSectionTitle)}</h2></div><p>${esc(spec.tagline)}</p></div><div class="trust-grid">${trustItems(spec)}</div></div></section>
    ${contact(facts, spec)}
  </main>`;
}

function technicalAuthority(facts, spec, artwork, heroImage) {
  return `<main id="top" data-family-renderer="technical-authority">
    <section class="hero hero-technical" data-layout="technical-dashboard"><div class="wrap technical-grid">${heroCopy(facts, spec)}${visual(spec, artwork, heroImage)}</div></section>
    <aside class="proof-strip technical-proof" data-layout="metric-strip"><div class="wrap proof-grid">${proofItems(spec)}</div></aside>
    <section class="section technical-services" id="services" data-layout="capability-matrix"><div class="wrap"><div class="section-head"><div><div class="kicker">Capability matrix</div><h2>${esc(spec.serviceSectionTitle)}</h2></div><p>${esc(spec.serviceSectionIntro)}</p></div><div class="service-matrix">${serviceItems(spec, 'matrix')}</div></div></section>
    <section class="signature technical-console" id="guide" data-layout="diagnostic-console"><div class="wrap signature-grid"><div><div class="kicker">Diagnostic starting point</div><h2>${esc(spec.signatureModuleTitle)}</h2><p>${esc(spec.signatureModuleIntro)}</p></div><ol>${signatureItems(spec)}</ol></div></section>
    <section class="section technical-process" data-layout="workflow-rail"><div class="wrap"><div class="section-head"><div><div class="kicker">Working sequence</div><h2>${esc(spec.processTitle)}</h2></div><p>${esc(spec.processIntro)}</p></div><div class="process-list horizontal">${processItems(spec)}</div></div></section>
    <section class="section technical-trust" data-layout="verification-grid"><div class="wrap"><div class="section-head"><div><div class="kicker">Verified signals</div><h2>${esc(spec.trustSectionTitle)}</h2></div><p>${esc(spec.tagline)}</p></div><div class="trust-grid">${trustItems(spec)}</div></div></section>
    ${contact(facts, spec)}
  </main>`;
}

function landscapeLocal(facts, spec, artwork, heroImage) {
  return `<main id="top" data-family-renderer="landscape-local">
    <section class="hero hero-landscape" data-layout="landscape-hero">${visual(spec, artwork, heroImage)}<div class="wrap landscape-copy">${heroCopy(facts, spec)}</div></section>
    <aside class="proof-strip landscape-proof" data-layout="property-proof"><div class="wrap proof-grid">${proofItems(spec)}</div></aside>
    <section class="section landscape-services" id="services" data-layout="property-services"><div class="wrap"><div class="section-head"><div><div class="kicker">Property priorities</div><h2>${esc(spec.serviceSectionTitle)}</h2></div><p>${esc(spec.serviceSectionIntro)}</p></div><div class="service-grid">${serviceItems(spec, 'property')}</div></div></section>
    <section class="signature property-map" id="guide" data-layout="property-map"><div class="wrap signature-grid"><div><div class="kicker">Walk the whole property</div><h2>${esc(spec.signatureModuleTitle)}</h2><p>${esc(spec.signatureModuleIntro)}</p></div><ol>${signatureItems(spec)}</ol></div></section>
    <section class="section seasonal-process" data-layout="seasonal-timeline"><div class="wrap"><div class="section-head"><div><div class="kicker">Plan the work</div><h2>${esc(spec.processTitle)}</h2></div><p>${esc(spec.processIntro)}</p></div><div class="process-list horizontal">${processItems(spec)}</div></div></section>
    <section class="section landscape-trust" data-layout="local-trust"><div class="wrap"><div class="section-head"><div><div class="kicker">Local information</div><h2>${esc(spec.trustSectionTitle)}</h2></div><p>${esc(spec.tagline)}</p></div><div class="trust-grid">${trustItems(spec)}</div></div></section>
    ${contact(facts, spec)}
  </main>`;
}

const RENDERERS = {
  'Field-service editorial': fieldEditorial,
  'Heritage specialist': heritageSpecialist,
  'Premium appointment/service': premiumAppointment,
  'Warm neighborhood business': warmNeighborhood,
  'Technical/trades authority': technicalAuthority,
  'Landscape-led local service': landscapeLocal
};

function styles(spec) {
  return `<style>
    :root{--ink:#0a1511;--paper:#f5f2e9;--white:#fff;--primary:${esc(spec.primaryColor)};--secondary:${esc(spec.secondaryColor)};--line:#d9ddd7;--muted:#53605b;--radius:28px}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.55 Arial,sans-serif}a{color:inherit}.wrap{width:min(1180px,calc(100% - 40px));margin:auto}.preview{padding:10px 18px;text-align:center;background:#0a1511;color:#fff;font-size:12px;font-weight:900;letter-spacing:.09em}.site-header{min-height:92px;display:flex;align-items:center;gap:28px}.brand{display:flex;align-items:center;gap:12px;text-decoration:none;font-weight:900;font-size:18px}.brand-mark{width:50px;height:50px;border-radius:14px;display:grid;place-items:center;background:var(--primary);color:#fff}.site-header nav{margin-left:auto;display:flex;gap:22px}.header-call{padding:12px 18px;border-radius:999px;background:var(--ink);color:#fff;text-decoration:none;font-weight:800}
    .hero{position:relative;overflow:hidden}.hero-copy{position:relative;z-index:2}.kicker{color:var(--primary);font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.hero h1{font-size:clamp(54px,7vw,104px);line-height:.88;letter-spacing:-.06em;margin:24px 0;max-width:11ch}.lede{font-size:clamp(18px,2vw,25px);color:var(--muted);max-width:650px}.actions,.contact-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.button{display:inline-flex;align-items:center;justify-content:center;padding:13px 20px;border-radius:999px;background:var(--ink);color:#fff;text-decoration:none;font-weight:850;border:1px solid var(--ink)}.button-outline{background:transparent;color:var(--ink)}.button-light{background:#fff;color:var(--ink);border-color:#fff}.hero-visual{position:relative;min-height:520px;background:linear-gradient(145deg,var(--primary),var(--secondary));background-size:cover;background-position:center;overflow:hidden}.hero-visual svg{position:absolute;inset:0;width:100%;height:100%;opacity:.65}.visual-caption{position:absolute;left:26px;right:26px;bottom:26px;padding:18px 20px;background:#07130dd9;color:#fff;border-radius:16px;display:grid;gap:3px}.visual-caption span{font-size:11px;letter-spacing:.15em;text-transform:uppercase}.visual-caption strong{font-size:18px}.section{padding:105px 0}.section-head{display:grid;grid-template-columns:1.15fr .85fr;gap:60px;align-items:end;margin-bottom:46px}.section-head.centered{display:block;text-align:center}.section-head.centered p{max-width:650px;margin:18px auto 0}.section h2,.signature h2,.contact-section h2,.heritage-intro h2{font-size:clamp(42px,5.8vw,76px);line-height:.95;letter-spacing:-.05em;margin:12px 0}.section-head p,.large-copy,.signature p{font-size:18px;color:var(--muted)}
    .proof-strip{background:var(--ink);color:#fff}.proof-grid{display:grid;grid-template-columns:repeat(3,1fr)}.proof-item{padding:26px;border-right:1px solid #ffffff24;display:grid;gap:5px}.proof-item:last-child{border:0}.proof-item strong{font-size:17px}.proof-item span{color:#c8d2ce;font-size:14px}.service-ledger,.service-catalog,.service-menu,.service-matrix,.service-grid{display:grid;grid-template-columns:repeat(2,1fr);border-top:1px solid var(--line)}.service-item{display:grid;grid-template-columns:56px 1fr;gap:16px;padding:28px 20px;border-bottom:1px solid var(--line)}.service-item:nth-child(odd){border-right:1px solid var(--line)}.number{color:var(--primary)}.service-item h3,.trust-item h3,.process-step h3{font-size:21px;margin:0 0 8px}.service-item p,.trust-item p,.process-step p{margin:0;color:var(--muted)}
    .signature{padding:100px 0;background:var(--ink);color:#fff}.signature-grid,.heritage-guide .wrap,.premium-lookbook .wrap{display:grid;grid-template-columns:.85fr 1.15fr;gap:70px;align-items:start}.signature .kicker{color:#79a8ff}.signature p{color:#c8d2ce}.signature ol{list-style:none;margin:0;padding:0;display:grid;gap:12px}.signature li{display:grid;grid-template-columns:46px 1fr;align-items:center;padding:18px;border:1px solid #ffffff24;border-radius:15px;background:#ffffff08}.signature li b{color:#79a8ff}.trust-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.trust-item{padding:30px;border:1px solid var(--line);border-radius:20px;background:#fff}.trust-item>b{color:var(--primary)}.process-grid,.intro-grid{display:grid;grid-template-columns:.85fr 1.15fr;gap:80px}.process-list{display:grid;gap:12px}.process-list.horizontal{grid-template-columns:repeat(4,1fr)}.process-step{display:grid;grid-template-columns:48px 1fr;gap:10px;padding:22px;border-top:2px solid var(--primary)}.process-list.horizontal .process-step{display:block}.process-step>b{color:var(--primary)}.contact-section{padding:90px 0;background:var(--primary);color:#fff}.contact-shell{display:grid;grid-template-columns:1fr auto;align-items:center;gap:50px}.contact-shell p{font-size:18px}.contact-actions{justify-content:flex-end}
    .hero-editorial{display:grid;grid-template-columns:.85fr 1.15fr;min-height:690px;border:1px solid var(--line);border-radius:var(--radius);background:#fff}.hero-editorial .hero-copy{padding:70px}.hero-editorial .hero-visual{order:-1}.signature-board{background:#0a1511}.process-editorial{background:#fff}
    .hero-heritage{min-height:760px;background:var(--ink);color:#fff}.hero-heritage h1,.heritage-intro h2,.heritage-guide h2{font-family:Georgia,serif;letter-spacing:-.045em}.hero-heritage .hero-visual{position:absolute;inset:0;opacity:.65}.heritage-copy{min-height:760px;display:flex;align-items:center}.hero-heritage .hero-copy{padding:80px 0;max-width:720px}.hero-heritage .lede{color:#e5ebe8}.heritage-intro{background:#fff}.compact .proof-item{color:var(--ink);border-color:var(--line)}.compact .proof-item span{color:var(--muted)}.service-catalog{grid-template-columns:1fr}.service-catalog .service-item{grid-template-columns:90px 1fr;border-right:0}.heritage-guide{background:#34261d}.heritage-trust{background:#efe6d7}
    .hero-premium{padding:70px 0 0;text-align:center;background:#f6ecf0}.hero-premium h1,.premium-menu h2,.premium-lookbook h2{font-family:Georgia,serif;letter-spacing:-.04em}.hero-premium .hero-copy{max-width:900px;margin:auto}.hero-premium h1{max-width:12ch;margin-left:auto;margin-right:auto}.hero-premium .lede{margin-left:auto;margin-right:auto}.hero-premium .actions{justify-content:center}.hero-premium .hero-visual{margin-top:55px;border-radius:160px 160px 0 0}.premium-proof{background:#4b253a}.service-menu{grid-template-columns:1fr}.service-menu .service-item{grid-template-columns:80px 1fr;border-right:0}.premium-lookbook{background:#4b253a}.premium-lookbook ol{grid-template-columns:repeat(2,1fr)}.premium-process{background:#fff}
    .hero-warm{padding:60px 0 90px;background:#fff0dc}.warm-grid{display:grid;grid-template-columns:1fr .85fr;gap:70px;align-items:center}.hero-warm h1{font-family:Georgia,serif;letter-spacing:-.045em}.hero-warm .hero-visual{border-radius:44% 56% 60% 40% / 45% 40% 60% 55%}.address-card{padding:32px;background:#fff;border-radius:24px;box-shadow:0 16px 50px #452b1512}.address-card .proof-item{color:var(--ink);border-color:var(--line)}.address-card .proof-item span{color:var(--muted)}.service-cloud{display:flex;flex-wrap:wrap;gap:16px}.service-cloud .service-item{display:block;flex:1 1 260px;border:1px solid var(--line);border-radius:28px;background:#fff}.warm-journey{background:#fff}.warm-guide{background:#234c3d;border-radius:70px 70px 0 0}
    .hero-technical{padding:65px 0;background:#07141d;color:#fff}.technical-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}.hero-technical .lede{color:#b8c9d2}.hero-technical .hero-visual{border:1px solid #ffffff2b;background-color:#07141d;background-image:linear-gradient(#ffffff12 1px,transparent 1px),linear-gradient(90deg,#ffffff12 1px,transparent 1px);background-size:34px 34px}.technical-proof{background:#102d3d}.service-matrix{gap:12px;border:0}.service-matrix .service-item{border:1px solid var(--line);background:#fff}.technical-console{background:#07141d}.technical-process{background:#e8f0f3}
    .hero-landscape{min-height:760px;color:#fff;background:#173e2b}.hero-landscape .hero-visual{position:absolute;inset:0;min-height:760px}.landscape-copy{min-height:760px;display:flex;align-items:flex-end;padding-bottom:80px}.hero-landscape .hero-copy{max-width:760px;padding:48px;background:#10261ed9;border-radius:28px}.hero-landscape .lede{color:#e1e9e4}.landscape-proof{background:#173e2b}.service-grid{gap:16px;border:0}.service-grid .service-item{border:1px solid var(--line);border-radius:24px;background:#fff}.property-map{background:#173e2b}.property-map ol{grid-template-columns:repeat(2,1fr)}.seasonal-process{background:#e7eddf}
    footer{padding:38px 0;color:#5c6863;font-size:13px}
    @media(max-width:850px){.site-header nav{display:none}.header-call{margin-left:auto}.hero-editorial,.warm-grid,.technical-grid,.section-head,.signature-grid,.heritage-guide .wrap,.premium-lookbook .wrap,.process-grid,.intro-grid,.contact-shell{grid-template-columns:1fr}.hero-editorial .hero-visual{order:0}.hero h1{font-size:clamp(46px,13vw,66px);max-width:100%}.hero-copy,.hero-editorial .hero-copy{padding:42px 28px}.hero-visual{min-height:420px}.proof-grid,.trust-grid,.process-list.horizontal{grid-template-columns:1fr}.proof-item{border-right:0;border-bottom:1px solid #ffffff24}.service-ledger,.service-catalog,.service-menu,.service-matrix,.service-grid{grid-template-columns:1fr}.service-item:nth-child(odd){border-right:0}.section{padding:72px 0}.signature{padding:72px 0}.contact-actions{justify-content:flex-start}.premium-lookbook ol,.property-map ol{grid-template-columns:1fr}.hero-heritage,.heritage-copy,.hero-landscape,.landscape-copy{min-height:650px}.hero-premium .hero-visual{border-radius:70px 70px 0 0}}
  </style>`;
}

function renderCatalogSite(facts, spec, artwork, heroImage) {
  const renderer = RENDERERS[spec.designFamily] || fieldEditorial;
  const familySlug = FAMILY_SLUGS[spec.designFamily] || FAMILY_SLUGS['Field-service editorial'];
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(facts.businessName)} | SiteReveal Preview</title><meta name="description" content="${esc(spec.description)}">${styles(spec)}</head><body class="family-${familySlug}">${header(facts)}${renderer(facts, spec, artwork, heroImage)}<footer class="wrap">Independent SiteReveal preview for ${esc(facts.businessName)}. Not the official business website unless purchased and approved by the owner.</footer></body></html>`;
}

module.exports = { FAMILY_SLUGS, renderCatalogSite };
