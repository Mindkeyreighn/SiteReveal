'use strict';

const { verifyAdmin, sendJson } = require('./_lib/admin');
const { getLead, insertJob, updateJob, updateLead } = require('./_lib/supabase');
const { createSiteSpec, renderSite, runQa } = require('./_lib/site-generator');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  let job;
  let lead;
  try {
    if (!process.env.OPENAI_API_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return sendJson(res, 503, {
        error: 'Site generation is not configured yet.',
        setupRequired: true,
        missing: [
          !process.env.OPENAI_API_KEY && 'OPENAI_API_KEY',
          !process.env.SUPABASE_SERVICE_ROLE_KEY && 'SUPABASE_SERVICE_ROLE_KEY'
        ].filter(Boolean)
      });
    }

    const user = await verifyAdmin(req);
    if (!user) return sendJson(res, 401, { error: 'Admin authentication is required.' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const leadId = String(body.leadId || '').trim();
    const reviewNotes = String(body.reviewNotes || '').trim().slice(0, 600);
    if (!/^[0-9a-f-]{36}$/i.test(leadId)) {
      return sendJson(res, 400, { error: 'A valid lead ID is required.' });
    }

    lead = await getLead(leadId);
    if (!lead) return sendJson(res, 404, { error: 'Lead not found.' });
    if (lead.verification !== 'Verified') {
      return sendJson(res, 409, { error: 'Verify this lead before generating a website.' });
    }
    if (lead.published) {
      return sendJson(res, 409, { error: 'This lead is already public. Unpublish it before generating a replacement draft.' });
    }

    job = await insertJob({
      lead_id: lead.id,
      status: 'generating',
      model: process.env.OPENAI_MODEL || 'gpt-5.6',
      created_by: user.id
    });

    await updateLead(lead.id, {
      generation_status: 'generating',
      generation_attempts: Number(lead.generation_attempts || 0) + 1,
      latest_generation_id: job.id
    });

    const { spec, model, responseId } = await createSiteSpec(lead, reviewNotes);
    const html = renderSite(lead, spec);
    const qa = runQa(lead, spec, html);

    const savedJob = await updateJob(job.id, {
      status: 'review_ready',
      model,
      design_family: spec.designFamily,
      site_spec: { ...spec, openaiResponseId: responseId, reviewRequestNotes: reviewNotes },
      generated_html: html,
      qa_results: qa,
      error_message: null
    });

    await updateLead(lead.id, {
      generation_status: 'review_ready',
      stage: 'Site Review',
      latest_generation_id: job.id,
      published: false
    });

    return sendJson(res, 200, {
      job: {
        id: savedJob.id,
        status: savedJob.status,
        model: savedJob.model,
        designFamily: savedJob.design_family,
        createdAt: savedJob.created_at
      },
      spec,
      qa,
      html,
      publicationBlocked: true
    });
  } catch (error) {
    console.error('Site generation failed', error?.message || error);
    if (job?.id) {
      try {
        await updateJob(job.id, {
          status: 'failed',
          error_message: String(error?.message || 'Unknown generation error').slice(0, 1000)
        });
        if (lead?.id) await updateLead(lead.id, { generation_status: 'failed' });
      } catch (saveError) {
        console.error('Could not record generation failure', saveError?.message || saveError);
      }
    }
    return sendJson(res, 500, { error: error?.message || 'The website draft could not be generated.' });
  }
};
