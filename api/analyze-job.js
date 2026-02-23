import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const JINA_READER = 'https://r.jina.ai/';

async function fetchJobContent(url) {
  const res = await fetch(JINA_READER + url, {
    headers: { 'X-Return-Format': 'text' },
  });
  if (!res.ok) throw new Error('Could not fetch job posting');
  return res.text();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, pastedText } = req.body || {};
    let jobText = pastedText && pastedText.trim() ? pastedText.trim() : null;

    if (!jobText && url && url.trim()) {
      jobText = await fetchJobContent(url.trim());
    }

    if (!jobText) {
      return res.status(400).json({ error: 'Provide either a job posting URL or pasted job description text.' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'ANTHROPIC_API_KEY is not set. Add it to .env.local and restart `vercel dev`.',
      });
    }

    const anthropic = new Anthropic({ apiKey });

    const prompt = `You are an expert at parsing job postings. Given the following job posting content, extract and return a JSON object with exactly these keys (use null when not found):
- companyName: string (the company or employer name only, e.g. "Nirmata")
- role: string (job title only, e.g. "Staff Software Engineer")
- location: string or null (primary hiring location: one city or region, e.g. "Toronto" or "Bangalore" or "Remote". If multiple locations, pick the first or most prominent one. Do not concatenate multiple cities.)
- recruiterName: string or null (if explicitly mentioned, e.g. "Contact: Jane" or "Reach out to John")
- hiringManagerName: string or null (if explicitly mentioned)
- recruiterSearchQuery: string (MUST be a short, clean search query for LinkedIn/Google to find the recruiter or hiring manager. Use ONLY company name and optionally one location. Format: "recruiter [CompanyName]" or "hiring manager [CompanyName] [Location]". Examples: "recruiter Nirmata", "hiring manager Nirmata Toronto", "recruiter Stripe San Francisco". Do NOT include the job title, multiple locations, or long phrases. Keep it under 6 words.)
- oneLiner: string (one sentence summary of the role for outreach)

Job posting content:
---
${jobText.slice(0, 28000)}
---

Return only valid JSON, no markdown or extra text.`;

    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content?.[0]?.type === 'text' ? message.content[0].text : '';
    let parsed = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (_) {
      parsed = { companyName: null, role: null, location: null, recruiterSearchQuery: 'hiring manager company' };
    }

    const company = parsed.companyName ?? null;
    const location = parsed.location ?? null;
    let searchQuery = parsed.recruiterSearchQuery?.trim();
    const cleanQuery = [company, location].filter(Boolean).join(' ');
    if (!searchQuery || searchQuery.split(/\s+/).length > 8 || (company && !searchQuery.toLowerCase().includes(company.toLowerCase()))) {
      searchQuery = cleanQuery ? `recruiter ${cleanQuery}` : `hiring manager ${company || 'company'}`;
    }

    return res.status(200).json({
      companyName: company,
      role: parsed.role ?? null,
      location,
      recruiterName: parsed.recruiterName ?? null,
      hiringManagerName: parsed.hiringManagerName ?? null,
      recruiterSearchQuery: searchQuery,
      oneLiner: parsed.oneLiner ?? null,
      rawSnippet: jobText.slice(0, 1500),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Failed to analyze job posting' });
  }
}
