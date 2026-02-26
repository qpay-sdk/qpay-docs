import nextra from 'nextra'

const withNextra = nextra({
  latex: false,
  search: {
    codeblocks: false,
  },
})

export default withNextra({
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/qpay-docs',
})
