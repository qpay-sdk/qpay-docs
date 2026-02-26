'use client'

import { useEffect, useState } from 'react'

interface RepoStats {
  name: string
  stars: number
  forks: number
  issues: number
  language: string
  updatedAt: string
}

interface RegistryStats {
  name: string
  registry: string
  downloads: number | string
  version: string
  url: string
}

interface AllStats {
  repos: RepoStats[]
  registries: RegistryStats[]
  totals: {
    repos: number
    stars: number
    forks: number
    totalDownloads: number
  }
  loading: boolean
  error: string | null
}

const GITHUB_ORG = 'qpay-sdk'

const REGISTRY_PACKAGES: {
  name: string
  registry: string
  fetchFn: () => Promise<{ downloads: number | string; version: string }>
  url: string
  category: 'sdk' | 'framework' | 'plugin'
}[] = [
  // Core SDKs
  {
    name: 'qpay-go',
    registry: 'pkg.go.dev',
    url: 'https://pkg.go.dev/github.com/qpay-sdk/qpay-go',
    category: 'sdk',
    fetchFn: async () => ({ downloads: '—', version: '1.0.0' }),
  },
  {
    name: 'qpay-js',
    registry: 'npm',
    url: 'https://www.npmjs.com/package/qpay-js',
    category: 'sdk',
    fetchFn: async () => {
      const [dlRes, metaRes] = await Promise.all([
        fetch('https://api.npmjs.org/downloads/point/last-month/qpay-js'),
        fetch('https://registry.npmjs.org/qpay-js/latest'),
      ])
      const dl = await dlRes.json().catch(() => ({}))
      const meta = await metaRes.json().catch(() => ({}))
      return { downloads: dl.downloads ?? 0, version: meta.version ?? '—' }
    },
  },
  {
    name: 'qpay-py',
    registry: 'PyPI',
    url: 'https://pypi.org/project/qpay-py/',
    category: 'sdk',
    fetchFn: async () => {
      const [metaRes, dlRes] = await Promise.all([
        fetch('https://pypi.org/pypi/qpay-py/json'),
        fetch('https://pypistats.org/api/packages/qpay-py/recent'),
      ])
      const meta = await metaRes.json().catch(() => ({}))
      const dl = await dlRes.json().catch(() => ({}))
      return { downloads: dl.data?.last_month ?? '—', version: meta.info?.version ?? '—' }
    },
  },
  {
    name: 'qpay-php',
    registry: 'Packagist',
    url: 'https://packagist.org/packages/usukhbayar/qpay-php',
    category: 'sdk',
    fetchFn: async () => {
      const res = await fetch('https://packagist.org/packages/usukhbayar/qpay-php.json')
      const d = await res.json().catch(() => ({}))
      return {
        downloads: d.package?.downloads?.total ?? 0,
        version: Object.keys(d.package?.versions ?? {})[0] ?? '—',
      }
    },
  },
  {
    name: 'qpay-sdk (Ruby)',
    registry: 'RubyGems',
    url: 'https://rubygems.org/gems/qpay-sdk',
    category: 'sdk',
    fetchFn: async () => {
      const res = await fetch('https://rubygems.org/api/v1/gems/qpay-sdk.json')
      const d = await res.json().catch(() => ({}))
      return { downloads: d.downloads ?? 0, version: d.version ?? '—' }
    },
  },
  {
    name: 'qpay (Dart)',
    registry: 'pub.dev',
    url: 'https://pub.dev/packages/qpay',
    category: 'sdk',
    fetchFn: async () => {
      const [pkgRes, scoreRes] = await Promise.all([
        fetch('https://pub.dev/api/packages/qpay'),
        fetch('https://pub.dev/api/packages/qpay/score'),
      ])
      const pkg = await pkgRes.json().catch(() => ({}))
      const score = await scoreRes.json().catch(() => ({}))
      return {
        downloads: score.likeCount != null ? `${score.likeCount} likes` : '—',
        version: pkg.latest?.version ?? '—',
      }
    },
  },
  {
    name: 'qpay (Rust)',
    registry: 'crates.io',
    url: 'https://crates.io/crates/qpay',
    category: 'sdk',
    fetchFn: async () => {
      const res = await fetch('https://crates.io/api/v1/crates/qpay')
      const d = await res.json().catch(() => ({}))
      return {
        downloads: d.crate?.downloads ?? 0,
        version: d.crate?.max_version ?? '—',
      }
    },
  },
  {
    name: 'QPay (.NET)',
    registry: 'NuGet',
    url: 'https://www.nuget.org/packages/QPay',
    category: 'sdk',
    fetchFn: async () => {
      const res = await fetch(
        'https://azuresearch-usnc.nuget.org/query?q=packageid:QPay&take=1'
      )
      const d = await res.json().catch(() => ({}))
      const pkg = d.data?.[0]
      return {
        downloads: pkg?.totalDownloads ?? '—',
        version: pkg?.version ?? '—',
      }
    },
  },
  {
    name: 'qpay-java',
    registry: 'Maven Central',
    url: 'https://central.sonatype.com/artifact/mn.qpay/qpay-java',
    category: 'sdk',
    fetchFn: async () => ({ downloads: '—', version: '1.0.0' }),
  },
  {
    name: 'qpay-swift',
    registry: 'SPM',
    url: 'https://github.com/qpay-sdk/qpay-swift',
    category: 'sdk',
    fetchFn: async () => ({ downloads: '—', version: '1.0.0' }),
  },
  // Framework packages
  {
    name: 'qpay-sdk/laravel',
    registry: 'Packagist',
    url: 'https://packagist.org/packages/qpay-sdk/laravel',
    category: 'framework',
    fetchFn: async () => {
      const res = await fetch('https://packagist.org/packages/qpay-sdk/laravel.json')
      const d = await res.json().catch(() => ({}))
      return {
        downloads: d.package?.downloads?.total ?? 0,
        version: Object.keys(d.package?.versions ?? {})[0] ?? '—',
      }
    },
  },
  {
    name: 'django-qpay',
    registry: 'PyPI',
    url: 'https://pypi.org/project/django-qpay/',
    category: 'framework',
    fetchFn: async () => {
      const [metaRes, dlRes] = await Promise.all([
        fetch('https://pypi.org/pypi/django-qpay/json'),
        fetch('https://pypistats.org/api/packages/django-qpay/recent'),
      ])
      const meta = await metaRes.json().catch(() => ({}))
      const dl = await dlRes.json().catch(() => ({}))
      return { downloads: dl.data?.last_month ?? '—', version: meta.info?.version ?? '—' }
    },
  },
  {
    name: '@qpay-sdk/express',
    registry: 'npm',
    url: 'https://www.npmjs.com/package/@qpay-sdk/express',
    category: 'framework',
    fetchFn: async () => {
      const [dlRes, metaRes] = await Promise.all([
        fetch('https://api.npmjs.org/downloads/point/last-month/@qpay-sdk/express'),
        fetch('https://registry.npmjs.org/@qpay-sdk/express/latest'),
      ])
      const dl = await dlRes.json().catch(() => ({}))
      const meta = await metaRes.json().catch(() => ({}))
      return { downloads: dl.downloads ?? 0, version: meta.version ?? '—' }
    },
  },
  {
    name: '@qpay-sdk/nestjs',
    registry: 'npm',
    url: 'https://www.npmjs.com/package/@qpay-sdk/nestjs',
    category: 'framework',
    fetchFn: async () => {
      const [dlRes, metaRes] = await Promise.all([
        fetch('https://api.npmjs.org/downloads/point/last-month/@qpay-sdk/nestjs'),
        fetch('https://registry.npmjs.org/@qpay-sdk/nestjs/latest'),
      ])
      const dl = await dlRes.json().catch(() => ({}))
      const meta = await metaRes.json().catch(() => ({}))
      return { downloads: dl.downloads ?? 0, version: meta.version ?? '—' }
    },
  },
  {
    name: 'qpay-spring-boot-starter',
    registry: 'Maven Central',
    url: 'https://central.sonatype.com/artifact/io.github.qpay-sdk/qpay-spring-boot-starter',
    category: 'framework',
    fetchFn: async () => ({ downloads: '—', version: '1.0.0' }),
  },
  {
    name: 'qpay-rails',
    registry: 'RubyGems',
    url: 'https://rubygems.org/gems/qpay-rails',
    category: 'framework',
    fetchFn: async () => {
      const res = await fetch('https://rubygems.org/api/v1/gems/qpay-rails.json')
      const d = await res.json().catch(() => ({}))
      return { downloads: d.downloads ?? 0, version: d.version ?? '—' }
    },
  },
  {
    name: 'QPay.AspNetCore',
    registry: 'NuGet',
    url: 'https://www.nuget.org/packages/QPay.AspNetCore',
    category: 'framework',
    fetchFn: async () => {
      const res = await fetch(
        'https://azuresearch-usnc.nuget.org/query?q=packageid:QPay.AspNetCore&take=1'
      )
      const d = await res.json().catch(() => ({}))
      const pkg = d.data?.[0]
      return {
        downloads: pkg?.totalDownloads ?? '—',
        version: pkg?.version ?? '—',
      }
    },
  },
  {
    name: 'qpay_flutter',
    registry: 'pub.dev',
    url: 'https://pub.dev/packages/qpay_flutter',
    category: 'framework',
    fetchFn: async () => {
      const [pkgRes, scoreRes] = await Promise.all([
        fetch('https://pub.dev/api/packages/qpay_flutter'),
        fetch('https://pub.dev/api/packages/qpay_flutter/score'),
      ])
      const pkg = await pkgRes.json().catch(() => ({}))
      const score = await scoreRes.json().catch(() => ({}))
      return {
        downloads: score.likeCount != null ? `${score.likeCount} likes` : '—',
        version: pkg.latest?.version ?? '—',
      }
    },
  },
  {
    name: 'fastapi-qpay',
    registry: 'PyPI',
    url: 'https://pypi.org/project/fastapi-qpay/',
    category: 'framework',
    fetchFn: async () => {
      const [metaRes, dlRes] = await Promise.all([
        fetch('https://pypi.org/pypi/fastapi-qpay/json'),
        fetch('https://pypistats.org/api/packages/fastapi-qpay/recent'),
      ])
      const meta = await metaRes.json().catch(() => ({}))
      const dl = await dlRes.json().catch(() => ({}))
      return { downloads: dl.data?.last_month ?? '—', version: meta.info?.version ?? '—' }
    },
  },
]

const REPO_CATEGORIES: Record<string, string> = {
  'qpay-go': 'sdk',
  'qpay-js': 'sdk',
  'qpay-py': 'sdk',
  'qpay-php': 'sdk',
  'qpay-ruby': 'sdk',
  'qpay-dart': 'sdk',
  'qpay-rust': 'sdk',
  'qpay-java': 'sdk',
  'qpay-dotnet': 'sdk',
  'qpay-swift': 'sdk',
  'qpay-curl': 'sdk',
  'qpay-laravel': 'framework',
  'django-qpay': 'framework',
  'qpay-spring-boot-starter': 'framework',
  'qpay-express': 'framework',
  'qpay-nestjs': 'framework',
  'qpay-rails': 'framework',
  'qpay-aspnetcore': 'framework',
  'qpay-flutter': 'framework',
  'fastapi-qpay': 'framework',
  'qpay-woocommerce': 'plugin',
  'qpay-shopify': 'plugin',
  'qpay-opencart': 'plugin',
  'qpay-magento': 'plugin',
  'qpay-prestashop': 'plugin',
  'qpay-wordpress': 'plugin',
  'qpay-odoo': 'plugin',
  'qpay-docs': 'other',
}

function formatNumber(n: number | string): string {
  if (typeof n === 'string') return n
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

const cardStyle: React.CSSProperties = {
  padding: '1.25rem',
  borderRadius: '0.75rem',
  border: '1px solid color-mix(in srgb, currentColor 15%, transparent)',
  background: 'color-mix(in srgb, currentColor 5%, transparent)',
}

const statBoxStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '1rem',
  borderRadius: '0.5rem',
  border: '1px solid color-mix(in srgb, currentColor 15%, transparent)',
  background: 'color-mix(in srgb, currentColor 5%, transparent)',
  minWidth: '120px',
}

function SummaryCards({ totals }: { totals: AllStats['totals'] }) {
  const items = [
    { label: 'Repositories', value: totals.repos, icon: '/' },
    { label: 'Total Stars', value: totals.stars, icon: '/' },
    { label: 'Total Forks', value: totals.forks, icon: '/' },
    { label: 'Total Downloads', value: totals.totalDownloads, icon: '/' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
      {items.map((item) => (
        <div key={item.label} style={statBoxStyle}>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2 }}>
            {formatNumber(item.value)}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.25rem' }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}

function RepoTable({ repos, title }: { repos: RepoStats[]; title: string }) {
  if (repos.length === 0) return null
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '0.75rem' }}>{title}</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', fontSize: '0.875rem' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Repository</th>
              <th style={{ textAlign: 'center' }}>Language</th>
              <th style={{ textAlign: 'center' }}>Stars</th>
              <th style={{ textAlign: 'center' }}>Forks</th>
              <th style={{ textAlign: 'center' }}>Issues</th>
              <th style={{ textAlign: 'right' }}>Updated</th>
            </tr>
          </thead>
          <tbody>
            {repos.map((repo) => (
              <tr key={repo.name}>
                <td>
                  <a
                    href={`https://github.com/${GITHUB_ORG}/${repo.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 500 }}
                  >
                    {repo.name}
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <code style={{ fontSize: '0.75rem' }}>{repo.language || '—'}</code>
                </td>
                <td style={{ textAlign: 'center' }}>{repo.stars}</td>
                <td style={{ textAlign: 'center' }}>{repo.forks}</td>
                <td style={{ textAlign: 'center' }}>{repo.issues}</td>
                <td style={{ textAlign: 'right', fontSize: '0.75rem', opacity: 0.7 }}>
                  {timeAgo(repo.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RegistryTable({
  packages,
  title,
}: {
  packages: RegistryStats[]
  title: string
}) {
  if (packages.length === 0) return null
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '0.75rem' }}>{title}</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', fontSize: '0.875rem' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Package</th>
              <th style={{ textAlign: 'center' }}>Registry</th>
              <th style={{ textAlign: 'center' }}>Version</th>
              <th style={{ textAlign: 'right' }}>Downloads</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.name}>
                <td>
                  <a
                    href={pkg.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 500 }}
                  >
                    {pkg.name}
                  </a>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <code style={{ fontSize: '0.75rem' }}>{pkg.registry}</code>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <code style={{ fontSize: '0.75rem' }}>{pkg.version}</code>
                </td>
                <td style={{ textAlign: 'right' }}>{formatNumber(pkg.downloads)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function StatsDashboard() {
  const [stats, setStats] = useState<AllStats>({
    repos: [],
    registries: [],
    totals: { repos: 0, stars: 0, forks: 0, totalDownloads: 0 },
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function fetchAll() {
      try {
        // Fetch GitHub repos
        const ghRes = await fetch(
          `https://api.github.com/orgs/${GITHUB_ORG}/repos?per_page=100&sort=full_name`
        )
        const ghData: any[] = await ghRes.json()

        const repos: RepoStats[] = (Array.isArray(ghData) ? ghData : [])
          .filter((r: any) => r.name !== '.github')
          .map((r: any) => ({
            name: r.name,
            stars: r.stargazers_count ?? 0,
            forks: r.forks_count ?? 0,
            issues: r.open_issues_count ?? 0,
            language: r.language ?? '',
            updatedAt: r.pushed_at ?? r.updated_at ?? '',
          }))

        // Fetch registry stats
        const registryResults = await Promise.allSettled(
          REGISTRY_PACKAGES.map(async (pkg) => {
            const result = await pkg.fetchFn()
            return {
              name: pkg.name,
              registry: pkg.registry,
              downloads: result.downloads,
              version: result.version,
              url: pkg.url,
              category: pkg.category,
            }
          })
        )

        const registries: (RegistryStats & { category: string })[] = []
        for (const r of registryResults) {
          if (r.status === 'fulfilled') registries.push(r.value)
        }

        // Calculate totals
        const totalStars = repos.reduce((sum, r) => sum + r.stars, 0)
        const totalForks = repos.reduce((sum, r) => sum + r.forks, 0)
        const totalDownloads = registries.reduce((sum, r) => {
          if (typeof r.downloads === 'number') return sum + r.downloads
          return sum
        }, 0)

        setStats({
          repos,
          registries,
          totals: {
            repos: repos.length,
            stars: totalStars,
            forks: totalForks,
            totalDownloads,
          },
          loading: false,
          error: null,
        })
      } catch (err) {
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch stats',
        }))
      }
    }

    fetchAll()
  }, [])

  if (stats.loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
        Loading stats from GitHub and package registries...
      </div>
    )
  }

  if (stats.error) {
    return (
      <div style={{ ...cardStyle, borderColor: 'var(--nextra-error, #ef4444)', color: 'var(--nextra-error, #ef4444)' }}>
        Error: {stats.error}
      </div>
    )
  }

  const sdkRepos = stats.repos.filter((r) => REPO_CATEGORIES[r.name] === 'sdk')
  const frameworkRepos = stats.repos.filter((r) => REPO_CATEGORIES[r.name] === 'framework')
  const pluginRepos = stats.repos.filter((r) => REPO_CATEGORIES[r.name] === 'plugin')
  const otherRepos = stats.repos.filter(
    (r) => !REPO_CATEGORIES[r.name] || REPO_CATEGORIES[r.name] === 'other'
  )

  const sdkPkgs = stats.registries.filter((r: any) => {
    const match = REGISTRY_PACKAGES.find((p) => p.name === r.name)
    return match?.category === 'sdk'
  })
  const frameworkPkgs = stats.registries.filter((r: any) => {
    const match = REGISTRY_PACKAGES.find((p) => p.name === r.name)
    return match?.category === 'framework'
  })

  return (
    <div>
      <SummaryCards totals={stats.totals} />

      <h2>GitHub Repositories</h2>
      <p style={{ opacity: 0.7, fontSize: '0.875rem', marginBottom: '1rem' }}>
        Stars, forks, and open issues from{' '}
        <a href="https://github.com/qpay-sdk" target="_blank" rel="noopener noreferrer">
          github.com/qpay-sdk
        </a>
      </p>

      <RepoTable repos={sdkRepos} title="Core SDKs" />
      <RepoTable repos={frameworkRepos} title="Framework Packages" />
      <RepoTable repos={pluginRepos} title="CMS Plugins" />
      {otherRepos.length > 0 && <RepoTable repos={otherRepos} title="Other" />}

      <h2>Package Registry Stats</h2>
      <p style={{ opacity: 0.7, fontSize: '0.875rem', marginBottom: '1rem' }}>
        Download counts and latest versions from npm, PyPI, Packagist, RubyGems, crates.io, pub.dev, NuGet, and Maven Central.
      </p>

      <RegistryTable packages={sdkPkgs} title="Core SDKs" />
      <RegistryTable packages={frameworkPkgs} title="Framework Packages" />

      <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '2rem', textAlign: 'center' }}>
        Stats fetched in real-time from public APIs. PyPI shows monthly downloads. Some registries (pkg.go.dev, Maven Central, SPM) do not expose public download counts.
      </div>
    </div>
  )
}
