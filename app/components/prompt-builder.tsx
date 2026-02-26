'use client'

import React, { useMemo, useState } from 'react'
import styled, { css } from 'styled-components'

type RoleKey = 'frontend' | 'ppt' | 'pm'

type PromptPoint = {
  id: string
  label: string
  description?: string
  snippet: string
  recommended?: boolean
  detailOptions?: string[]
  defaultDetails?: string[]
}

type RoleConfig = {
  key: RoleKey
  label: string
  emoji: string
  help: string
  taskPlaceholder: string
  baseRules: string[]
  outputRules: string[]
  points: PromptPoint[]
}

type RoleState = {
  task: string
  selectedPointIds: string[]
  pointText: Record<string, string>
  pointDetails: Record<string, string[]>
}

const ROLE_CONFIGS: Record<RoleKey, RoleConfig> = {
  frontend: {
    key: 'frontend',
    label: '프론트엔드 개발자',
    emoji: '🧑‍💻',
    help: '요구사항을 코드로 바꾸고, 구조/품질/성능까지 챙기는 프롬프트를 만들어요.',
    taskPlaceholder:
      '예) Next.js(App Router)에서 로그인/회원가입 폼을 만들어줘. 유효성 검사, 에러 처리, 접근성까지 고려해줘.',
    baseRules: [
      '당신은 시니어 프론트엔드 개발자입니다. (React/Next.js/TypeScript 기준)',
      '요청이 모호하면 먼저 확인 질문 3~6개를 하고, 가정이 있으면 “가정” 섹션에 명시하세요.',
      '답변은 “설계 → 구현 → 검증(테스트/체크리스트)” 흐름으로 작성하세요.',
      '코드는 바로 붙여넣어 실행할 수 있게, 파일 단위로 제시하세요.',
    ],
    outputRules: [
      '출력은 Markdown으로 작성',
      '섹션 구조: 1) 요약 2) 확인 질문/가정 3) 구현 계획 4) 폴더/파일 구조 5) 코드 6) 테스트/검증 7) 체크리스트',
      '코드 블록에는 언어 태그(ts/tsx)를 넣기',
    ],
    points: [
      {
        id: 'stack',
        label: '기술 스택/버전 명시',
        description: '스택을 박아두면 답변 퀄리티가 확 올라가요',
        snippet:
          '기술 스택/버전(Next.js App Router, TypeScript, styled-components)을 명시하고 그 기준으로 답해줘.',
        recommended: true,
        detailOptions: [
          'Next.js App Router',
          'TypeScript',
          'styled-components',
          'React 19',
          'React Hook Form',
          'Zod',
          'TanStack Query',
          'Storybook',
          'Vitest',
          'Playwright',
          'ESLint + Prettier',
        ],
        defaultDetails: ['Next.js App Router', 'TypeScript', 'styled-components'],
      },
      {
        id: 'a11y',
        label: '접근성(A11y)',
        description: '시맨틱/ARIA/키보드 포커스',
        snippet:
          '접근성(시맨틱 태그, aria 속성, 키보드 포커스/탭 이동)을 기본 요건으로 포함해줘.',
        recommended: true,
        detailOptions: [
          '시맨틱 태그',
          'aria-label / aria-describedby',
          '키보드 내비게이션',
          '포커스 스타일(Outline)',
          '색 대비(Contrast)',
          '스크린리더 고려',
        ],
        defaultDetails: ['시맨틱 태그', 'aria-label / aria-describedby', '키보드 내비게이션'],
      },
      {
        id: 'perf',
        label: '성능 최적화',
        description: '리렌더/이미지/번들',
        snippet:
          '성능 관점(불필요한 리렌더 방지, 코드 스플리팅, 이미지 최적화)을 고려해줘.',
        detailOptions: [
          '불필요한 리렌더 방지',
          'useMemo/useCallback 사용 기준',
          '이미지 최적화(next/image)',
          'lazy loading',
          '번들 분석(Analyzer)',
          '리스트 가상화(virtualization)',
        ],
      },
      {
        id: 'seo',
        label: 'SEO/메타데이터',
        description: '메타/OG/헤딩 구조',
        snippet: 'SEO(메타데이터, OG 태그, 의미 있는 헤딩 구조)를 필요 시 포함해줘.',
        detailOptions: ['metadata 설정', 'Open Graph', 'Twitter Card', '헤딩 구조(H1~H3)', '구조화 데이터'],
      },
      {
        id: 'error',
        label: '에러 처리/엣지 케이스',
        description: '로딩/실패/빈 상태 UX',
        snippet:
          '로딩/에러/빈 상태(Empty state) UX와 예외 케이스 처리를 반드시 포함해줘.',
        recommended: true,
        detailOptions: [
          '로딩 스켈레톤',
          '토스트 vs 인라인 에러',
          '재시도 UX',
          'Empty state',
          '에러 바운더리',
          '네트워크 타임아웃',
        ],
        defaultDetails: ['로딩 스켈레톤', 'Empty state', '에러 바운더리'],
      },
      {
        id: 'tests',
        label: '테스트 가이드',
        description: '핵심 시나리오 중심',
        snippet:
          '핵심 시나리오 기준으로 테스트 전략(무엇을 어떤 단위로 검증할지)을 제시해줘.',
        detailOptions: ['단위 테스트', '통합 테스트', 'E2E', 'Mocking(MSW)', '접근성 테스트'],
      },
      {
        id: 'dx',
        label: '코드 스타일/가독성',
        description: '타입/네이밍/구조',
        snippet:
          '타입 안정성(TypeScript), 네이밍/폴더 구조, 재사용성을 우선해서 코드 품질을 챙겨줘.',
        detailOptions: ['폴더 구조 제안', '타입 설계', '컴포넌트 분리 기준', '린팅/포맷팅', '재사용 훅 추출'],
      },
    ],
  },

  ppt: {
    key: 'ppt',
    label: 'PPT 만드는 디자이너',
    emoji: '🎞️',
    help: '스토리라인 → 슬라이드 구조 → 디자인 시스템까지 한 번에 뽑아요.',
    taskPlaceholder:
      '예) 투자자에게 제품 소개하는 10장짜리 IR 덱 구성해줘. B2B SaaS, 톤은 신뢰감/미니멀.',
    baseRules: [
      '당신은 숙련된 프레젠테이션(PPT) 디자이너입니다.',
      '먼저 목적/대상/발표 시간/슬라이드 수 등 핵심 정보를 질문하고, 모르면 합리적으로 가정하세요.',
      '스토리라인(기승전결)과 슬라이드별 메시지 1줄을 먼저 잡고, 그 다음 레이아웃/디자인을 제안하세요.',
    ],
    outputRules: [
      '출력은 Markdown으로 작성',
      '섹션 구조: 1) 목표/대상/톤 2) 스토리라인 3) 슬라이드별 설계 표 4) 디자인 시스템(폰트/컬러/그리드) 5) 제작 팁',
      '슬라이드별 표에는 “슬라이드 제목 / 핵심 메시지 / 구성 요소 / 비주얼 가이드 / 발표자 노트” 포함',
    ],
    points: [
      {
        id: 'ratio',
        label: '비율/슬라이드 수/시간',
        description: '분량과 밀도는 여기서 결정돼요',
        snippet:
          '슬라이드 비율(기본 16:9)과 총 장수/발표 시간을 기준으로 밀도를 조절해줘.',
        recommended: true,
        detailOptions: ['16:9', '4:3', '8장', '10장', '12장', '5분', '7분', '10분'],
        defaultDetails: ['16:9', '10장'],
      },
      {
        id: 'story',
        label: '스토리텔링 강화',
        description: '문제→해결→근거→요청',
        snippet: '스토리 구조(문제 → 해결 → 근거 → 제안/요청)를 명확히 잡아줘.',
        recommended: true,
        detailOptions: ['문제-해결', 'AIDA', '피라미드 구조', 'Before-After-Bridge', '3막 구조'],
        defaultDetails: ['문제-해결'],
      },
      {
        id: 'typography',
        label: '타이포 룰(계층)',
        description: '제목/본문/캡션 규칙',
        snippet: '타이포 계층(제목/본문/캡션)과 줄간/자간 가이드를 제안해줘.',
        recommended: true,
        detailOptions: [
          '제목 32–40pt',
          '본문 16–20pt',
          '캡션 12–14pt',
          '줄간 1.2–1.4',
          '한 슬라이드 1메시지',
        ],
        defaultDetails: ['한 슬라이드 1메시지'],
      },
      {
        id: 'color',
        label: '컬러 시스템',
        description: '메인/서브/강조',
        snippet: '컬러 팔레트(메인/서브/강조/상태)와 사용 규칙을 제안해줘.',
        detailOptions: ['메인 1 + 서브 1', '강조색 1', '상태색(성공/경고/실패)', '그레이 스케일 단계'],
      },
      {
        id: 'grid',
        label: '그리드/정렬',
        description: '여백/컬럼 기준',
        snippet: '그리드(예: 12컬럼)와 여백/정렬 원칙을 제시해 일관성을 확보해줘.',
        detailOptions: ['12컬럼', '8pt 그리드', '좌/우 여백 48px', '정렬 우선순위(좌정렬)', '베이스라인 정렬'],
      },
      {
        id: 'charts',
        label: '차트/데이터 시각화',
        description: '축/단위/강조',
        snippet: '데이터가 있다면 차트 유형 추천 + 라벨/단위/강조 방식까지 가이드해줘.',
        detailOptions: ['라인/바/도넛 선택 기준', '축/단위 표기', '강조 색상 규칙', '데이터 라벨 최소화'],
      },
      {
        id: 'motion',
        label: '전환/애니메이션',
        description: '필요한 곳만',
        snippet:
          '애니메이션/전환은 최소로, “메시지 전달에 필요한 경우만” 쓰는 원칙으로 제안해줘.',
        detailOptions: ['0.2~0.3s 페이드', '단계적 등장(빌드)', '전환 최소', '강조 요소만 애니메이션'],
      },
    ],
  },

  pm: {
    key: 'pm',
    label: '서류 작성 PM',
    emoji: '🗂️',
    help: 'PRD/기획서/회의록을 “읽는 즉시 실행 가능한 문서”로 만드는 프롬프트예요.',
    taskPlaceholder:
      '예) 신규 기능(구독 결제) 도입 PRD 작성해줘. 목표/범위/요구사항/리스크/일정까지 포함.',
    baseRules: [
      '당신은 문서화에 강한 프로젝트 매니저(PM)입니다.',
      '모호한 정보는 질문으로 드러내고, 답이 없으면 가정/리스크로 분리해 명시하세요.',
      '문서는 “읽는 사람이 바로 실행할 수 있게” 구체적으로 작성하세요.',
      '결정사항/미결정사항/액션아이템을 분리해서 기록하세요.',
    ],
    outputRules: [
      '출력은 Markdown으로 작성',
      '기본 구조: 1) 요약 2) 배경/문제 3) 목표/성공지표 4) 범위/비범위 5) 요구사항(기능/비기능) 6) 사용자 시나리오 7) 일정/마일스톤 8) R&R 9) 리스크/대응 10) 오픈 이슈/결정 필요사항',
      '표가 유용한 곳(일정/R&R/리스크)은 표로 작성',
    ],
    points: [
      {
        id: 'goal',
        label: '목표/성공지표(KPI)',
        description: '측정 가능한 정의가 핵심',
        snippet: '목표와 성공 지표(KPI/측정 방식/목표치)를 반드시 포함해줘.',
        recommended: true,
        detailOptions: ['전환율', '리텐션', '활성 사용자(DAU/WAU/MAU)', 'ARPU', 'NPS', 'CSAT'],
      },
      {
        id: 'scope',
        label: '범위/비범위',
        description: '스코프 크립 방지',
        snippet: '범위(In)와 비범위(Out)를 명확히 구분해줘.',
        recommended: true,
        detailOptions: ['MVP 정의', 'Phase 1/2', 'In/Out 예시 포함', '비범위에 이유 작성'],
      },
      {
        id: 'req',
        label: '요구사항(기능/비기능)',
        description: '우선순위까지',
        snippet: '요구사항을 기능/비기능으로 나누고 우선순위(Must/Should/Could)를 붙여줘.',
        recommended: true,
        detailOptions: ['MoSCoW', 'Acceptance Criteria', '보안/권한', '성능', '로그/모니터링', 'API 요구사항'],
        defaultDetails: ['MoSCoW', 'Acceptance Criteria'],
      },
      {
        id: 'risks',
        label: '리스크/대응',
        description: '표로 관리',
        snippet: '리스크(원인/영향/가능성/대응)를 표로 정리해줘.',
        detailOptions: ['기술 리스크', '일정 리스크', '정책/약관', '외부 의존성', '운영/CS'],
      },
      {
        id: 'timeline',
        label: '일정/마일스톤',
        description: '의존성 포함',
        snippet: '현실적인 일정/마일스톤과 의존성을 함께 제시해줘.',
        recommended: true,
        detailOptions: ['주차별 계획', '마일스톤 게이트', '의존성 명시', '버퍼 포함'],
        defaultDetails: ['주차별 계획', '의존성 명시'],
      },
      {
        id: 'rr',
        label: 'R&R',
        description: '누가 무엇을',
        snippet: 'R&R(역할/책임/승인자)을 표로 정리해줘.',
        detailOptions: ['RACI', '승인자(Approver)', '협업 부서', '운영/CS 포함'],
      },
      {
        id: 'decisions',
        label: '의사결정/오픈 이슈',
        description: '결정 필요 사항 정리',
        snippet: '결정사항/미결정사항(오픈 이슈)/결정 필요 주체를 분리해줘.',
        detailOptions: ['의사결정 로그', '오너 지정', '데드라인', '의존성 연결'],
      },
    ],
  },
}

function createInitialState(cfg: RoleConfig): RoleState {
  const pointText = Object.fromEntries(
    cfg.points.map((p) => [p.id, p.snippet])
  ) as Record<string, string>

  const pointDetails = Object.fromEntries(
    cfg.points.map((p) => [p.id, p.defaultDetails ?? []])
  ) as Record<string, string[]>

  const selectedPointIds = cfg.points.filter((p) => p.recommended).map((p) => p.id)

  return {
    task: '',
    selectedPointIds,
    pointText,
    pointDetails,
  }
}

function buildPrompt(role: RoleKey, state: RoleState) {
  const cfg = ROLE_CONFIGS[role]
  const taskText = state.task.trim() ? state.task.trim() : cfg.taskPlaceholder
  const selectedPoints = cfg.points.filter((p) => state.selectedPointIds.includes(p.id))

  const pointsText =
    selectedPoints.length > 0
      ? selectedPoints
          .map((p) => {
            const textRaw = state.pointText[p.id] ?? p.snippet
            const text = textRaw.trim() ? textRaw.trim() : p.snippet
            const details = state.pointDetails[p.id] ?? []
            const detailLine = details.length > 0 ? `  - 세부 옵션: ${details.join(', ')}` : null

            return [
              `- ${p.label}`,
              `  - 지시문: ${text}`,
              detailLine,
            ]
              .filter(Boolean)
              .join('\n')
          })
          .join('\n')
      : '- (선택된 포인트 없음)'

  return [
    `당신은 ${cfg.label} (${cfg.emoji}) 역할의 전문가입니다.`,
    '',
    '[기본 규칙]',
    ...cfg.baseRules.map((r) => `- ${r}`),
    '',
    '[사용자 요청]',
    taskText,
    '',
    '[중요 포인트(선택됨)]',
    pointsText,
    '',
    '[출력 규칙]',
    ...cfg.outputRules.map((r) => `- ${r}`),
    '',
    '마지막으로, 답변 맨 아래에 “추가로 확인하면 좋은 정보”를 3개만 제안해줘.',
  ].join('\n')
}

function uniquePush(list: string[], value: string) {
  const v = value.trim()
  if (!v) return list
  if (list.includes(v)) return list
  return [...list, v]
}

export default function PromptBuilder() {
  const [role, setRole] = useState<RoleKey>('frontend')

  const [stateByRole, setStateByRole] = useState<Record<RoleKey, RoleState>>(() => ({
    frontend: createInitialState(ROLE_CONFIGS.frontend),
    ppt: createInitialState(ROLE_CONFIGS.ppt),
    pm: createInitialState(ROLE_CONFIGS.pm),
  }))

  const [selectDraft, setSelectDraft] = useState<Record<string, string>>({})
  const [customDraft, setCustomDraft] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  const cfg = ROLE_CONFIGS[role]
  const state = stateByRole[role]

  const prompt = useMemo(() => {
    return buildPrompt(role, state)
  }, [role, state])

  const setRoleTask = (value: string) => {
    setStateByRole((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        task: value,
      },
    }))
  }

  const togglePoint = (pointId: string) => {
    setStateByRole((prev) => {
      const current = prev[role]
      const exists = current.selectedPointIds.includes(pointId)
      const nextSelected = exists
        ? current.selectedPointIds.filter((id) => id !== pointId)
        : [...current.selectedPointIds, pointId]

      return {
        ...prev,
        [role]: {
          ...current,
          selectedPointIds: nextSelected,
        },
      }
    })
  }

  const setPointText = (pointId: string, value: string) => {
    setStateByRole((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        pointText: {
          ...prev[role].pointText,
          [pointId]: value,
        },
      },
    }))
  }

  const addDetailFromSelect = (pointId: string) => {
    const key = `${role}:${pointId}`
    const value = (selectDraft[key] ?? '').trim()
    if (!value) return

    setStateByRole((prev) => {
      const current = prev[role]
      const prevList = current.pointDetails[pointId] ?? []
      return {
        ...prev,
        [role]: {
          ...current,
          pointDetails: {
            ...current.pointDetails,
            [pointId]: uniquePush(prevList, value),
          },
        },
      }
    })

    setSelectDraft((prev) => ({
      ...prev,
      [key]: '',
    }))
  }

  const addDetailFromCustom = (pointId: string) => {
    const key = `${role}:${pointId}`
    const value = (customDraft[key] ?? '').trim()
    if (!value) return

    setStateByRole((prev) => {
      const current = prev[role]
      const prevList = current.pointDetails[pointId] ?? []
      return {
        ...prev,
        [role]: {
          ...current,
          pointDetails: {
            ...current.pointDetails,
            [pointId]: uniquePush(prevList, value),
          },
        },
      }
    })

    setCustomDraft((prev) => ({
      ...prev,
      [key]: '',
    }))
  }

  const removeDetail = (pointId: string, value: string) => {
    setStateByRole((prev) => {
      const current = prev[role]
      const prevList = current.pointDetails[pointId] ?? []
      const nextList = prevList.filter((x) => x !== value)

      return {
        ...prev,
        [role]: {
          ...current,
          pointDetails: {
            ...current.pointDetails,
            [pointId]: nextList,
          },
        },
      }
    })
  }

  const selectAll = () => {
    setStateByRole((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        selectedPointIds: cfg.points.map((p) => p.id),
      },
    }))
  }

  const clearAll = () => {
    setStateByRole((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        selectedPointIds: [],
      },
    }))
  }

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = prompt
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    }
  }

  return (
    <Page>
      <Shell>
        <Top>
          <Title>
            <span className="accent">업무 프롬프트 생성기</span>
          </Title>
          <Desc>
            역할을 고르고, 포인트를 체크한 다음 <b>세부 옵션</b>까지 추가해서 프롬프트를 “진짜 실무용”으로 만들자.
          </Desc>
        </Top>

        <RoleTabs role="tablist" aria-label="역할 선택">
          {(
            [
              { key: 'frontend', label: '프론트엔드', emoji: ROLE_CONFIGS.frontend.emoji },
              { key: 'ppt', label: 'PPT 디자이너', emoji: ROLE_CONFIGS.ppt.emoji },
              { key: 'pm', label: 'PM(문서)', emoji: ROLE_CONFIGS.pm.emoji },
            ] as const
          ).map((item) => (
            <RoleTab
              key={item.key}
              type="button"
              role="tab"
              aria-selected={role === item.key}
              $active={role === item.key}
              onClick={() => setRole(item.key)}
            >
              <span className="emoji">{item.emoji}</span>
              <span className="label">{item.label}</span>
            </RoleTab>
          ))}
        </RoleTabs>

        <Grid>
          <Card>
            <CardHead>
              <CardTitle>
                <span className="accent">
                  {cfg.emoji} {cfg.label}
                </span>
              </CardTitle>
              <CardHelp>{cfg.help}</CardHelp>
            </CardHead>

            <CardScroll>
              <Section>
                <SectionTitle className="accent">요청 내용</SectionTitle>
                <TaskArea
                  value={state.task}
                  onChange={(e) => setRoleTask(e.target.value)}
                  placeholder={cfg.taskPlaceholder}
                />
              </Section>

              <Section>
                <SectionRow>
                  <SectionTitle className="accent">포인트 선택</SectionTitle>
                  <MiniActions>
                    <MiniButton type="button" onClick={selectAll}>
                      전체 선택
                    </MiniButton>
                    <MiniButton type="button" onClick={clearAll}>
                      전체 해제
                    </MiniButton>
                  </MiniActions>
                </SectionRow>

                <PointList>
                  {cfg.points.map((p) => {
                    const checked = state.selectedPointIds.includes(p.id)
                    const key = `${role}:${p.id}`

                    const details = state.pointDetails[p.id] ?? []
                    const hasSelect = (p.detailOptions?.length ?? 0) > 0

                    return (
                      <PointCard key={p.id} $active={checked}>
                        <PointHeader>
                          <PointCheck
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePoint(p.id)}
                            aria-label={`${p.label} 선택`}
                          />
                          <PointHeaderText>
                            <PointNameRow>
                              <PointName>{p.label}</PointName>
                              {p.recommended ? <Badge>추천</Badge> : null}
                            </PointNameRow>
                            {p.description ? <PointDesc>{p.description}</PointDesc> : null}
                          </PointHeaderText>
                        </PointHeader>

                        {checked ? (
                          <PointBody>
                            <Field>
                              <FieldLabel>기본 지시문 (편집 가능)</FieldLabel>
                              <PointTextArea
                                value={state.pointText[p.id] ?? p.snippet}
                                onChange={(e) => setPointText(p.id, e.target.value)}
                                placeholder={p.snippet}
                              />
                            </Field>

                            <Field>
                              <FieldLabel>세부 옵션 추가</FieldLabel>

                              {hasSelect ? (
                                <Row>
                                  <Select
                                    value={selectDraft[key] ?? ''}
                                    onChange={(e) =>
                                      setSelectDraft((prev) => ({
                                        ...prev,
                                        [key]: e.target.value,
                                      }))
                                    }
                                  >
                                    <option value="">옵션 선택…</option>
                                    {p.detailOptions!.map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </Select>
                                  <AddButton type="button" onClick={() => addDetailFromSelect(p.id)}>
                                    + 추가
                                  </AddButton>
                                </Row>
                              ) : (
                                <MutedHint>
                                  이 포인트는 프리셋 옵션이 없어서 “직접 입력”으로 추가해줘.
                                </MutedHint>
                              )}

                              <Row>
                                <Input
                                  value={customDraft[key] ?? ''}
                                  onChange={(e) =>
                                    setCustomDraft((prev) => ({
                                      ...prev,
                                      [key]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault()
                                      addDetailFromCustom(p.id)
                                    }
                                  }}
                                  placeholder="직접 입력해서 옵션 추가 (Enter 가능)"
                                />
                                <AddButton type="button" onClick={() => addDetailFromCustom(p.id)}>
                                  + 추가
                                </AddButton>
                              </Row>

                              {details.length > 0 ? (
                                <ChipWrap aria-label="선택한 세부 옵션">
                                  {details.map((d) => (
                                    <Chip key={d}>
                                      <span className="text">{d}</span>
                                      <ChipX
                                        type="button"
                                        onClick={() => removeDetail(p.id, d)}
                                        aria-label={`${d} 삭제`}
                                      >
                                        ×
                                      </ChipX>
                                    </Chip>
                                  ))}
                                </ChipWrap>
                              ) : (
                                <MutedHint>
                                  아직 추가된 세부 옵션이 없어요. 필요한 만큼 붙여서 디테일을 올려봐.
                                </MutedHint>
                              )}
                            </Field>
                          </PointBody>
                        ) : null}
                      </PointCard>
                    )
                  })}
                </PointList>
              </Section>
            </CardScroll>
          </Card>

          <Card>
            <CardHead>
              <CardTitle className="accent">완성 프롬프트</CardTitle>
              <CardHelp>
                아래 텍스트는 선택/편집 사항이 <b>즉시 반영</b>돼. 그대로 복사해서 쓰면 끝.
              </CardHelp>
            </CardHead>

            <RightBody>
              <PromptArea value={prompt} readOnly />

              <CopyRow>
                <PrimaryButton type="button" onClick={onCopy}>
                  {copied ? '✅ 복사 완료' : '📋 프롬프트 복사'}
                </PrimaryButton>
                <SmallNote>
                  * 클립보드 복사는 보통 <kbd>HTTPS</kbd> 또는 <kbd>localhost</kbd>에서 정상 동작해.
                </SmallNote>
              </CopyRow>
            </RightBody>
          </Card>
        </Grid>

        <Footer>
          <FooterText>
            포인트 폰트: <span className="accent">Paperlogy</span> / 기본 폰트: Pretendard
          </FooterText>
        </Footer>
      </Shell>
    </Page>
  )
}

const Page = styled.main`
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  padding: 38px 18px;
`

const Shell = styled.div`
  max-width: 1120px;
  margin: 0 auto;

  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
`

const Top = styled.header`
  margin-bottom: 14px;
`

const Title = styled.h1`
  margin: 0;
  font-size: 34px;
  letter-spacing: -0.03em;

  .accent {
    font-family: var(--font-accent);
  }
`

const Desc = styled.p`
  margin: 10px 0 0;
  color: var(--muted);
  line-height: 1.7;

  b {
    color: var(--text);
  }
`

const RoleTabs = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;

  margin: 18px 0 16px;
`

const RoleTab = styled.button<{ $active: boolean }>`
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--text);
  border-radius: 14px;
  padding: 12px 12px;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  box-shadow: 0 10px 18px rgba(17, 24, 39, 0.04);

  transition: transform 120ms ease, background 120ms ease, border-color 120ms ease, box-shadow 120ms ease;

  .emoji {
    font-size: 18px;
  }

  .label {
    font-family: var(--font-accent);
    letter-spacing: -0.01em;
  }

  &:hover {
    transform: translateY(-1px);
    border-color: var(--border-strong);
    box-shadow: 0 14px 24px rgba(17, 24, 39, 0.06);
  }

  ${({ $active }) =>
    $active
      ? css`
          border-color: var(--accent-border);
          background: linear-gradient(180deg, rgba(79, 70, 229, 0.10), rgba(79, 70, 229, 0.06));
        `
      : css`
          opacity: 0.96;
        `}
`

const Grid = styled.div`
  flex: 1;
  min-height: 0;

  display: grid;
  gap: 14px;

  grid-template-columns: 1fr;
  grid-template-rows: 1.15fr 0.85fr;

  @media (min-width: 980px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
    align-items: stretch;
  }
`

const Card = styled.section`
  border: 1px solid var(--border);
  background: var(--panel);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 18px;

  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`

const CardHead = styled.div`
  margin-bottom: 12px;
`

const CardTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  letter-spacing: -0.01em;

  &.accent {
    font-family: var(--font-accent);
  }

  .accent {
    font-family: var(--font-accent);
  }
`

const CardHelp = styled.p`
  margin: 8px 0 0;
  color: var(--muted);
  line-height: 1.65;
`

const CardScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  padding-right: 6px;

  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(17, 24, 39, 0.14);
    border-radius: 999px;
    border: 3px solid transparent;
    background-clip: content-box;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
`

const RightBody = styled.div`
  flex: 1;
  min-height: 0;

  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Section = styled.div`
  margin-top: 16px;
`

const SectionTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--text);

  &.accent {
    font-family: var(--font-accent);
  }
`

const SectionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  margin-bottom: 10px;
`

const MiniActions = styled.div`
  display: flex;
  gap: 8px;
`

const MiniButton = styled.button`
  border: 1px solid var(--border);
  background: var(--panel-soft);
  color: var(--text);
  border-radius: 999px;
  padding: 8px 10px;
  cursor: pointer;

  font-size: 12px;

  transition: background 120ms ease, border-color 120ms ease, transform 120ms ease;

  &:hover {
    background: rgba(79, 70, 229, 0.06);
    border-color: var(--border-strong);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0px);
  }
`

const TaskArea = styled.textarea`
  width: 100%;
  min-height: 112px;
  resize: vertical;

  border: 1px solid var(--border);
  background: #ffffff;
  color: var(--text);
  border-radius: 14px;
  padding: 12px 12px;

  font-family: var(--font-base);
  line-height: 1.65;
  outline: none;

  box-shadow: inset 0 1px 0 rgba(17, 24, 39, 0.02);

  &:focus {
    border-color: var(--accent-border);
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.10);
  }

  &::placeholder {
    color: rgba(107, 114, 128, 0.70);
  }
`

const PointList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const PointCard = styled.div<{ $active: boolean }>`
  border: 1px solid var(--border);
  border-radius: 16px;
  background: #ffffff;

  overflow: hidden;

  transition: border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease;

  ${({ $active }) =>
    $active
      ? css`
          border-color: var(--accent-border);
          box-shadow: 0 14px 28px rgba(79, 70, 229, 0.06);
        `
      : css`
          box-shadow: 0 10px 22px rgba(17, 24, 39, 0.04);
        `}

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ $active }) => ($active ? 'var(--accent-border)' : 'var(--border-strong)')};
  }
`

const PointHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;

  padding: 12px 12px;

  background: linear-gradient(180deg, rgba(79, 70, 229, 0.05), rgba(255, 255, 255, 0.0));
`

const PointCheck = styled.input`
  margin-top: 2px;
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
  cursor: pointer;
`

const PointHeaderText = styled.div`
  flex: 1;
  min-width: 0;
`

const PointNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const PointName = styled.div`
  font-size: 14px;
  color: var(--text);
  letter-spacing: -0.01em;
  font-family: var(--font-accent);
`

const Badge = styled.span`
  border: 1px solid var(--accent-border);
  background: var(--accent-weak);
  color: var(--accent);

  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;

  font-family: var(--font-accent);
`

const PointDesc = styled.div`
  margin-top: 6px;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.5;
`

const PointBody = styled.div`
  padding: 12px 12px 14px;
`

const Field = styled.div`
  margin-top: 12px;

  &:first-child {
    margin-top: 0;
  }
`

const FieldLabel = styled.div`
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 8px;
`

const PointTextArea = styled.textarea`
  width: 100%;
  min-height: 84px;
  resize: vertical;

  border: 1px solid var(--border);
  background: #ffffff;
  color: var(--text);
  border-radius: 14px;
  padding: 10px 10px;

  font-family: var(--font-base);
  line-height: 1.6;
  outline: none;

  &:focus {
    border-color: var(--accent-border);
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.10);
  }
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;

  margin-top: 8px;

  &:first-of-type {
    margin-top: 0;
  }
`

const Select = styled.select`
  width: 100%;
  border: 1px solid var(--border);
  background: #ffffff;
  color: var(--text);
  border-radius: 12px;
  padding: 10px 10px;

  font-family: var(--font-base);
  outline: none;

  &:focus {
    border-color: var(--accent-border);
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.10);
  }
`

const Input = styled.input`
  width: 100%;
  border: 1px solid var(--border);
  background: #ffffff;
  color: var(--text);
  border-radius: 12px;
  padding: 10px 10px;

  font-family: var(--font-base);
  outline: none;

  &:focus {
    border-color: var(--accent-border);
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.10);
  }

  &::placeholder {
    color: rgba(107, 114, 128, 0.70);
  }
`

const AddButton = styled.button`
  border: 1px solid var(--border);
  background: var(--panel-soft);
  color: var(--text);

  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;

  font-family: var(--font-accent);
  letter-spacing: -0.01em;

  transition: background 120ms ease, border-color 120ms ease, transform 120ms ease;

  &:hover {
    background: rgba(79, 70, 229, 0.07);
    border-color: var(--border-strong);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0px);
  }
`

const ChipWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  margin-top: 10px;
`

const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;

  border: 1px solid var(--border);
  background: #ffffff;
  border-radius: 999px;
  padding: 7px 10px;

  box-shadow: 0 8px 14px rgba(17, 24, 39, 0.04);

  .text {
    font-size: 12px;
    color: var(--text);
    white-space: nowrap;
  }
`

const ChipX = styled.button`
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;

  font-size: 16px;
  line-height: 1;

  padding: 0 2px;

  &:hover {
    color: var(--text);
  }
`

const MutedHint = styled.div`
  margin-top: 10px;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.5;
`

const PromptArea = styled.textarea`
  flex: 1;
  min-height: 0;
  resize: none;

  width: 100%;

  border: 1px solid var(--border);
  background: #ffffff;
  color: var(--text);
  border-radius: 16px;
  padding: 12px 12px;

  font-family: var(--font-base);
  line-height: 1.65;
  outline: none;

  &:focus {
    border-color: var(--accent-border);
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.10);
  }
`

const CopyRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const PrimaryButton = styled.button`
  border: 1px solid var(--accent-border);
  background: linear-gradient(180deg, rgba(79, 70, 229, 0.14), rgba(79, 70, 229, 0.10));
  color: var(--text);

  border-radius: 16px;
  padding: 12px 12px;
  cursor: pointer;

  font-family: var(--font-accent);
  letter-spacing: -0.01em;

  transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 26px rgba(79, 70, 229, 0.10);
    background: linear-gradient(180deg, rgba(79, 70, 229, 0.18), rgba(79, 70, 229, 0.12));
  }

  &:active {
    transform: translateY(0px);
  }
`

const SmallNote = styled.div`
  color: var(--muted);
  font-size: 12px;
  line-height: 1.4;

  kbd {
    border: 1px solid var(--border);
    background: var(--panel-soft);
    padding: 2px 6px;
    border-radius: 8px;
  }
`

const Footer = styled.footer`
  margin-top: 12px;
`

const FooterText = styled.div`
  color: var(--muted);
  font-size: 12px;

  .accent {
    font-family: var(--font-accent);
    color: var(--text);
  }
`