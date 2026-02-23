export default function RecruiterSearch({ jobData, onFindRecruiter, recruiterData, loading }) {
  return (
    <div className="card">
      <h2>Find recruiter / hiring manager</h2>
      <p className="mb-1">
        {jobData.recruiterName || jobData.hiringManagerName
          ? 'A contact was found in the JD. You can still search for more options:'
          : 'No contact was found in the job description. Search LinkedIn or Google:'}
      </p>
      <p className="mb-1" style={{ fontSize: '0.9rem', color: '#64748b' }}>
        Suggested query: <strong>{jobData.recruiterSearchQuery}</strong>
      </p>
      <button
        type="button"
        className="btn secondary mt-1"
        onClick={onFindRecruiter}
        disabled={loading}
      >
        {loading ? (
          <span className="flex">
            <span className="spinner" /> Searching…
          </span>
        ) : (
          'Get search links'
        )}
      </button>

      {recruiterData && (
        <div className="mt-2">
          {recruiterData.suggestedSearches?.map((group) => (
            <div key={group.type} className="mt-2">
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                {group.type === 'recruiter' ? 'Recruiter' : 'Hiring manager'} — Open in browser
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.35rem' }}>
                “{group.type === 'recruiter' ? recruiterData.recruiterQuery : recruiterData.hiringManagerQuery}”
              </p>
              <ul className="link-list">
                {group.links.map((s) => (
                  <li key={s.label}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {recruiterData.profileList?.length > 0 && (
            <div className="mt-2">
              <h3 style={{ fontSize: '0.95rem', margin: '1rem 0 0.5rem' }}>
                LinkedIn profiles (from search)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                Profiles that match your query (from Google search).
              </p>
              <ul className="link-list profile-list">
                {recruiterData.profileList.map((p, i) => (
                  <li key={i}>
                    <a href={p.link} target="_blank" rel="noopener noreferrer">
                      {p.title || p.link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recruiterData.searchResults?.length > 0 && recruiterData.profileList?.length === 0 && (
            <div className="mt-2">
              <h3 style={{ fontSize: '0.95rem', margin: '1rem 0 0.5rem' }}>Search results</h3>
              {recruiterData.searchResults.map((r, i) => (
                <div key={i} className="search-result">
                  <a href={r.link} target="_blank" rel="noopener noreferrer">{r.title}</a>
                  {r.snippet && <div className="snippet">{r.snippet}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
