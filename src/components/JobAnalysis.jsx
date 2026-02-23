import RecruiterSearch from './RecruiterSearch'

export default function JobAnalysis({ jobData, onFindRecruiter, recruiterData, loading, onNext }) {
  const hasContact = jobData.recruiterName || jobData.hiringManagerName

  return (
    <>
      <div className="card">
        <h2>Extracted from job posting</h2>
        <p><strong>Company:</strong> {jobData.companyName || '—'}</p>
        <p><strong>Role:</strong> {jobData.role || '—'}</p>
        {hasContact && (
          <p>
            <strong>Contact in JD:</strong>{' '}
            {[jobData.recruiterName, jobData.hiringManagerName].filter(Boolean).join(' or ')}
          </p>
        )}
        {jobData.oneLiner && (
          <p className="mt-1"><strong>Summary:</strong> {jobData.oneLiner}</p>
        )}
      </div>

      <RecruiterSearch
        jobData={jobData}
        onFindRecruiter={onFindRecruiter}
        recruiterData={recruiterData}
        loading={loading}
      />

      <button type="button" className="btn primary" onClick={onNext}>
        Continue to write outreach message →
      </button>
    </>
  )
}
