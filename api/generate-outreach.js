import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'ANTHROPIC_API_KEY is not set. Add it to .env.local and restart `vercel dev`.',
      });
    }

    const anthropic = new Anthropic({ apiKey });
    const { companyName, role, oneLiner, recruiterName, hiringManagerName, recruiterInfo, yourName, yourBackground } = req.body || {};
    const contactName = recruiterName || hiringManagerName || recruiterInfo || 'Hiring Manager';

    const prompt = `You are an expert at writing short, professional outreach messages for job applicants to recruiters or hiring managers. Write a single personalized outreach message (for LinkedIn or email) that:
- Is concise (under 150 words)
- Addresses the recipient by name if we have it (${contactName}), otherwise use "Hi" or "Hello"
- Mentions the specific role and company: ${role} at ${companyName}
- Briefly includes why the candidate is interested (use this one-liner about the role if provided: ${oneLiner || 'relevant opportunity'})
- Optionally one line about the candidate's background if provided: ${yourBackground || 'N/A'}
- Ends with a clear, polite ask (e.g. happy to chat, share more, etc.)
- Sounds human and warm, not template-like

${yourName ? `Sign the message as ${yourName}.` : 'Do not add a sign-off name unless the user provided one.'}

Return only the outreach message text, no subject line unless asked, no labels like "Message:".`;

    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content?.[0]?.type === 'text' ? message.content[0].text : '';
    const outreach = text.trim();

    return res.status(200).json({ outreach });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Failed to generate outreach message' });
  }
}
