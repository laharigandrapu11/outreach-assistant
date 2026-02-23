export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { companyName, location, recruiterSearchQuery } = req.body || {};
    const companyAndLocation = [companyName, location].filter(Boolean).join(' ').trim() || 'company';
    const recruiterQuery = recruiterSearchQuery?.trim()?.includes('recruiter')
      ? recruiterSearchQuery.trim()
      : `recruiter ${companyAndLocation}`;
    const hiringManagerQuery = `hiring manager ${companyAndLocation}`;

    const buildLinks = (query) => {
      const encoded = encodeURIComponent(query);
      return [
        { label: 'LinkedIn', url: `https://www.linkedin.com/search/results/people/?keywords=${encoded}` },
        { label: 'Google', url: `https://www.google.com/search?q=${encoded}` },
      ];
    };

    const suggestedSearches = [
      { type: 'recruiter', query: recruiterQuery, links: buildLinks(recruiterQuery) },
      { type: 'hiring manager', query: hiringManagerQuery, links: buildLinks(hiringManagerQuery) },
    ];

    let searchResults = [];
    let profileList = [];

    if (process.env.SERPER_API_KEY) {
      try {
        const [recruiterRes, hiringRes, linkedInRes] = await Promise.all([
          fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: recruiterQuery, num: 5 }),
          }),
          fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: hiringManagerQuery, num: 5 }),
          }),
          fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              q: `site:linkedin.com/in ${recruiterQuery}`,
              num: 10,
            }),
          }),
        ]);

        const [recruiterData, hiringData, linkedInData] = await Promise.all([
          recruiterRes.json(),
          hiringRes.json(),
          linkedInRes.json(),
        ]);

        const organic = [
          ...(recruiterData.organic || []),
          ...(hiringData.organic || []),
        ];
        const seen = new Set();
        searchResults = organic
          .filter((o) => o.link && !seen.has(o.link) && (seen.add(o.link), true))
          .slice(0, 10)
          .map((o) => ({ title: o.title, link: o.link, snippet: o.snippet }));

        const linkedInOrganic = linkedInData.organic || [];
        profileList = linkedInOrganic
          .filter((o) => o.link && /linkedin\.com\/in\//i.test(o.link))
          .slice(0, 10)
          .map((o) => ({ title: o.title, link: o.link }));
      } catch (_) {
        // fallback to suggested links only
      }
    }

    return res.status(200).json({
      suggestedSearches,
      searchResults,
      profileList,
      recruiterQuery,
      hiringManagerQuery,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Failed to find recruiter links' });
  }
}
