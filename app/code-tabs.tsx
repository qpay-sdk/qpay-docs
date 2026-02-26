'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'qpay-docs-lang'

interface CodeTabsProps {
  children: React.ReactNode
  labels: string[]
}

export function CodeTabs({ children, labels }: CodeTabsProps) {
  const [active, setActive] = useState(0)

  // Persist language selection
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const idx = labels.indexOf(saved)
      if (idx >= 0) setActive(idx)
    }
  }, [labels])

  const handleSelect = (idx: number) => {
    setActive(idx)
    localStorage.setItem(STORAGE_KEY, labels[idx])
  }

  // Get child elements as array
  const items = Array.isArray(children) ? children : [children]

  return (
    <div style={{
      borderRadius: '0.75rem',
      border: '1px solid color-mix(in srgb, currentColor 15%, transparent)',
      overflow: 'hidden',
      marginBottom: '1.5rem',
    }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid color-mix(in srgb, currentColor 10%, transparent)',
        background: 'color-mix(in srgb, currentColor 3%, transparent)',
        overflowX: 'auto',
      }}>
        {labels.map((label, i) => (
          <button
            key={label}
            onClick={() => handleSelect(i)}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderBottom: i === active ? '2px solid #00B462' : '2px solid transparent',
              background: 'transparent',
              fontSize: '0.8rem',
              fontWeight: i === active ? 600 : 400,
              opacity: i === active ? 1 : 0.6,
              cursor: 'pointer',
              color: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Content */}
      <div>
        {items.map((child, i) => (
          <div key={i} style={{ display: i === active ? 'block' : 'none' }}>
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
