'use client'

import { useState } from 'react'

const ENDPOINTS = [
  {
    id: 'auth',
    label: 'Authenticate',
    method: 'POST',
    path: '/v2/auth/token',
    body: JSON.stringify({ username: '', password: '' }, null, 2),
    description: 'Get an access token using your merchant credentials.',
  },
  {
    id: 'create-invoice',
    label: 'Create Invoice',
    method: 'POST',
    path: '/v2/invoice',
    body: JSON.stringify(
      {
        invoice_code: '',
        sender_invoice_no: 'TEST-001',
        invoice_receiver_code: '',
        invoice_description: 'Test payment',
        amount: 100,
        callback_url: 'https://example.com/webhook',
      },
      null,
      2
    ),
    description: 'Create a new payment invoice. Returns a QR code and bank deep links.',
  },
  {
    id: 'check-payment',
    label: 'Check Payment',
    method: 'POST',
    path: '/v2/payment/check',
    body: JSON.stringify(
      { object_type: 'INVOICE', object_id: '' },
      null,
      2
    ),
    description: 'Check payment status for an invoice.',
  },
  {
    id: 'get-invoice',
    label: 'Get Invoice',
    method: 'GET',
    path: '/v2/invoice/{invoice_id}',
    body: '',
    description: 'Get details of an existing invoice by ID.',
  },
  {
    id: 'cancel-invoice',
    label: 'Cancel Invoice',
    method: 'DELETE',
    path: '/v2/invoice/{invoice_id}',
    body: '',
    description: 'Cancel an unpaid invoice.',
  },
]

const ENVS = [
  { label: 'Sandbox', url: 'https://merchant-sandbox.qpay.mn' },
  { label: 'Production', url: 'https://merchant.qpay.mn' },
]

const cardStyle: React.CSSProperties = {
  borderRadius: '0.75rem',
  border: '1px solid color-mix(in srgb, currentColor 15%, transparent)',
  background: 'color-mix(in srgb, currentColor 5%, transparent)',
  overflow: 'hidden',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: '0.375rem',
  border: '1px solid color-mix(in srgb, currentColor 15%, transparent)',
  background: 'transparent',
  fontFamily: 'var(--font-mono, monospace)',
  fontSize: '0.8rem',
  color: 'inherit',
  boxSizing: 'border-box',
}

const btnStyle: React.CSSProperties = {
  padding: '0.5rem 1.25rem',
  borderRadius: '0.375rem',
  border: 'none',
  background: '#00B462',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
}

const methodColors: Record<string, string> = {
  GET: '#22c55e',
  POST: '#3b82f6',
  DELETE: '#ef4444',
  PUT: '#eab308',
}

export function Playground() {
  const [env, setEnv] = useState(0) // sandbox
  const [token, setToken] = useState('')
  const [selected, setSelected] = useState(0)
  const [body, setBody] = useState(ENDPOINTS[0].body)
  const [pathInput, setPathInput] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [status, setStatus] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const endpoint = ENDPOINTS[selected]

  const handleSelect = (idx: number) => {
    setSelected(idx)
    setBody(ENDPOINTS[idx].body)
    setPathInput('')
    setResponse(null)
    setStatus(null)
  }

  const handleSend = async () => {
    setLoading(true)
    setResponse(null)
    setStatus(null)

    const baseUrl = ENVS[env].url
    let path = endpoint.path

    // Replace path parameters
    if (pathInput && path.includes('{')) {
      path = path.replace(/\{[^}]+\}/, pathInput)
    }

    const url = `${baseUrl}${path}`

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (token && endpoint.id !== 'auth') {
        headers['Authorization'] = `Bearer ${token}`
      }

      const opts: RequestInit = {
        method: endpoint.method,
        headers,
      }

      if (endpoint.method !== 'GET' && body.trim()) {
        opts.body = body
      }

      const res = await fetch(url, opts)
      setStatus(res.status)
      const text = await res.text()

      try {
        const json = JSON.parse(text)
        setResponse(JSON.stringify(json, null, 2))

        // Auto-capture token from auth response
        if (endpoint.id === 'auth' && json.access_token) {
          setToken(json.access_token)
        }
      } catch {
        setResponse(text)
      }
    } catch (err: any) {
      setResponse(`Error: ${err.message}\n\nNote: CORS may block direct browser requests to the QPay API.\nUse the CLI tool or a backend proxy for production use.`)
      setStatus(0)
    }

    setLoading(false)
  }

  return (
    <div>
      {/* Environment & Token */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
        <div style={{ flex: '0 0 auto' }}>
          <label style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginBottom: '0.25rem' }}>
            Environment
          </label>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {ENVS.map((e, i) => (
              <button
                key={e.label}
                onClick={() => setEnv(i)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: i === env
                    ? '2px solid #00B462'
                    : '2px solid color-mix(in srgb, currentColor 15%, transparent)',
                  background: i === env
                    ? 'color-mix(in srgb, #00B462 12%, transparent)'
                    : 'transparent',
                  fontSize: '0.8rem',
                  fontWeight: i === env ? 600 : 400,
                  cursor: 'pointer',
                  color: 'inherit',
                }}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginBottom: '0.25rem' }}>
            Bearer Token {token ? '(set)' : '(authenticate first)'}
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste token or use Authenticate endpoint"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Endpoint selector */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {ENDPOINTS.map((ep, i) => (
          <button
            key={ep.id}
            onClick={() => handleSelect(i)}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '9999px',
              border: i === selected
                ? `2px solid ${methodColors[ep.method]}`
                : '2px solid color-mix(in srgb, currentColor 12%, transparent)',
              background: i === selected
                ? `color-mix(in srgb, ${methodColors[ep.method]} 12%, transparent)`
                : 'transparent',
              fontSize: '0.75rem',
              fontWeight: i === selected ? 600 : 400,
              cursor: 'pointer',
              color: 'inherit',
            }}
          >
            <span style={{ color: methodColors[ep.method], fontWeight: 700, marginRight: '0.25rem' }}>
              {ep.method}
            </span>
            {ep.label}
          </button>
        ))}
      </div>

      {/* Request panel */}
      <div style={{ ...cardStyle, marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid color-mix(in srgb, currentColor 10%, transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <span style={{
              color: methodColors[endpoint.method],
              fontWeight: 700,
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono, monospace)',
            }}>
              {endpoint.method}
            </span>
            <code style={{ fontSize: '0.8rem', flex: 1 }}>
              {ENVS[env].url}{endpoint.path}
            </code>
          </div>
          <p style={{ fontSize: '0.75rem', opacity: 0.6, margin: 0 }}>
            {endpoint.description}
          </p>
        </div>

        {/* Path parameter input */}
        {endpoint.path.includes('{') && (
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid color-mix(in srgb, currentColor 10%, transparent)' }}>
            <label style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginBottom: '0.25rem' }}>
              Path parameter ({endpoint.path.match(/\{([^}]+)\}/)?.[1]})
            </label>
            <input
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              placeholder={`Enter ${endpoint.path.match(/\{([^}]+)\}/)?.[1]}`}
              style={inputStyle}
            />
          </div>
        )}

        {/* Request body */}
        {endpoint.method !== 'GET' && (
          <div style={{ padding: '0.75rem 1rem' }}>
            <label style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginBottom: '0.25rem' }}>
              Request Body (JSON)
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={Math.max(body.split('\n').length, 4)}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: '80px',
              }}
            />
          </div>
        )}
      </div>

      {/* Send button */}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={handleSend} disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </div>

      {/* Response */}
      {response !== null && (
        <div style={cardStyle}>
          <div style={{
            padding: '0.5rem 1rem',
            borderBottom: '1px solid color-mix(in srgb, currentColor 10%, transparent)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Response</span>
            {status !== null && (
              <code style={{
                fontSize: '0.75rem',
                padding: '0.125rem 0.5rem',
                borderRadius: '4px',
                background: status >= 200 && status < 300
                  ? 'color-mix(in srgb, #22c55e 20%, transparent)'
                  : 'color-mix(in srgb, #ef4444 20%, transparent)',
                color: status >= 200 && status < 300 ? '#22c55e' : '#ef4444',
              }}>
                {status || 'Network Error'}
              </code>
            )}
          </div>
          <pre style={{
            padding: '1rem',
            margin: 0,
            fontSize: '0.8rem',
            overflow: 'auto',
            maxHeight: '400px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {response}
          </pre>
        </div>
      )}

      <div style={{ fontSize: '0.7rem', opacity: 0.4, marginTop: '1rem', textAlign: 'center' }}>
        Requests are sent directly from your browser. CORS restrictions may apply for some endpoints.
        For production use, make API calls from your backend server.
      </div>
    </div>
  )
}
