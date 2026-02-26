import type { Metadata } from 'next'
import StyledComponentsRegistry from './lib/styled-components-registry'
import { GlobalStyle } from './global-style'

export const metadata: Metadata = {
  title: '업무 프롬프트 생성기',
  description: '역할/포인트를 선택하면 업무용 프롬프트를 자동으로 생성하고 복사할 수 있어요.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <StyledComponentsRegistry>
          <GlobalStyle />
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}