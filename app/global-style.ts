'use client'

import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  :root {
    --font-base: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui,
      Roboto, "Helvetica Neue", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic",
      "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;

    --font-accent: "Paperlogy", var(--font-base);

    --bg: #f6f7fb;
    --panel: #ffffff;
    --panel-soft: #f8fafc;

    --text: #111827;
    --muted: #6b7280;

    --border: #e5e7eb;
    --border-strong: #d1d5db;

    --shadow: 0 12px 30px rgba(17, 24, 39, 0.08);

    --accent: #4f46e5;
    --accent-weak: rgba(79, 70, 229, 0.10);
    --accent-soft: rgba(79, 70, 229, 0.16);
    --accent-border: rgba(79, 70, 229, 0.28);

    --radius: 18px;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    padding: 0;
    margin: 0;
    color-scheme: light;
    font-family: var(--font-base);
    color: var(--text);
    background:
      radial-gradient(900px 520px at 15% 10%, rgba(79, 70, 229, 0.10), transparent 55%),
      radial-gradient(760px 520px at 90% 10%, rgba(16, 185, 129, 0.08), transparent 60%),
      linear-gradient(180deg, #f7f7ff 0%, var(--bg) 40%, #f4f6fb 100%);

    /* ✅ 전체 페이지 스크롤 방지 */
    height: 100%;
    overflow: hidden;
    overscroll-behavior: none;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  /* ✅ 폼 컨트롤(인풋/텍스트영역/셀렉트) 안의 텍스트를 Pretendard로 고정 */
  input,
  textarea,
  select {
    font-family: var(--font-base);
  }

  button {
    font-family: var(--font-base);
  }

  ::selection {
    background: rgba(79, 70, 229, 0.18);
  }
`