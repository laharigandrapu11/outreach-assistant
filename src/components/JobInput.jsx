import { useState } from 'react'

export default function JobInput({ onAnalyze, loading }) {
  const [url, setUrl] = useState('')
  const [pastedText, setPastedText] = useState('')
  const [usePaste, setUsePaste] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (usePaste) {
      onAnalyze(null, pastedText)
    } else {
      onAnalyze(url, null)
    }
  }

  const canSubmit = usePaste ? pastedText.trim().length > 50 : url.trim().length > 0

  return (
    <div className="card">
      <h2>Job posting</h2>
      <form onSubmit={handleSubmit}>
        <label className="flex" style={{ marginBottom: '0.75rem' }}>
          <input
            type="radio"
            checked={!usePaste}
            onChange={() => setUsePaste(false)}
          />
          <span>Job posting URL</span>
        </label>
        {!usePaste && (
          <input
            type="url"
            className="input"
            placeholder="https://linkedin.com/jobs/... or any job link"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        )}

        <label className="flex mt-2" style={{ marginTop: '1rem' }}>
          <input
            type="radio"
            checked={usePaste}
            onChange={() => setUsePaste(true)}
          />
          <span>Paste job description</span>
        </label>
        {usePaste && (
          <textarea
            className="textarea mt-1"
            placeholder="Paste the full job description here (at least a few lines)..."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            disabled={loading}
          />
        )}

        <div className="mt-2">
          <button type="submit" className="btn primary" disabled={!canSubmit || loading}>
            {loading ? (
              <span className="flex">
                <span className="spinner" /> Analyzing…
              </span>
            ) : (
              'Analyze job'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
