# Outreach Assistant 
Link: https://outreach-assistant-rpeem2wtm-laharis-projects-8fbd7e71.vercel.app/


Get the recruiter or hiring manager for a job posting and draft a personalised outreach message.

- **Paste a job URL or description** → extract company, role, and any contact mentioned in the JD.
- **Find recruiter** → get LinkedIn/Google search links (and optional Serper results) for “hiring manager + company”.
- **Generate message** → Claude writes a short, personalised outreach you can copy.

## Tech stack

- **Frontend:** React (Vite) + CSS
- **Backend:** Vercel serverless functions (`/api/*`)
- **AI:** Claude API (Anthropic)

## Local development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and set:

   - `ANTHROPIC_API_KEY` (required) – from [Anthropic Console](https://console.anthropic.com/)
   - `SERPER_API_KEY` (optional) – from [Serper](https://serper.dev) for in-app Google search results

3. **Run with Vercel CLI (recommended)**

   This runs both the React app and the API routes locally:

   ```bash
   npx vercel dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

   Alternatively, run only the frontend (`npm run dev`) and point it at a deployed API by setting `VITE_API_BASE` or your deployed URL.

## Deploy to Vercel

1. Push the repo to GitHub (or connect another Git provider in Vercel).
2. In [Vercel](https://vercel.com): **New Project** → import this repo.
3. Add environment variables in the project settings:
   - `ANTHROPIC_API_KEY` (required)
   - `SERPER_API_KEY` (optional)
4. Deploy. The app and `/api/*` routes will be served from one Vercel project.

## API routes

| Route | Method | Purpose |
|-------|--------|--------|
| `/api/analyze-job` | POST | Fetch job page (via Jina Reader if URL) and use Claude to extract company, role, contact, and recruiter search query. |
| `/api/find-recruiter` | POST | Return LinkedIn/Google search links; if `SERPER_API_KEY` is set, also return Serper search results. |
| `/api/generate-outreach` | POST | Generate a short outreach message with Claude from job + optional recruiter/your info. |

## Project structure

```
├── api/
│   ├── analyze-job.js      # Job URL/text → Claude extraction
│   ├── find-recruiter.js    # Suggested search links + optional Serper
│   └── generate-outreach.js # Claude outreach draft
├── src/
│   ├── components/
│   │   ├── JobInput.jsx
│   │   ├── JobAnalysis.jsx
│   │   ├── RecruiterSearch.jsx
│   │   └── MessageComposer.jsx
│   ├── App.jsx
│   ├── App.css
│   └── index.css
├── index.html
├── package.json
├── vercel.json
└── README.md
```
