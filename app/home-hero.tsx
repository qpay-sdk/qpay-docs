'use client'

import { useEffect, useState } from 'react'

const LANGUAGES = [
  { name: 'Go', cmd: 'go get github.com/qpay-sdk/qpay-go', color: '#00ADD8' },
  { name: 'JavaScript', cmd: 'npm install qpay-js', color: '#F7DF1E' },
  { name: 'Python', cmd: 'pip install qpay-py', color: '#3776AB' },
  { name: 'PHP', cmd: 'composer require usukhbayar/qpay-php', color: '#777BB4' },
  { name: 'Ruby', cmd: 'gem install qpay-sdk', color: '#CC342D' },
  { name: 'Dart', cmd: 'dart pub add qpay', color: '#0175C2' },
  { name: 'Rust', cmd: 'cargo add qpay', color: '#DEA584' },
  { name: '.NET', cmd: 'dotnet add package QPay', color: '#512BD4' },
  { name: 'Java', cmd: 'io.github.qpay-sdk:qpay-java', color: '#ED8B00' },
  { name: 'Swift', cmd: '.package(url: "qpay-swift")', color: '#F05138' },
]

const STATS = [
  { label: 'SDKs', value: '11' },
  { label: 'Frameworks', value: '9' },
  { label: 'CMS Plugins', value: '7' },
  { label: 'Registries', value: '19' },
]

export function HomeHero() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((i) => (i + 1) % LANGUAGES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const active = LANGUAGES[activeIdx]

  const handleCopy = () => {
    navigator.clipboard.writeText(active.cmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ padding: '3rem 0 2rem' }}>
      {/* Hero heading */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          margin: '0 0 1rem',
          letterSpacing: '-0.02em',
        }}>
          QPay payments in{' '}
          <span style={{
            color: active.color,
            transition: 'color 0.4s ease',
          }}>
            {active.name}
          </span>
        </h1>
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          opacity: 0.7,
          maxWidth: '600px',
          margin: '0 auto 2rem',
          lineHeight: 1.6,
        }}>
          Official SDK libraries for the QPay V2 Payment API. One consistent interface across 11 languages, 9 frameworks, and 7 CMS plugins.
        </p>
      </div>

      {/* Install command */}
      <div style={{
        maxWidth: '560px',
        margin: '0 auto 2.5rem',
      }}>
        <div
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.875rem 1.25rem',
            borderRadius: '0.75rem',
            border: '1px solid color-mix(in srgb, currentColor 15%, transparent)',
            background: 'color-mix(in srgb, currentColor 5%, transparent)',
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            gap: '1rem',
          }}
        >
          <span style={{ opacity: 0.4, userSelect: 'none' }}>$</span>
          <code style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {active.cmd}
          </code>
          <span style={{ opacity: 0.5, fontSize: '0.75rem', flexShrink: 0 }}>
            {copied ? 'Copied!' : 'Click to copy'}
          </span>
        </div>
      </div>

      {/* Language pills */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0.5rem',
        maxWidth: '600px',
        margin: '0 auto 3rem',
      }}>
        {LANGUAGES.map((lang, i) => (
          <button
            key={lang.name}
            onClick={() => setActiveIdx(i)}
            style={{
              padding: '0.375rem 0.875rem',
              borderRadius: '9999px',
              border: i === activeIdx
                ? `2px solid ${lang.color}`
                : '2px solid color-mix(in srgb, currentColor 12%, transparent)',
              background: i === activeIdx
                ? `color-mix(in srgb, ${lang.color} 12%, transparent)`
                : 'transparent',
              fontWeight: i === activeIdx ? 600 : 400,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              color: 'inherit',
            }}
          >
            {lang.name}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        maxWidth: '520px',
        margin: '0 auto 2rem',
        textAlign: 'center',
      }}>
        {STATS.map((stat) => (
          <div key={stat.label}>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              lineHeight: 1.2,
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: '0.75rem',
              opacity: 0.5,
              marginTop: '0.25rem',
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* CTA buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}>
        <a
          href="/qpay-docs/getting-started"
          style={{
            display: 'inline-block',
            padding: '0.7rem 1.5rem',
            borderRadius: '0.5rem',
            background: '#00B462',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
            transition: 'opacity 0.2s',
          }}
        >
          Get Started
        </a>
        <a
          href="https://github.com/qpay-sdk"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '0.7rem 1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid color-mix(in srgb, currentColor 20%, transparent)',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'opacity 0.2s',
          }}
        >
          GitHub
        </a>
      </div>
    </div>
  )
}
