import React from 'react';

interface ChartLoadingProps {
  height?: number | string;
  message?: string;
}

const ChartLoading: React.FC<ChartLoadingProps> = ({ 
  height = 320, 
  message = "차트를 로딩 중입니다..." 
}) => {
  return (
    <div 
      className="flex items-center justify-center bg-muted rounded-lg border border-border"
      style={{ height }}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
};

export default ChartLoading;
