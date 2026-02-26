import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'

import 'nextra-theme-docs/style.css'

export const metadata: Metadata = {
  title: {
    default: 'QPay SDK Documentation',
    template: '%s - QPay SDK',
  },
  description:
    'QPay V2 Payment API SDK for every language. Official documentation for Go, JavaScript, Python, PHP, Java, Ruby, .NET, Dart, Swift, Rust, and cURL.',
  openGraph: {
    title: 'QPay SDK Documentation',
    description: 'QPay V2 Payment API SDK for every language',
    siteName: 'QPay SDK',
  },
}

const logo = (
  <span style={{ fontWeight: 800, fontSize: '1.2em' }}>
    QPay SDK
  </span>
)

const navbar = (
  <Navbar
    logo={logo}
    projectLink="https://github.com/qpay-sdk"
  />
)

const footer = (
  <Footer>
    <span>
      MIT {new Date().getFullYear()} QPay SDK.
    </span>
  </Footer>
)

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          footer={footer}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/qpay-sdk/qpay-docs/tree/main"
          editLink="Edit this page on GitHub"
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
