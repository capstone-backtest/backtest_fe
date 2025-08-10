# 🔬 백테스팅 프론트엔드 대시보드

## 📋 개요

백테스팅 API 서버의 결과를 시각화하는 현대적인 React 프론트엔드 애플리케이션입니다. Bootstrap과 Recharts를 활용한 전문적인 금융 대시보드로, 투자 전략의 성과를 직관적으로 분석할 수 있습니다.

## ✨ 주요 기능

### 📊 인터랙티브 차트 시각화
- **OHLC 캔들스틱 차트**: 가격 데이터와 거래량을 동시에 표시
- **기술 지표 오버레이**: SMA, RSI, Bollinger Bands, MACD 지원
- **자산 곡선**: 누적 수익률과 드로우다운 분석
- **거래 마커**: 매수/매도 시점을 차트에 표시
- **거래 손익 분석**: 개별 거래의 성과를 스캐터 차트로 시각화

### 🎯 다중 투자 전략 지원
- **Buy & Hold**: 매수 후 보유 전략
- **SMA Crossover**: 이동평균 교차 전략
- **RSI Strategy**: 과매수/과매도 전략
- **Bollinger Bands**: 볼린저 밴드 전략
- **MACD Strategy**: MACD 교차 전략

### ⚙️ 사용자 친화적 인터페이스
- **동적 파라미터 설정**: 전략별 맞춤 파라미터 입력
- **프리셋 버튼**: AAPL 2023, TSLA 2022, NVDA 2023 등
- **실시간 로딩 상태**: 스피너와 진행률 표시
- **반응형 디자인**: 모바일/태블릿/데스크톱 대응

### 📈 성과 분석 대시보드
- **6개 핵심 지표**: 수익률, 거래 수, 승률, 최대 손실, 샤프 비율, 수익 팩터
- **색상 코딩**: 성과에 따른 시각적 구분
- **툴팁 설명**: 각 지표의 의미와 계산 방법 안내
- **교육적 가이드**: 초보자를 위한 금융 용어 설명

## 🚀 기술 스택

### 프론트엔드 프레임워크
- **React 18** + **TypeScript**: 타입 안전성과 최신 기능
- **Vite**: 빠른 개발 서버와 번들링
- **ESLint**: 코드 품질 관리

### UI/UX 라이브러리
- **Bootstrap 5.3.6**: 반응형 컴포넌트와 그리드 시스템
- **React Bootstrap 2.10.10**: React 친화적 Bootstrap 컴포넌트
- **Tailwind CSS 3.3**: 유틸리티 우선 스타일링

### 데이터 시각화
- **Recharts 2.9.0**: React 기반 차트 라이브러리
- **Responsive Charts**: 화면 크기에 따른 자동 조정
- **Custom Tooltips**: 상세한 데이터 정보 표시

### 네트워킹
- **Axios 1.6.0**: HTTP 클라이언트 (향후 사용)
- **Fetch API**: 백테스팅 API 호출
- **Vite Proxy**: 개발 환경 API 프록시

## 🛠️ 설치 및 실행

### 1. 환경 요구사항

```bash
# Node.js 16+ 필요
node --version  # v16.0.0 이상
npm --version   # v8.0.0 이상
```

### 2. 프로젝트 설치

```bash
# 저장소 클론
git clone <repository-url>
cd front_server

# 의존성 설치
npm install

# 타입 검사
npm run lint
```

### 3. 개발 서버 실행

```bash
# 개발 모드 시작
npm run dev

# 브라우저에서 확인
# http://localhost:5173
```

### 4. 프로덕션 빌드

```bash
# TypeScript 컴파일 + Vite 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 🔗 API 서버 연동

### 백엔드 API 설정

```bash
# API 서버가 실행 중이어야 함
cd ../api_server
python run_server.py  # http://localhost:8000
```

### 프록시 설정

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

## 📁 프로젝트 구조

```
front_server/
├── public/
├── src/
│   ├── App.tsx              # 메인 애플리케이션 (843줄)
│   ├── main.tsx            # React 진입점
│   ├── index.css           # 글로벌 스타일
│   └── types/
│       └── api.ts          # API 타입 정의
├── package.json            # 의존성 및 스크립트
├── vite.config.ts         # Vite 설정
├── tsconfig.json          # TypeScript 설정
├── tailwind.config.js     # Tailwind 설정
└── README.md              # 이 파일
```

## 🎨 주요 컴포넌트

### 📈 OHLCChart
```typescript
// OHLC 캔들스틱 + 기술 지표 + 거래량
<ComposedChart data={mergedData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis yAxisId="price" orientation="right" />
  <YAxis yAxisId="volume" orientation="left" />
  <Bar yAxisId="volume" dataKey="volume" fill="#6c757d" />
  <Line yAxisId="price" dataKey="close" stroke="#0d6efd" />
  <Line yAxisId="price" dataKey="SMA_20" stroke="#ff7300" />
</ComposedChart>
```

**특징:**
- 듀얼 Y축 (가격/거래량)
- 기술 지표 오버레이
- 거래 마커 표시
- 실시간 툴팁

### 💰 EquityChart
```typescript
// 자산 곡선 + 드로우다운
<ComposedChart data={safeData}>
  <Line dataKey="return_pct" stroke="#198754" name="수익률 (%)" />
  <Area dataKey="drawdown_pct" stroke="#dc3545" fill="#dc3545" 
        fillOpacity={0.3} name="드로우다운 (%)" />
  <ReferenceLine y={0} stroke="#6c757d" strokeDasharray="2 2" />
</ComposedChart>
```

**특징:**
- 누적 수익률 라인
- 드로우다운 영역 차트
- 손익분기점 기준선

### 📊 TradesChart
```typescript
// 거래 손익 스캐터 차트
<ScatterChart data={exitTrades}>
  <Scatter dataKey="pnl_pct" fill="#0d6efd">
    {exitTrades.map((trade, index) => (
      <Cell key={index} fill={getTradeColor(trade.pnl_pct || 0)} />
    ))}
  </Scatter>
</ScatterChart>
```

**특징:**
- 개별 거래 손익 표시
- 수익/손실 색상 구분
- 상세 툴팁 정보

### 📋 StatsSummary
```typescript
// 성과 지표 카드
<OverlayTrigger overlay={<Tooltip>{item.description}</Tooltip>}>
  <Card className="h-100 shadow-sm border-0">
    <Card.Body className="text-center">
      <div className="fs-2 mb-2">{item.icon}</div>
      <Card.Title className="fs-6 text-muted">{item.label}</Card.Title>
      <Badge bg={item.variant} className="fs-5 px-3 py-2">
        {item.value}
      </Badge>
    </Card.Body>
  </Card>
</OverlayTrigger>
```

**특징:**
- 6개 핵심 지표
- 호버 툴팁 설명
- Bootstrap 배지 스타일링

## ⚙️ 백테스트 파라미터 설정

### 기본 파라미터
```typescript
interface BacktestParams {
  ticker: string;           // 주식 티커 (예: AAPL)
  start_date: string;       // 시작 날짜 (YYYY-MM-DD)
  end_date: string;         // 종료 날짜 (YYYY-MM-DD)
  initial_cash: number;     // 초기 투자금 ($1,000 이상)
  strategy: string;         // 전략명
  strategy_params: object;  // 전략별 파라미터
}
```

### 전략별 파라미터

#### SMA Crossover
```typescript
{
  short_window: 10,    // 단기 이동평균 (5-50일)
  long_window: 20      // 장기 이동평균 (10-200일)
}
```

#### RSI Strategy
```typescript
{
  rsi_period: 14,      // RSI 기간 (5-50일)
  rsi_upper: 70,       // 과매수 임계값 (50-90)
  rsi_lower: 30        // 과매도 임계값 (10-50)
}
```

#### Bollinger Bands
```typescript
{
  period: 20,          // 이동평균 기간 (10-50일)
  std_dev: 2.0         // 표준편차 배수 (1.0-3.0)
}
```

#### MACD Strategy
```typescript
{
  fast_period: 12,     // 빠른 EMA (5-20일)
  slow_period: 26,     // 느린 EMA (20-50일)
  signal_period: 9     // 시그널 라인 (5-15일)
}
```

## 🎯 사용 가이드

### 1. 기본 백테스트 실행

1. **티커 입력**: 원하는 주식 심볼 입력 (예: AAPL, GOOGL)
2. **기간 설정**: 시작/종료 날짜 선택
3. **투자금 설정**: 초기 투자 금액 입력 ($1,000 이상)
4. **전략 선택**: 5가지 전략 중 하나 선택
5. **파라미터 조정**: 선택한 전략의 파라미터 설정
6. **실행**: "백테스트 실행" 버튼 클릭

### 2. 프리셋 사용

빠른 테스트를 위해 미리 정의된 프리셋을 사용할 수 있습니다:

- **AAPL 2023**: Apple 2023년 데이터
- **TSLA 2022**: Tesla 2022년 데이터  
- **NVDA 2023**: NVIDIA 2023년 데이터

### 3. 결과 해석

#### 성과 지표 카드
- **총 수익률**: 투자 원금 대비 총 수익의 비율
- **총 거래 수**: 백테스트 기간 동안 실행된 거래 횟수
- **승률**: 전체 거래 중 수익을 낸 거래의 비율
- **최대 손실**: 포트폴리오가 최고점에서 최대로 떨어진 비율
- **샤프 비율**: 위험 대비 수익률을 나타내는 지표
- **수익 팩터**: 총 이익을 총 손실로 나눈 값

#### 차트 분석
- **파란색 선**: 매일의 종가 움직임
- **회색 막대**: 거래량 (얼마나 많이 거래되었는지)
- **주황색 선**: SMA_20 (최근 20일 평균 주가)
- **점선**: 매수/매도 시점
- **초록색 영역**: 누적 수익률
- **빨간색 영역**: 드로우다운 (손실 구간)

## 🔧 개발 환경 설정

### TypeScript 설정

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### ESLint 설정

```bash
# 코드 품질 검사
npm run lint

# 자동 수정 가능한 오류 수정
npm run lint -- --fix
```

### Tailwind CSS 설정

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 🎨 커스터마이징

### 차트 색상 변경

```typescript
// App.tsx에서 색상 상수 정의
const CHART_COLORS = {
  primary: "#0d6efd",      // 파란색
  success: "#198754",      // 초록색
  danger: "#dc3545",       // 빨간색
  warning: "#ffc107",      // 노란색
  info: "#0dcaf0",         // 하늘색
  secondary: "#6c757d"     // 회색
};
```

### 새로운 지표 추가

1. **타입 정의**: `src/types/api.ts`에 새 지표 타입 추가
2. **UI 컴포넌트**: `App.tsx`에 새 지표 카드 추가
3. **차트 연동**: 해당 차트 컴포넌트에 새 데이터 시리즈 추가

### 반응형 레이아웃 수정

```typescript
// Bootstrap 그리드 시스템 사용
<Row>
  <Col md={6} lg={4} className="mb-3">
    <Card>...</Card>
  </Col>
</Row>
```

## 🚨 문제 해결

### 일반적인 오류

#### API 연결 실패
```bash
# 1. API 서버 상태 확인
curl http://localhost:8000/health

# 2. 프록시 설정 확인
# vite.config.ts의 proxy 설정을 점검
```

#### 차트 렌더링 오류
```typescript
// 데이터 안전성 검사 추가
const safeData = data || [];
const safeIndicators = indicators || [];
```

#### 타입 오류
```bash
# TypeScript 컴파일 확인
npm run build

# 타입 정의 파일 확인
# src/types/api.ts 업데이트
```

#### 스타일링 문제
```bash
# Tailwind CSS 빌드 확인
npm run build

# Bootstrap CSS 로딩 확인
# main.tsx에서 import 'bootstrap/dist/css/bootstrap.min.css'
```

### 성능 최적화

#### 차트 성능 향상
```typescript
// 데이터 메모이제이션
const memoizedData = useMemo(() => {
  return processChartData(rawData);
}, [rawData]);

// 컴포넌트 메모이제이션
const OptimizedChart = React.memo(({ data }) => {
  return <LineChart data={data} />;
});
```

#### 번들 크기 최적화
```bash
# 번들 분석
npm run build
npm run preview

# 불필요한 의존성 제거
npm uninstall unused-package
```

## 🔮 향후 개발 계획

### 예정된 기능
- [ ] 다크 모드 지원
- [ ] 차트 데이터 내보내기 (CSV/Excel)
- [ ] 커스텀 지표 생성기
- [ ] 실시간 데이터 스트리밍
- [ ] 포트폴리오 백테스팅
- [ ] 모바일 앱 (React Native)

### 기술 개선
- [ ] React Query를 통한 서버 상태 관리
- [ ] Storybook을 통한 컴포넌트 문서화
- [ ] Jest + Testing Library 테스트 추가
- [ ] GitHub Actions CI/CD 구축
- [ ] PWA (Progressive Web App) 지원

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 발생하거나 기능 요청이 있으시면:

- **GitHub Issues**: 버그 리포트 및 기능 요청
- **Discussions**: 일반적인 질문과 토론
- **Email**: 직접 문의

---

**주의사항**: 이 도구는 교육 및 연구 목적으로 제작되었습니다. 실제 투자 결정에 사용하기 전에 충분한 검토와 추가 분석이 필요합니다. 과거 성과가 미래 수익을 보장하지 않습니다. 