import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Badge,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import {
  ComposedChart,
  LineChart,
  AreaChart,
  ScatterChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  Line,
  Area,
  Scatter,
  ReferenceLine,
  Cell
} from 'recharts';
import { ChartDataResponse, ChartDataPoint, EquityPoint, TradeMarker, IndicatorData } from './types/api';

// API 호출 함수
const fetchChartData = async (params: {
  ticker: string;
  start_date: string;
  end_date: string;
  initial_cash: number;
  strategy: string;
  strategy_params?: any;
}): Promise<ChartDataResponse> => {
  const response = await fetch('/api/v1/backtest/chart-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow-sm">
        <p className="fw-bold mb-1">{`날짜: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="mb-0">
            {`${entry.dataKey}: ${entry.value?.toFixed(2)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// OHLC 캔들스틱 차트 컴포넌트
const OHLCChart: React.FC<{ data: ChartDataPoint[]; indicators: IndicatorData[]; trades: TradeMarker[] }> = ({ 
  data, indicators, trades 
}) => {
  const safeData = data || [];
  const safeIndicators = indicators || [];
  const safeTrades = trades || [];
  
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
        <Alert variant="info" className="mb-3">
          <Alert.Heading className="h6">📊 차트 해석 가이드</Alert.Heading>
          <ul className="mb-0 small">
            <li><strong>파란색 선:</strong> 매일의 종가(Close) 움직임</li>
            <li><strong>회색 막대:</strong> 거래량 (얼마나 많이 거래되었는지)</li>
            <li><strong>주황색 선 (SMA_20):</strong> 최근 20일 평균 주가 (추세 파악용)</li>
            <li><strong>점선:</strong> 매수/매도 시점</li>
          </ul>
        </Alert>
        
        {safeData && safeData.length > 0 ? (
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mergedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                <YAxis yAxisId="price" orientation="right" />
                <YAxis yAxisId="volume" orientation="left" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="volume" dataKey="volume" fill="#6c757d" opacity={0.3} name="거래량" />
                <Line yAxisId="price" type="monotone" dataKey="close" stroke="#0d6efd" strokeWidth={2} dot={false} name="종가" />
                {safeIndicators.map((indicator, index) => (
                  <Line
                    key={indicator.name}
                    yAxisId="price"
                    type="monotone"
                    dataKey={indicator.name}
                    stroke={indicator.color}
                    strokeWidth={1.5}
                    dot={false}
                    name={indicator.name}
                    strokeDasharray={index % 2 === 1 ? "5 5" : undefined}
                  />
                ))}
                {safeTrades.map((trade, index) => (
                  <ReferenceLine
                    key={index}
                    yAxisId="price"
                    x={trade.date}
                    stroke={trade.type === 'entry' ? '#198754' : '#dc3545'}
                    strokeWidth={2}
                    strokeDasharray="2 2"
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
            <div className="text-center text-muted">
              <h5>차트 데이터가 없습니다</h5>
              <p>백테스트를 실행해주세요.</p>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

// 자산 곡선 차트 컴포넌트
const EquityChart: React.FC<{ data: EquityPoint[] }> = ({ data }) => {
  const safeData = data || [];
  
  return (
    <Card className="mb-4">
      <Card.Header className="bg-success text-white">
        <h5 className="mb-0">💰 자산 곡선 (투자 성과)</h5>
      </Card.Header>
      <Card.Body>
        <Alert variant="success" className="mb-3">
          <Alert.Heading className="h6">📈 성과 분석 가이드</Alert.Heading>
          <ul className="mb-0 small">
            <li><strong>초록색 선:</strong> 누적 수익률 (시간에 따른 투자 성과)</li>
            <li><strong>빨간색 영역:</strong> 드로우다운 (최고점 대비 손실 구간)</li>
            <li><strong>0% 기준선:</strong> 손익분기점 (위쪽은 수익, 아래쪽은 손실)</li>
          </ul>
        </Alert>
        
        {safeData && safeData.length > 0 ? (
          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={safeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="return" orientation="left" />
                <YAxis yAxisId="drawdown" orientation="right" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Line yAxisId="return" type="monotone" dataKey="return_pct" stroke="#198754" strokeWidth={2} dot={false} name="수익률 (%)" />
                <Area yAxisId="drawdown" type="monotone" dataKey="drawdown_pct" stroke="#dc3545" fill="#dc3545" fillOpacity={0.3} name="드로우다운 (%)" />
                <ReferenceLine yAxisId="return" y={0} stroke="#6c757d" strokeDasharray="2 2" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="d-flex align-items-center justify-content-center" style={{ height: '320px' }}>
            <div className="text-center text-muted">
              <h5>자산 곡선 데이터가 없습니다</h5>
              <p>백테스트를 실행해주세요.</p>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

// 거래 분석 차트 컴포넌트
const TradesChart: React.FC<{ trades: TradeMarker[] }> = ({ trades }) => {
  const exitTrades = trades.filter(trade => trade.type === 'exit' && trade.pnl_pct !== undefined);
  const getTradeColor = (pnl: number) => pnl >= 0 ? '#198754' : '#dc3545';
  
  return (
    <Card className="mb-4">
      <Card.Header className="bg-warning text-dark">
        <h5 className="mb-0">📊 거래 손익 분석</h5>
      </Card.Header>
      <Card.Body>
        <div style={{ width: '100%', height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={exitTrades} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis dataKey="pnl_pct" />
              <RechartsTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border rounded shadow-sm">
                        <p className="mb-1">{`날짜: ${data.date}`}</p>
                        <p className="mb-1">{`가격: $${data.price.toFixed(2)}`}</p>
                        <p className="mb-1">{`수량: ${data.size}`}</p>
                        <p className="mb-0" style={{ color: getTradeColor(data.pnl_pct) }}>
                          {`손익: ${data.pnl_pct.toFixed(2)}%`}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter dataKey="pnl_pct" fill="#0d6efd">
                {exitTrades.map((trade, index) => (
                  <Cell key={index} fill={getTradeColor(trade.pnl_pct || 0)} />
                ))}
              </Scatter>
              <ReferenceLine y={0} stroke="#6c757d" strokeDasharray="2 2" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </Card.Body>
    </Card>
  );
};

// 통계 요약 컴포넌트
const StatsSummary: React.FC<{ stats: ChartDataResponse['summary_stats'] }> = ({ stats }) => {
  const statItems = [
    { 
      label: '총 수익률', 
      value: `${stats.total_return_pct.toFixed(2)}%`, 
      variant: stats.total_return_pct >= 0 ? 'success' : 'danger',
      description: '투자 원금 대비 총 수익의 비율입니다.',
      icon: '📈'
    },
    { 
      label: '총 거래 수', 
      value: stats.total_trades.toString(), 
      variant: 'primary',
      description: '백테스트 기간 동안 실행된 총 거래 횟수입니다.',
      icon: '🔄'
    },
    { 
      label: '승률', 
      value: `${stats.win_rate_pct.toFixed(1)}%`, 
      variant: 'info',
      description: '전체 거래 중 수익을 낸 거래의 비율입니다.',
      icon: '🎯'
    },
    { 
      label: '최대 손실', 
      value: `${stats.max_drawdown_pct.toFixed(2)}%`, 
      variant: 'danger',
      description: '투자 포트폴리오가 최고점에서 최대로 떨어진 비율입니다.',
      icon: '📉'
    },
    { 
      label: '샤프 비율', 
      value: stats.sharpe_ratio.toFixed(3), 
      variant: 'secondary',
      description: '위험 대비 수익률을 나타내는 지표입니다.',
      icon: '⚖️'
    },
    { 
      label: '수익 팩터', 
      value: stats.profit_factor.toFixed(2), 
      variant: 'warning',
      description: '총 이익을 총 손실로 나눈 값입니다.',
      icon: '💎'
    },
  ];

  return (
    <div className="mb-4">
      <h4 className="mb-3">📊 백테스트 성과 지표</h4>
      <Row>
        {statItems.map((item, index) => (
          <Col md={6} lg={4} key={index} className="mb-3">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{item.description}</Tooltip>}
            >
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
          </Col>
        ))}
      </Row>
      
      <Alert variant="info" className="mt-4">
        <Alert.Heading className="h6">💡 용어 설명</Alert.Heading>
        <Row>
          <Col md={4}>
            <strong>Buy & Hold:</strong> 주식을 매수한 후 장기간 보유하는 전략
          </Col>
          <Col md={4}>
            <strong>OHLC:</strong> 시가, 고가, 저가, 종가를 보여주는 차트
          </Col>
          <Col md={4}>
            <strong>SMA_20:</strong> 최근 20일간 종가의 평균 지표
          </Col>
        </Row>
      </Alert>
    </div>
  );
};

// 메인 App 컴포넌트
function App() {
  const [chartData, setChartData] = useState<ChartDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 백테스트 파라미터 상태
  const [backtestParams, setBacktestParams] = useState({
    ticker: 'AAPL',
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    initial_cash: 10000,
    strategy: 'buy_and_hold',
    strategy_params: {} as any
  });

  // 전략별 기본 파라미터
  const strategyDefaults = {
    'buy_and_hold': {},
    'sma_crossover': {
      short_window: 10,
      long_window: 20
    },
    'rsi_strategy': {
      rsi_period: 14,
      rsi_upper: 70,
      rsi_lower: 30
    },
    'bollinger_bands': {
      period: 20,
      std_dev: 2.0
    },
    'macd_strategy': {
      fast_period: 12,
      slow_period: 26,
      signal_period: 9
    }
  };

  // 백테스트 실행
  const runBacktest = async (params = backtestParams) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('백테스트 실행 파라미터:', params);
      const data = await fetchChartData(params);
      setChartData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('백테스트 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runBacktest(backtestParams);
  };

  // 파라미터 변경 핸들러
  const handleParamChange = (key: string, value: string | number) => {
    setBacktestParams(prev => ({
      ...prev,
      [key]: value,
      // 전략이 변경될 때 해당 전략의 기본 파라미터로 초기화
      ...(key === 'strategy' && {
        strategy_params: strategyDefaults[value as keyof typeof strategyDefaults] || {}
      })
    }));
  };

  // 전략 파라미터 변경 핸들러
  const handleStrategyParamChange = (paramKey: string, value: number) => {
    setBacktestParams(prev => ({
      ...prev,
      strategy_params: {
        ...prev.strategy_params,
        [paramKey]: value
      }
    }));
  };

  // 초기 로드 시 기본 백테스트 실행
  useEffect(() => {
    runBacktest();
  }, []);

  // 전략별 파라미터 입력 컴포넌트
  const StrategyParamsInput = () => {
    const strategy = backtestParams.strategy;
    
    if (strategy === 'buy_and_hold') {
      return (
        <Alert variant="success">
          <Alert.Heading className="h6">💡 Buy & Hold 전략</Alert.Heading>
          <p className="mb-0 small">추가 파라미터가 필요하지 않습니다. 첫날 매수 후 마지막날까지 보유합니다.</p>
        </Alert>
      );
    }

    if (strategy === 'sma_crossover') {
      return (
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>단기 이동평균 (일)</Form.Label>
              <Form.Control
                type="number"
                value={backtestParams.strategy_params.short_window || 10}
                onChange={(e) => handleStrategyParamChange('short_window', parseInt(e.target.value) || 10)}
                min="5"
                max="50"
                disabled={loading}
              />
              <Form.Text className="text-muted">5-50일 (기본값: 10일)</Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>장기 이동평균 (일)</Form.Label>
              <Form.Control
                type="number"
                value={backtestParams.strategy_params.long_window || 20}
                onChange={(e) => handleStrategyParamChange('long_window', parseInt(e.target.value) || 20)}
                min="10"
                max="200"
                disabled={loading}
              />
              <Form.Text className="text-muted">10-200일 (기본값: 20일)</Form.Text>
            </Form.Group>
          </Col>
        </Row>
      );
    }

    if (strategy === 'rsi_strategy') {
      return (
        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>RSI 기간 (일)</Form.Label>
              <Form.Control
                type="number"
                value={backtestParams.strategy_params.rsi_period || 14}
                onChange={(e) => handleStrategyParamChange('rsi_period', parseInt(e.target.value) || 14)}
                min="5"
                max="50"
                disabled={loading}
              />
              <Form.Text className="text-muted">5-50일 (기본값: 14일)</Form.Text>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>과매수 임계값</Form.Label>
              <Form.Control
                type="number"
                value={backtestParams.strategy_params.rsi_upper || 70}
                onChange={(e) => handleStrategyParamChange('rsi_upper', parseFloat(e.target.value) || 70)}
                min="50"
                max="90"
                step="5"
                disabled={loading}
              />
              <Form.Text className="text-muted">50-90 (기본값: 70)</Form.Text>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>과매도 임계값</Form.Label>
              <Form.Control
                type="number"
                value={backtestParams.strategy_params.rsi_lower || 30}
                onChange={(e) => handleStrategyParamChange('rsi_lower', parseFloat(e.target.value) || 30)}
                min="10"
                max="50"
                step="5"
                disabled={loading}
              />
              <Form.Text className="text-muted">10-50 (기본값: 30)</Form.Text>
            </Form.Group>
          </Col>
        </Row>
      );
    }

    if (strategy === 'bollinger_bands') {
      return (
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>이동평균 기간 (일)</Form.Label>
              <Form.Control
                type="number"
                value={backtestParams.strategy_params.period || 20}
                onChange={(e) => handleStrategyParamChange('period', parseInt(e.target.value) || 20)}
                min="10"
                max="50"
                disabled={loading}
              />
              <Form.Text className="text-muted">10-50일 (기본값: 20일)</Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>표준편차 배수</Form.Label>
              <Form.Control
                type="number"
                value={backtestParams.strategy_params.std_dev || 2.0}
                onChange={(e) => handleStrategyParamChange('std_dev', parseFloat(e.target.value) || 2.0)}
                min="1.0"
                max="3.0"
                step="0.1"
                disabled={loading}
              />
              <Form.Text className="text-muted">1.0-3.0 (기본값: 2.0)</Form.Text>
            </Form.Group>
          </Col>
        </Row>
      );
    }

    if (strategy === 'macd_strategy') {
      return (
        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>빠른 EMA (일)</Form.Label>
              <Form.Control
                type="number"
                value={backtestParams.strategy_params.fast_period || 12}
                onChange={(e) => handleStrategyParamChange('fast_period', parseInt(e.target.value) || 12)}
                min="5"
                max="20"
                disabled={loading}
              />
              <Form.Text className="text-muted">5-20일 (기본값: 12일)</Form.Text>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>느린 EMA (일)</Form.Label>
              <Form.Control
                type="number"
                value={backtestParams.strategy_params.slow_period || 26}
                onChange={(e) => handleStrategyParamChange('slow_period', parseInt(e.target.value) || 26)}
                min="20"
                max="50"
                disabled={loading}
              />
              <Form.Text className="text-muted">20-50일 (기본값: 26일)</Form.Text>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>시그널 라인 (일)</Form.Label>
              <Form.Control
                type="number"
                value={backtestParams.strategy_params.signal_period || 9}
                onChange={(e) => handleStrategyParamChange('signal_period', parseInt(e.target.value) || 9)}
                min="5"
                max="15"
                disabled={loading}
              />
              <Form.Text className="text-muted">5-15일 (기본값: 9일)</Form.Text>
            </Form.Group>
          </Col>
        </Row>
      );
    }

    return null;
  };

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>오류 발생</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => setError(null)}>
            다시 시도
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4" style={{ backgroundColor: '#f8f9fa' }}>
      {/* 헤더 */}
      <Row className="mb-4">
        <Col>
          <div className="text-center">
            <h1 className="display-4 fw-bold text-primary mb-3">🔬 백테스팅 분석 도구</h1>
            <p className="lead text-muted">과거 데이터로 투자 전략의 성과를 분석해보세요</p>
          </div>
        </Col>
      </Row>

      {/* 백테스트 입력 폼 */}
      <Card className="mb-4 shadow">
        <Card.Header className="bg-dark text-white">
          <h5 className="mb-0">⚙️ 백테스트 설정</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>주식 티커</Form.Label>
                  <Form.Control
                    type="text"
                    value={backtestParams.ticker}
                    onChange={(e) => handleParamChange('ticker', e.target.value.toUpperCase())}
                    placeholder="예: AAPL, GOOGL"
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">미국 주식 티커를 입력하세요</Form.Text>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>시작 날짜</Form.Label>
                  <Form.Control
                    type="date"
                    value={backtestParams.start_date}
                    onChange={(e) => handleParamChange('start_date', e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>종료 날짜</Form.Label>
                  <Form.Control
                    type="date"
                    value={backtestParams.end_date}
                    onChange={(e) => handleParamChange('end_date', e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>초기 투자금 ($)</Form.Label>
                  <Form.Control
                    type="number"
                    value={backtestParams.initial_cash}
                    onChange={(e) => handleParamChange('initial_cash', parseFloat(e.target.value) || 0)}
                    min="1000"
                    step="1000"
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">최소 $1,000</Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>투자 전략</Form.Label>
              <Form.Select
                value={backtestParams.strategy}
                onChange={(e) => handleParamChange('strategy', e.target.value)}
                disabled={loading}
              >
                <option value="buy_and_hold">Buy & Hold (매수 후 보유)</option>
                <option value="sma_crossover">SMA Crossover (이동평균 교차)</option>
                <option value="rsi_strategy">RSI Strategy (과매수/과매도)</option>
                <option value="bollinger_bands">Bollinger Bands (볼린저 밴드)</option>
                <option value="macd_strategy">MACD Strategy (MACD 교차)</option>
              </Form.Select>
            </Form.Group>

            {/* 전략별 파라미터 */}
            <StrategyParamsInput />

            <div className="d-flex gap-2 flex-wrap">
              <Button 
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    분석 중...
                  </>
                ) : (
                  '백테스트 실행'
                )}
              </Button>
              
              {/* 프리셋 버튼들 */}
              <Button
                variant="outline-secondary"
                onClick={() => {
                  const newParams = { ...backtestParams, ticker: 'AAPL', start_date: '2023-01-01', end_date: '2023-12-31' };
                  setBacktestParams(newParams);
                }}
                disabled={loading}
              >
                AAPL 2023
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  const newParams = { ...backtestParams, ticker: 'TSLA', start_date: '2022-01-01', end_date: '2022-12-31' };
                  setBacktestParams(newParams);
                }}
                disabled={loading}
              >
                TSLA 2022
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  const newParams = { ...backtestParams, ticker: 'NVDA', start_date: '2023-01-01', end_date: '2024-01-01' };
                  setBacktestParams(newParams);
                }}
                disabled={loading}
              >
                NVDA 2023
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* 로딩 상태 */}
      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <h4 className="mt-3">백테스트 실행 중...</h4>
          <p className="text-muted">{backtestParams.ticker} 데이터를 분석하고 있습니다</p>
        </div>
      )}

      {/* 결과 표시 */}
      {chartData && !loading && (
        <>
          {/* 결과 헤더 */}
          <Card className="mb-4 bg-light">
            <Card.Body className="text-center">
              <h2 className="text-primary mb-2">
                📊 {chartData.ticker} - {chartData.strategy} 백테스트 결과
              </h2>
              <p className="text-muted mb-0">
                {chartData.start_date} ~ {chartData.end_date} | 초기 투자금: ${backtestParams.initial_cash.toLocaleString()}
              </p>
            </Card.Body>
          </Card>

          {/* 통계 요약 */}
          <StatsSummary stats={chartData.summary_stats} />

          {/* 차트들 */}
          <Row>
            <Col lg={12}>
              <OHLCChart 
                data={chartData.ohlc_data} 
                indicators={chartData.indicators}
                trades={chartData.trade_markers}
              />
            </Col>
            <Col lg={12}>
              <EquityChart data={chartData.equity_data} />
            </Col>
            {chartData.trade_markers.length > 0 && (
              <Col lg={12}>
                <TradesChart trades={chartData.trade_markers} />
              </Col>
            )}
          </Row>
        </>
      )}

      {/* 초기 상태 */}
      {!chartData && !loading && !error && (
        <div className="text-center my-5">
          <div style={{ fontSize: '4rem' }}>📈</div>
          <h3 className="mt-3">백테스팅을 시작하세요</h3>
          <p className="text-muted">위의 폼에서 티커와 기간을 설정한 후 백테스트를 실행해보세요.</p>
        </div>
      )}
    </Container>
  );
}

export default App; 