import React, { useState, memo, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useRenderPerformance } from "@/shared/components/PerformanceMonitor";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";

interface StockData {
  symbol: string;
  data: Array<{
    date: string;
    price: number;
    volume?: number;
  }>;
}

interface StockPriceChartProps {
  stocksData: StockData[];
  className?: string;
}

const StockPriceChart: React.FC<StockPriceChartProps> = memo(({ stocksData, className = "" }) => {
  // 성능 모니터링
  useRenderPerformance('StockPriceChart');
  
  const [currentIndex, setCurrentIndex] = useState(0);

  // 이벤트 핸들러 메모이제이션
  const handlePrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? stocksData.length - 1 : prevIndex - 1
    );
  }, [stocksData.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === stocksData.length - 1 ? 0 : prevIndex + 1
    );
  }, [stocksData.length]);

  if (!stocksData || stocksData.length === 0) {
    return (
      <div className={`bg-card border border-border rounded-lg shadow-sm ${className}`}>
        <div className="px-6 py-4 text-center">
          <p className="text-muted-foreground">표시할 주가 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  const currentStock = stocksData[currentIndex];

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };

  // 가격 포맷팅 함수
  const formatPrice = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className={className}>
      {/* 헤더: 종목명과 네비게이션 */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h5 className="text-lg font-semibold text-foreground mb-1">{currentStock.symbol}</h5>
          <Badge variant="secondary">
            {currentIndex + 1} / {stocksData.length}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={stocksData.length <= 1}
          >
            ← 이전
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={stocksData.length <= 1}
          >
            다음 →
          </Button>
        </div>
      </div>

      {/* 차트 */}
      <div style={{ width: '100%', height: '400px' }}>
        <ResponsiveContainer>
          <LineChart data={currentStock.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
              interval={Math.max(1, Math.floor(currentStock.data.length / 8))}
            />
            <YAxis 
              tickFormatter={formatPrice}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip 
              labelFormatter={(label: any) => `날짜: ${label}`}
              formatter={(value: number) => [formatPrice(value), '주가']}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 차트 하단 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <div>
          <small className="text-muted-foreground">
            시작: {currentStock.data[0]?.date} | 
            종료: {currentStock.data[currentStock.data.length - 1]?.date}
          </small>
        </div>
        <div className="text-left md:text-right">
          <small className="text-muted-foreground">
            데이터 포인트: {currentStock.data.length}개
          </small>
        </div>
      </div>
    </div>
  );
});

StockPriceChart.displayName = 'StockPriceChart';

export default StockPriceChart;
