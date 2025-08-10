# 🧩 컴포넌트 가이드

## 📋 개요

백테스팅 프론트엔드의 모든 UI 컴포넌트를 상세히 설명하는 가이드입니다. 각 컴포넌트의 기능, 프로퍼티, 스타일링 방법을 다룹니다.

## 🏗️ 컴포넌트 계층 구조

```
App.tsx (843줄)
├── 🎨 HeaderSection
│   ├── Container
│   ├── Alert (소개 배너)
│   └── h1 (제목)
├── 📋 InputFormSection  
│   ├── Card (백테스트 설정)
│   ├── Row/Col (그리드 레이아웃)
│   ├── Form.Group (입력 필드들)
│   ├── StrategyParamsInput (동적 파라미터)
│   └── Button (실행/프리셋)
├── 📊 ResultsSection
│   ├── StatsSummary (성과 지표 카드들)
│   ├── ChartsSection
│   │   ├── OHLCChart
│   │   ├── EquityChart  
│   │   └── TradesChart
│   └── EducationalSection (용어 설명)
└── 🔄 LoadingAndErrorSection
    ├── Spinner (로딩)
    └── Alert (에러 메시지)
```

## 🎨 HeaderSection

### 기능
- 앱 제목 및 소개 표시
- 백테스팅 개념 설명
- 투자 위험 경고

### 구현
```typescript
<Container fluid className="py-4" style={{ backgroundColor: '#f8f9fa' }}>
  <Alert variant="info" className="mb-4">
    <Alert.Heading>📈 백테스팅이란?</Alert.Heading>
    <p>
      백테스팅은 과거 데이터를 사용하여 투자 전략의 성과를 검증하는 방법입니다. 
      실제 투자하기 전에 전략의 수익성과 위험을 미리 평가할 수 있습니다.
    </p>
    <hr />
    <p className="mb-0">
      <strong>⚠️ 주의:</strong> 과거 성과가 미래 수익을 보장하지 않습니다. 
      실제 투자 결정 시에는 충분한 추가 분석이 필요합니다.
    </p>
  </Alert>
  
  <h1 className="text-center mb-4">🔬 백테스팅 대시보드</h1>
</Container>
```

### 스타일링 특징
- **Container fluid**: 전체 너비 활용
- **배경색**: 연한 회색 (`#f8f9fa`)
- **Alert 컴포넌트**: 정보 스타일 (`variant="info"`)
- **중앙 정렬**: 제목 텍스트 중앙 배치

## 📋 InputFormSection

### 기능
- 백테스트 파라미터 입력
- 전략별 동적 파라미터 설정
- 프리셋 버튼 제공
- 입력 유효성 검증

### 주요 입력 필드

#### 1. 티커 입력
```typescript
<Form.Group>
  <Form.Label>주식 티커</Form.Label>
  <Form.Control
    type="text"
    placeholder="예: AAPL, GOOGL, TSLA"
    value={backtestParams.ticker}
    onChange={(e) => handleParamChange('ticker', e.target.value.toUpperCase())}
  />
  <Form.Text className="text-muted">
    미국 주식 시장의 티커 심볼을 입력하세요.
  </Form.Text>
</Form.Group>
```

**특징:**
- 자동 대문자 변환
- 플레이스홀더로 예시 제공
- 도움말 텍스트 포함

#### 2. 날짜 선택
```typescript
<Row>
  <Col md={6}>
    <Form.Group>
      <Form.Label>시작 날짜</Form.Label>
      <Form.Control
        type="date"
        value={backtestParams.start_date}
        onChange={(e) => handleParamChange('start_date', e.target.value)}
      />
    </Form.Group>
  </Col>
  <Col md={6}>
    <Form.Group>
      <Form.Label>종료 날짜</Form.Label>
      <Form.Control
        type="date"
        value={backtestParams.end_date}
        onChange={(e) => handleParamChange('end_date', e.target.value)}
      />
    </Form.Group>
  </Col>
</Row>
```

**특징:**
- 반응형 2열 레이아웃
- HTML5 date 입력 타입
- 날짜 형식 자동 검증

#### 3. 투자금 설정
```typescript
<Form.Group>
  <Form.Label>초기 투자 금액 ($)</Form.Label>
  <Form.Control
    type="number"
    min="1000"
    max="1000000"
    step="1000"
    value={backtestParams.initial_cash}
    onChange={(e) => handleParamChange('initial_cash', parseFloat(e.target.value))}
  />
  <Form.Text className="text-muted">
    최소 $1,000 이상 입력하세요.
  </Form.Text>
</Form.Group>
```

**특징:**
- 숫자 입력 제한
- min/max/step 속성으로 범위 제한
- 1000 단위 증감

#### 4. 전략 선택
```typescript
<Form.Group>
  <Form.Label>투자 전략</Form.Label>
  <Form.Select
    value={backtestParams.strategy}
    onChange={(e) => handleParamChange('strategy', e.target.value)}
  >
    <option value="buy_and_hold">Buy & Hold (매수 후 보유)</option>
    <option value="sma_crossover">SMA Crossover (이동평균 교차)</option>
    <option value="rsi_strategy">RSI Strategy (과매수/과매도)</option>
    <option value="bollinger_bands">Bollinger Bands (볼린저 밴드)</option>
    <option value="macd_strategy">MACD Strategy (MACD 교차)</option>
  </Form.Select>
</Form.Group>
```

**특징:**
- 5가지 전략 옵션
- 한국어 설명 포함
- 선택 시 파라미터 자동 리셋

### StrategyParamsInput 컴포넌트

#### SMA Crossover 파라미터
```typescript
{strategy === 'sma_crossover' && (
  <Row>
    <Col md={6}>
      <Form.Group>
        <Form.Label>단기 이동평균 기간 (일)</Form.Label>
        <Form.Control
          type="number"
          min="5" max="50"
          value={backtestParams.strategy_params.short_window || 10}
          onChange={(e) => handleStrategyParamChange('short_window', parseInt(e.target.value))}
        />
        <Form.Text className="text-muted">5-50일 범위</Form.Text>
      </Form.Group>
    </Col>
    <Col md={6}>
      <Form.Group>
        <Form.Label>장기 이동평균 기간 (일)</Form.Label>
        <Form.Control
          type="number"
          min="10" max="200"
          value={backtestParams.strategy_params.long_window || 20}
          onChange={(e) => handleStrategyParamChange('long_window', parseInt(e.target.value))}
        />
        <Form.Text className="text-muted">10-200일 범위</Form.Text>
      </Form.Group>
    </Col>
  </Row>
)}
```

#### RSI Strategy 파라미터
```typescript
{strategy === 'rsi_strategy' && (
  <>
    <Form.Group className="mb-3">
      <Form.Label>RSI 기간 (일)</Form.Label>
      <Form.Control
        type="number"
        min="5" max="50"
        value={backtestParams.strategy_params.rsi_period || 14}
        onChange={(e) => handleStrategyParamChange('rsi_period', parseInt(e.target.value))}
      />
    </Form.Group>
    <Row>
      <Col md={6}>
        <Form.Group>
          <Form.Label>과매수 임계값</Form.Label>
          <Form.Control
            type="number"
            min="50" max="90"
            value={backtestParams.strategy_params.rsi_upper || 70}
            onChange={(e) => handleStrategyParamChange('rsi_upper', parseInt(e.target.value))}
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>과매도 임계값</Form.Label>
          <Form.Control
            type="number"
            min="10" max="50"
            value={backtestParams.strategy_params.rsi_lower || 30}
            onChange={(e) => handleStrategyParamChange('rsi_lower', parseInt(e.target.value))}
          />
        </Form.Group>
      </Col>
    </Row>
  </>
)}
```

### 프리셋 버튼 섹션
```typescript
<Row className="mb-3">
  <Col>
    <h6>빠른 시작 (프리셋)</h6>
    <ButtonGroup className="me-2 mb-2">
      <Button 
        variant="outline-primary" 
        size="sm"
        onClick={() => applyPreset('aapl_2023')}
      >
        AAPL 2023
      </Button>
      <Button 
        variant="outline-success" 
        size="sm"
        onClick={() => applyPreset('tsla_2022')}
      >
        TSLA 2022
      </Button>
      <Button 
        variant="outline-info" 
        size="sm"
        onClick={() => applyPreset('nvda_2023')}
      >
        NVDA 2023
      </Button>
    </ButtonGroup>
  </Col>
</Row>
```

**특징:**
- ButtonGroup으로 일관된 스타일
- 색상별 구분 (primary, success, info)
- 즉시 실행 기능

## 📊 StatsSummary 컴포넌트

### 기능
- 6개 핵심 성과 지표 표시
- 값에 따른 색상 코딩
- 호버 시 설명 툴팁

### 구현
```typescript
const StatsSummary: React.FC<{ stats: SummaryStats }> = ({ stats }) => {
  const statItems = [
    { 
      label: '총 수익률', 
      value: `${stats.total_return_pct.toFixed(2)}%`, 
      variant: stats.total_return_pct >= 0 ? 'success' : 'danger',
      description: '투자 원금 대비 총 수익의 비율입니다. (최종값 - 초기값) / 초기값 × 100',
      icon: '📈'
    },
    {
      label: '총 거래 수',
      value: stats.total_trades.toString(),
      variant: 'primary',
      description: '백테스트 기간 동안 실행된 총 거래 횟수입니다.',
      icon: '🔢'
    },
    // ... 더 많은 지표들
  ];

  return (
    <Row>
      {statItems.map((item, index) => (
        <Col md={6} lg={4} key={index} className="mb-3">
          <OverlayTrigger 
            overlay={<Tooltip id={`tooltip-${index}`}>{item.description}</Tooltip>}
          >
            <Card className="h-100 shadow-sm border-0 stat-card">
              <Card.Body className="text-center">
                <div className="fs-2 mb-2">{item.icon}</div>
                <Card.Title className="fs-6 text-muted mb-2">
                  {item.label}
                </Card.Title>
                <Badge bg={item.variant} className="fs-5 px-3 py-2">
                  {item.value}
                </Badge>
              </Card.Body>
            </Card>
          </OverlayTrigger>
        </Col>
      ))}
    </Row>
  );
};
```

### 지표별 색상 규칙

| 지표 | 조건 | 색상 |
|------|------|------|
| **총 수익률** | >= 0% | 초록 (success) |
|              | < 0% | 빨강 (danger) |
| **승률** | >= 60% | 초록 (success) |
|         | >= 40% | 노랑 (warning) |
|         | < 40% | 빨강 (danger) |
| **샤프 비율** | >= 1.0 | 초록 (success) |
|              | >= 0.5 | 노랑 (warning) |
|              | < 0.5 | 빨강 (danger) |

## 📈 OHLCChart 컴포넌트

### 기능
- OHLC 가격 데이터 표시
- 기술 지표 오버레이
- 거래량 바 차트
- 거래 마커 표시

### 구현
```typescript
const OHLCChart: React.FC<{
  data: ChartDataPoint[];
  indicators: IndicatorData[];
  trades: TradeMarker[];
}> = ({ data, indicators, trades }) => {
  // 데이터 안전성 검사
  const safeData = data || [];
  const safeIndicators = indicators || [];
  const safeTrades = trades || [];

  // 지표 데이터와 OHLC 데이터 병합
  const mergedData = safeData.map(ohlc => {
    const point: any = { ...ohlc };
    safeIndicators.forEach(indicator => {
      const indicatorPoint = indicator.data?.find(d => d.date === ohlc.date);
      if (indicatorPoint) {
        point[indicator.name] = indicatorPoint.value;
      }
    });
    return point;
  });

  return (
    <Card className="mb-4">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">📈 가격 차트 및 기술 지표</h5>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={mergedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            {/* 격자 */}
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            
            {/* X축: 날짜 */}
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            
            {/* Y축: 가격 (오른쪽) */}
            <YAxis 
              yAxisId="price" 
              orientation="right" 
              tick={{ fontSize: 12 }}
              domain={['dataMin * 0.95', 'dataMax * 1.05']}
            />
            
            {/* Y축: 거래량 (왼쪽) */}
            <YAxis 
              yAxisId="volume" 
              orientation="left" 
              tick={{ fontSize: 12 }}
              domain={[0, 'dataMax * 2']}
            />
            
            {/* 툴팁 */}
            <Tooltip 
              labelFormatter={(value) => `날짜: ${value}`}
              formatter={(value, name) => [
                typeof value === 'number' ? value.toFixed(2) : value,
                name
              ]}
            />
            
            {/* 범례 */}
            <Legend />
            
            {/* 거래량 바 */}
            <Bar 
              yAxisId="volume" 
              dataKey="volume" 
              fill="#6c757d" 
              opacity={0.3} 
              name="거래량"
            />
            
            {/* 종가 라인 */}
            <Line 
              yAxisId="price" 
              type="monotone" 
              dataKey="close" 
              stroke="#0d6efd" 
              strokeWidth={2} 
              dot={false} 
              name="종가"
            />
            
            {/* 동적 기술 지표 렌더링 */}
            {safeIndicators.map(indicator => (
              <Line
                key={indicator.name}
                yAxisId="price"
                type="monotone"
                dataKey={indicator.name}
                stroke={indicator.color}
                strokeWidth={1.5}
                dot={false}
                name={indicator.name}
                connectNulls={false}
              />
            ))}
            
            {/* 거래 마커 - 세로선 */}
            {safeTrades.map((trade, index) => (
              <ReferenceLine
                key={`trade-${index}`}
                x={trade.date}
                stroke={trade.type === 'entry' ? '#198754' : '#dc3545'}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};
```

### 차트 특징
- **이중 Y축**: 가격(오른쪽), 거래량(왼쪽)
- **반응형**: 화면 크기에 따라 자동 조정
- **동적 범위**: 데이터에 따라 Y축 범위 자동 설정
- **인터랙티브 툴팁**: 마우스 오버 시 상세 정보

## 💰 EquityChart 컴포넌트

### 기능
- 누적 수익률 라인 차트
- 드로우다운 영역 차트
- 손익분기점 기준선

### 구현
```typescript
const EquityChart: React.FC<{ data: EquityPoint[] }> = ({ data }) => {
  const safeData = data || [];
  
  return (
    <Card className="mb-4">
      <Card.Header className="bg-success text-white">
        <h5 className="mb-0">💰 자산 곡선 (투자 성과)</h5>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={safeData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              labelFormatter={(value) => `날짜: ${value}`}
              formatter={(value, name) => [
                `${Number(value).toFixed(2)}%`,
                name
              ]}
            />
            <Legend />
            
            {/* 수익률 라인 */}
            <Line 
              type="monotone" 
              dataKey="return_pct" 
              stroke="#198754" 
              strokeWidth={2} 
              dot={false}
              name="누적 수익률 (%)"
            />
            
            {/* 드로우다운 영역 */}
            <Area 
              type="monotone" 
              dataKey="drawdown_pct" 
              stroke="#dc3545" 
              fill="#dc3545" 
              fillOpacity={0.3}
              name="드로우다운 (%)"
            />
            
            {/* 손익분기점 기준선 */}
            <ReferenceLine 
              y={0} 
              stroke="#6c757d" 
              strokeDasharray="2 2" 
              label="손익분기점"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};
```

### 시각적 요소
- **초록색 라인**: 누적 수익률 (상승할수록 좋음)
- **빨간색 영역**: 드로우다운 (하락 구간)
- **회색 점선**: 0% 기준선

## 📊 TradesChart 컴포넌트

### 기능
- 개별 거래의 손익 표시
- 수익/손실 색상 구분
- 거래 시점 시각화

### 구현
```typescript
const TradesChart: React.FC<{ trades: TradeMarker[] }> = ({ trades }) => {
  const exitTrades = trades.filter(trade => 
    trade.type === 'exit' && trade.pnl_pct !== undefined
  );

  const getTradeColor = (pnl: number) => {
    return pnl >= 0 ? '#198754' : '#dc3545';
  };

  if (exitTrades.length === 0) {
    return (
      <Card className="mb-4">
        <Card.Header className="bg-warning text-dark">
          <h5 className="mb-0">📊 거래 분석</h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            거래 데이터가 없습니다. Buy & Hold 전략은 거래가 한 번만 발생합니다.
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header className="bg-warning text-dark">
        <h5 className="mb-0">📊 거래 분석</h5>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart data={exitTrades}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis 
              label={{ value: '손익률 (%)', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value, name, props) => [
                `${Number(value).toFixed(2)}%`,
                '손익률'
              ]}
              labelFormatter={(value) => `거래일: ${value}`}
            />
            <ReferenceLine y={0} stroke="#6c757d" strokeDasharray="2 2" />
            
            <Scatter dataKey="pnl_pct" fill="#0d6efd">
              {exitTrades.map((trade, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getTradeColor(trade.pnl_pct || 0)} 
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};
```

### 색상 규칙
- **초록색 점**: 수익 거래 (pnl_pct >= 0)
- **빨간색 점**: 손실 거래 (pnl_pct < 0)
- **회색 점선**: 손익분기점 (0%)

## 🎛️ 상태 관리 패턴

### 1. 파라미터 상태
```typescript
const [backtestParams, setBacktestParams] = useState<BacktestParams>({
  ticker: 'AAPL',
  start_date: '2023-01-01',
  end_date: '2023-12-31',
  initial_cash: 10000,
  strategy: 'buy_and_hold',
  strategy_params: {} as any
});
```

### 2. API 응답 상태
```typescript
const [chartData, setChartData] = useState<ChartDataResponse | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### 3. 이벤트 핸들러
```typescript
const handleParamChange = (key: string, value: string | number) => {
  setBacktestParams(prev => ({
    ...prev,
    [key]: value,
    // 전략 변경 시 파라미터 리셋
    ...(key === 'strategy' && {
      strategy_params: strategyDefaults[value as keyof typeof strategyDefaults] || {}
    })
  }));
};

const handleStrategyParamChange = (paramKey: string, value: number) => {
  setBacktestParams(prev => ({
    ...prev,
    strategy_params: {
      ...prev.strategy_params,
      [paramKey]: value
    }
  }));
};
```

## 🎨 스타일링 시스템

### Bootstrap 색상 팔레트
```css
--bs-primary: #0d6efd;    /* 파란색 */
--bs-success: #198754;    /* 초록색 */
--bs-danger: #dc3545;     /* 빨간색 */
--bs-warning: #ffc107;    /* 노란색 */
--bs-info: #0dcaf0;       /* 하늘색 */
--bs-secondary: #6c757d;  /* 회색 */
```

### 반응형 그리드
```typescript
<Row>
  <Col xs={12} md={6} lg={4}>  {/* 모바일: 전체, 태블릿: 절반, 데스크톱: 1/3 */}
    <Card>...</Card>
  </Col>
</Row>
```

### 커스텀 CSS 클래스
```css
.stat-card {
  transition: transform 0.2s;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
```

---

이 컴포넌트 가이드를 통해 각 UI 요소의 역할과 구현 방법을 이해하고, 필요에 따라 커스터마이징하실 수 있습니다. 