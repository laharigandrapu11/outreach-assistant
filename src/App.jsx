import { useState } from 'react'
import JobInput from './components/JobInput'
import JobAnalysis from './components/JobAnalysis'
import RecruiterSearch from './components/RecruiterSearch'
import MessageComposer from './components/MessageComposer'
import './App.css'

const getApiBase = () => {
  if (import.meta.env.DEV) return ''
  return ''
}

export default function App() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [jobData, setJobData] = useState(null)
  const [recruiterData, setRecruiterData] = useState(null)

  const handleAnalyze = async (url, pastedText) => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${getApiBase()}/api/analyze-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url || undefined, pastedText: pastedText || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setJobData(data)
      setRecruiterData(null)
      setStep(2)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFindRecruiter = async () => {
    if (!jobData) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${getApiBase()}/api/find-recruiter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: jobData.companyName,
          role: jobData.role,
          location: jobData.location,
          recruiterSearchQuery: jobData.recruiterSearchQuery,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Search failed')
      setRecruiterData(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const goToMessage = () => setStep(3)

  return (
    <div className="app">
      <header className="header">
        <h1>Outreach Assistant</h1>
        <p>Paste a job link or description → find the recruiter → get a personalised message</p>
      </header>

      {error && (
        <div className="banner error">
          {error}
        </div>
      )}

      <main className="main">
        {step === 1 && (
          <JobInput onAnalyze={handleAnalyze} loading={loading} />
        )}

        {step === 2 && jobData && (
          <>
            <JobAnalysis
              jobData={jobData}
              onFindRecruiter={handleFindRecruiter}
              recruiterData={recruiterData}
              loading={loading}
              onNext={goToMessage}
            />
            <button type="button" className="btn secondary" onClick={() => setStep(1)}>
              ← Back
            </button>
          </>
        )}

        {step === 3 && jobData && (
          <>
            <MessageComposer jobData={jobData} recruiterData={recruiterData} />
            <button type="button" className="btn secondary" onClick={() => setStep(2)}>
              ← Back
            </button>
          </>
        )}
      </main>
    </div>
  )
}
