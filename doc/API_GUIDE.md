# 📡 프론트엔드 API 연동 가이드

## 📋 개요

백테스팅 프론트엔드에서 백엔드 API와 연동하는 방법을 설명하는 가이드입니다. API 호출, 데이터 변환, 에러 처리 방법을 다룹니다.

## 🔗 API 엔드포인트

### 백엔드 서버 정보
- **기본 URL**: `http://localhost:8000`
- **API 버전**: `v1`
- **프로토콜**: HTTP (개발), HTTPS (프로덕션)
- **데이터 형식**: JSON

### 주요 엔드포인트

| 메서드 | 엔드포인트 | 용도 | 상태 |
|--------|------------|------|------|
| `POST` | `/api/v1/backtest/chart-data` | 차트 데이터 조회 | ✅ 사용 중 |
| `POST` | `/api/v1/backtest/run` | 백테스트 실행 | 🚧 미사용 |
| `GET` | `/api/v1/strategies/` | 전략 목록 조회 | 🚧 미사용 |
| `GET` | `/health` | 서버 상태 확인 | 🚧 미사용 |

## 📊 차트 데이터 API

### 요청 (Request)

```typescript
interface BacktestParams {
  ticker: string;           // 주식 티커 (예: "AAPL")
  start_date: string;       // 시작일 (YYYY-MM-DD)
  end_date: string;         // 종료일 (YYYY-MM-DD)
  initial_cash: number;     // 초기 투자금 (최소 1000)
  strategy: string;         // 전략명
  strategy_params: object;  // 전략별 파라미터
}
```

### 응답 (Response)

```typescript
interface ChartDataResponse {
  ticker: string;
  strategy: string;
  start_date: string;
  end_date: string;
  ohlc_data: ChartDataPoint[];      // OHLC 가격 데이터
  equity_data: EquityPoint[];       // 자산 곡선 데이터
  trade_markers: TradeMarker[];     // 거래 마커
  indicators: IndicatorData[];      // 기술 지표
  summary_stats: SummaryStats;      // 요약 통계
}
```

### 실제 API 호출 예시

```typescript
const fetchChartData = async (params: BacktestParams): Promise<ChartDataResponse> => {
  console.log('🚀 API 요청 시작:', params);
  
  const response = await fetch('/api/v1/backtest/chart-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('✅ API 응답 수신:', data);
  
  return data;
};

// 사용 예시
const chartData = await fetchChartData({
  ticker: 'AAPL',
  start_date: '2023-01-01',
  end_date: '2023-12-31',
  initial_cash: 10000,
  strategy: 'buy_and_hold',
  strategy_params: {}
});
```

## 📝 데이터 타입 정의

### ChartDataPoint (OHLC 데이터)

```typescript
interface ChartDataPoint {
  timestamp: string;    // ISO 8601 형식
  date: string;         // YYYY-MM-DD 형식 (차트 X축용)
  open: number;         // 시가
  high: number;         // 고가
  low: number;          // 저가
  close: number;        // 종가
  volume: number;       // 거래량
}

// 실제 데이터 예시
{
  "timestamp": "2023-01-03T00:00:00",
  "date": "2023-01-03",
  "open": 130.28,
  "high": 130.90,
  "low": 124.17,
  "close": 125.07,
  "volume": 112117471
}
```

### EquityPoint (자산 곡선)

```typescript
interface EquityPoint {
  timestamp: string;
  date: string;         // X축 키
  equity: number;       // 자산 가치 ($)
  return_pct: number;   // 누적 수익률 (%)
  drawdown_pct: number; // 드로우다운 (%)
}

// 실제 데이터 예시
{
  "timestamp": "2023-01-03T00:00:00",
  "date": "2023-01-03",
  "equity": 10000.0,
  "return_pct": 0.0,
  "drawdown_pct": 0.0
}
```

### TradeMarker (거래 마커)

```typescript
interface TradeMarker {
  timestamp: string;
  date: string;
  price: number;        // 거래 가격
  type: 'entry' | 'exit'; // 진입/청산
  side: 'buy' | 'sell';   // 매수/매도
  size: number;         // 거래 수량
  pnl_pct?: number;     // 손익률 (청산 시만)
}

// 실제 데이터 예시
{
  "timestamp": "2023-01-03T00:00:00",
  "date": "2023-01-03",
  "price": 125.07,
  "type": "entry",
  "side": "buy",
  "size": 79.96,
  "pnl_pct": 0.0
}
```

### IndicatorData (기술 지표)

```typescript
interface IndicatorData {
  name: string;         // 지표명 (예: "SMA_20")
  type: string;         // 지표 타입
  color: string;        // 차트 색상 (hex)
  data: Array<{
    timestamp: string;
    date: string;
    value: number;      // 지표 값
  }>;
}

// 실제 데이터 예시
{
  "name": "SMA_20",
  "type": "overlay",
  "color": "#ff7300",
  "data": [
    {
      "timestamp": "2023-01-23T00:00:00",
      "date": "2023-01-23",
      "value": 127.45
    }
  ]
}
```

### SummaryStats (요약 통계)

```typescript
interface SummaryStats {
  total_return_pct: number;    // 총 수익률 (%)
  total_trades: number;        // 총 거래 수
  win_rate_pct: number;        // 승률 (%)
  max_drawdown_pct: number;    // 최대 손실률 (%)
  sharpe_ratio: number;        // 샤프 비율
  profit_factor: number;       // 수익 팩터
}

// 실제 데이터 예시
{
  "total_return_pct": 54.80,
  "total_trades": 1,
  "win_rate_pct": 100.0,
  "max_drawdown_pct": -12.45,
  "sharpe_ratio": 1.234,
  "profit_factor": 2.45
}
```

## ⚙️ 전략별 파라미터 설정

### Buy & Hold

```typescript
// 파라미터 없음
strategy_params: {}
```

### SMA Crossover

```typescript
strategy_params: {
  short_window: 10,    // 단기 이동평균 (5-50)
  long_window: 20      // 장기 이동평균 (10-200)
}
```

### RSI Strategy

```typescript
strategy_params: {
  rsi_period: 14,      // RSI 기간 (5-50)
  rsi_upper: 70,       // 과매수 임계값 (50-90)
  rsi_lower: 30        // 과매도 임계값 (10-50)
}
```

### Bollinger Bands

```typescript
strategy_params: {
  period: 20,          // 이동평균 기간 (10-50)
  std_dev: 2.0         // 표준편차 배수 (1.0-3.0)
}
```

### MACD Strategy

```typescript
strategy_params: {
  fast_period: 12,     // 빠른 EMA (5-20)
  slow_period: 26,     // 느린 EMA (20-50)
  signal_period: 9     // 시그널 라인 (5-15)
}
```

## 🚨 에러 처리

### HTTP 상태 코드

| 코드 | 의미 | 처리 방법 |
|------|------|-----------|
| `200` | 성공 | 정상 처리 |
| `400` | 잘못된 요청 | 파라미터 검증 |
| `404` | 리소스 없음 | 티커 확인 |
| `422` | 유효성 오류 | 입력값 확인 |
| `500` | 서버 오류 | 재시도 또는 문의 |
| `503` | 서비스 불가 | 잠시 후 재시도 |

### 에러 응답 형식

```typescript
interface ErrorResponse {
  detail: string;        // 에러 메시지
  status_code: number;   // HTTP 상태 코드
}

// 실제 에러 응답 예시
{
  "detail": "Ticker 'INVALID' not found",
  "status_code": 404
}
```

### 에러 처리 구현

```typescript
const runBacktest = async (params: BacktestParams) => {
  setLoading(true);
  setError(null);
  
  try {
    const data = await fetchChartData(params);
    setChartData(data);
    
  } catch (err) {
    let errorMessage = '알 수 없는 오류가 발생했습니다.';
    
    if (err instanceof Error) {
      // 네트워크 오류
      if (err.message.includes('Failed to fetch')) {
        errorMessage = '서버에 연결할 수 없습니다. API 서버가 실행 중인지 확인해주세요.';
      }
      // HTTP 오류
      else if (err.message.includes('HTTP 400')) {
        errorMessage = '입력값을 확인해주세요. 올바른 티커와 날짜를 입력했는지 확인하세요.';
      }
      else if (err.message.includes('HTTP 404')) {
        errorMessage = '존재하지 않는 티커입니다. 다른 주식 심볼을 시도해보세요.';
      }
      else if (err.message.includes('HTTP 500')) {
        errorMessage = '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
      else {
        errorMessage = err.message;
      }
    }
    
    setError(errorMessage);
    console.error('백테스트 오류:', err);
    
  } finally {
    setLoading(false);
  }
};
```

## 🔄 상태 관리 패턴

### API 호출 상태

```typescript
interface ApiState {
  loading: boolean;     // 로딩 중
  error: string | null; // 에러 메시지
  data: ChartDataResponse | null; // 응답 데이터
}

const [apiState, setApiState] = useState<ApiState>({
  loading: false,
  error: null,
  data: null
});

// 로딩 시작
setApiState(prev => ({ ...prev, loading: true, error: null }));

// 성공
setApiState(prev => ({ ...prev, loading: false, data: response }));

// 실패
setApiState(prev => ({ ...prev, loading: false, error: errorMessage }));
```

### 프리셋 데이터

```typescript
const PRESETS = {
  aapl_2023: {
    ticker: 'AAPL',
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    initial_cash: 10000,
    strategy: 'buy_and_hold',
    strategy_params: {}
  },
  tsla_2022: {
    ticker: 'TSLA',
    start_date: '2022-01-01',
    end_date: '2022-12-31',
    initial_cash: 10000,
    strategy: 'sma_crossover',
    strategy_params: { short_window: 10, long_window: 20 }
  },
  nvda_2023: {
    ticker: 'NVDA',
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    initial_cash: 10000,
    strategy: 'rsi_strategy',
    strategy_params: { rsi_period: 14, rsi_upper: 70, rsi_lower: 30 }
  }
};

// 프리셋 적용
const applyPreset = (presetKey: keyof typeof PRESETS) => {
  const preset = PRESETS[presetKey];
  setBacktestParams(preset);
  runBacktest(preset); // 즉시 실행
};
```

## 🧪 API 테스트

### 개발자 도구 테스트

```javascript
// 브라우저 콘솔에서 직접 테스트
fetch('/api/v1/backtest/chart-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ticker: 'AAPL',
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    initial_cash: 10000,
    strategy: 'buy_and_hold',
    strategy_params: {}
  })
})
.then(r => r.json())
.then(console.log);
```

### cURL 테스트

```bash
# 직접 API 서버 테스트
curl -X POST http://localhost:8000/api/v1/backtest/chart-data \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "AAPL",
    "start_date": "2023-01-01",
    "end_date": "2023-12-31",
    "initial_cash": 10000,
    "strategy": "buy_and_hold",
    "strategy_params": {}
  }'

# 서버 상태 확인
curl http://localhost:8000/health
```

### Mock 서버 (향후 계획)

```typescript
// 개발용 Mock 응답
const mockChartData: ChartDataResponse = {
  ticker: 'AAPL',
  strategy: 'buy_and_hold',
  start_date: '2023-01-01',
  end_date: '2023-12-31',
  ohlc_data: [
    {
      timestamp: '2023-01-03T00:00:00',
      date: '2023-01-03',
      open: 130.28,
      high: 130.90,
      low: 124.17,
      close: 125.07,
      volume: 112117471
    }
  ],
  equity_data: [
    {
      timestamp: '2023-01-03T00:00:00',
      date: '2023-01-03',
      equity: 10000.0,
      return_pct: 0.0,
      drawdown_pct: 0.0
    }
  ],
  trade_markers: [],
  indicators: [],
  summary_stats: {
    total_return_pct: 54.80,
    total_trades: 1,
    win_rate_pct: 100.0,
    max_drawdown_pct: -12.45,
    sharpe_ratio: 1.234,
    profit_factor: 2.45
  }
};

// Mock 함수
const fetchChartDataMock = async (params: BacktestParams): Promise<ChartDataResponse> => {
  // 실제 API 지연 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 에러 시뮬레이션
  if (params.ticker === 'ERROR') {
    throw new Error('HTTP 404: Ticker not found');
  }
  
  return mockChartData;
};
```

## 🔧 개발 환경 설정

### Vite 프록시 설정 상세

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
});
```

### 환경별 API URL 설정

```typescript
// 환경 변수로 API URL 관리
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// 절대 URL 생성
const getApiUrl = (endpoint: string) => {
  if (import.meta.env.DEV) {
    // 개발 환경: Vite 프록시 사용
    return `/api${endpoint}`;
  } else {
    // 프로덕션: 환경 변수 또는 같은 도메인
    return `${API_BASE_URL}${endpoint}`;
  }
};

// 사용 예시
const response = await fetch(getApiUrl('/v1/backtest/chart-data'), {
  method: 'POST',
  // ...
});
```

## 📊 응답 데이터 활용

### Recharts 데이터 변환

```typescript
// OHLC 차트용 데이터 변환
const transformOHLCData = (ohlcData: ChartDataPoint[], indicators: IndicatorData[]) => {
  return ohlcData.map(ohlc => {
    const point: any = {
      date: ohlc.date,
      open: ohlc.open,
      high: ohlc.high,
      low: ohlc.low,
      close: ohlc.close,
      volume: ohlc.volume
    };
    
    // 기술 지표 데이터 병합
    indicators.forEach(indicator => {
      const indicatorPoint = indicator.data.find(d => d.date === ohlc.date);
      if (indicatorPoint) {
        point[indicator.name] = indicatorPoint.value;
      }
    });
    
    return point;
  });
};

// 거래 마커 색상 결정
const getTradeColor = (type: 'entry' | 'exit', side?: 'buy' | 'sell') => {
  if (type === 'entry') {
    return side === 'buy' ? '#198754' : '#dc3545'; // 초록/빨강
  } else {
    return '#ffc107'; // 노랑 (청산)
  }
};

// 성과 지표 배지 색상
const getStatVariant = (value: number, type: 'return' | 'sharpe' | 'drawdown') => {
  switch (type) {
    case 'return':
      return value >= 0 ? 'success' : 'danger';
    case 'sharpe':
      return value >= 1 ? 'success' : value >= 0.5 ? 'warning' : 'danger';
    case 'drawdown':
      return value >= -5 ? 'success' : value >= -15 ? 'warning' : 'danger';
    default:
      return 'secondary';
  }
};
```

---

이 API 가이드를 참고하여 백엔드와의 안정적인 데이터 연동을 구현하고, 사용자에게 최적의 경험을 제공해주세요. 