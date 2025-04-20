import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="vi">
      <Head />
      <body className="antialiased text-white min-h-screen flex flex-col">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
