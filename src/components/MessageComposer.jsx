import { useState } from 'react'

export default function MessageComposer({ jobData, recruiterData }) {
  const [outreach, setOutreach] = useState('')
  const [loading, setLoading] = useState(false)
  const [yourName, setYourName] = useState('')
  const [yourBackground, setYourBackground] = useState('')
  const [copied, setCopied] = useState(false)

  const contactName = jobData.recruiterName || jobData.hiringManagerName || 'Hiring Manager'

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/generate-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: jobData.companyName,
          role: jobData.role,
          oneLiner: jobData.oneLiner,
          recruiterName: jobData.recruiterName,
          hiringManagerName: jobData.hiringManagerName,
          recruiterInfo: contactName,
          yourName: yourName.trim() || undefined,
          yourBackground: yourBackground.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setOutreach(data.outreach || '')
    } catch (e) {
      setOutreach('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outreach).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="card">
      <h2>Personalised outreach message</h2>
      <p className="mb-1">
        Role: <strong>{jobData.role}</strong> at <strong>{jobData.companyName}</strong>
        {contactName && <> · Contact: {contactName}</>}
      </p>

      <label className="label">Your name (optional)</label>
      <input
        type="text"
        className="input mb-1"
        placeholder="e.g. Alex"
        value={yourName}
        onChange={(e) => setYourName(e.target.value)}
      />

      <label className="label">One line about you (optional)</label>
      <input
        type="text"
        className="input mb-1"
        placeholder="e.g. 5 years in product, ex-FAANG"
        value={yourBackground}
        onChange={(e) => setYourBackground(e.target.value)}
      />

      <button
        type="button"
        className="btn primary mt-1"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <span className="flex">
            <span className="spinner" /> Generating…
          </span>
        ) : (
          'Generate message'
        )}
      </button>

      {outreach && (
        <div className="mt-2">
          <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="label">Message</span>
            <button type="button" className="btn secondary" onClick={copyToClipboard}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="outreach-text">{outreach}</div>
        </div>
      )}
    </div>
  )
}
