import React, { useMemo } from 'react'

interface PieChartData {
  label: string
  value: number
  color: string
}

interface DynamicPieChartProps {
  data: PieChartData[]
  totalLabel: string
  colorClasses?: Record<string, string>
}

const defaultColorMap: Record<string, string> = {
  blue: '#3b82f6',
  green: '#10b981',
  purple: '#8b5cf6',
  orange: '#f97316',
  indigo: '#6366f1',
  emerald: '#059669',
  pink: '#ec4899',
  teal: '#14b8a6',
  red: '#ef4444',
  cyan: '#06b6d4',
  amber: '#f59e0b',
  lime: '#84cc16',
  violet: '#a855f7',
  rose: '#f43f5e',
  sky: '#0ea5e9',
  slate: '#64748b',
  neutral: '#737373',
  stone: '#78716c'
}

export const DynamicPieChart: React.FC<DynamicPieChartProps> = ({ 
  data, 
  totalLabel,
  colorClasses = defaultColorMap 
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null

    const total = data.reduce((sum, item) => sum + item.value, 0)
    let cumulativeDashOffset = 0
    const circumference = 500 // 2π * 80 (radius)

    const segments = data.map((item) => {
      const percentage = (item.value / total) * 100
      const dashLength = (percentage / 100) * circumference
      const dashOffset = -cumulativeDashOffset
      
      const segment = {
        ...item,
        percentage,
        dashLength,
        dashOffset,
        strokeColor: colorClasses[item.color] || colorClasses.blue,
        percentageText: `${percentage.toFixed(0)}`
      }
      
      cumulativeDashOffset += dashLength
      return segment
    })

    return {
      segments,
      total,
      circumference
    }
  }, [data, colorClasses])

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">No data available</p>
      </div>
    )
  }

  return (
    <>
      {/* Pie Chart Visual */}
      <div className="relative h-64 flex items-center justify-center mb-6">
        <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
          {chartData.segments.map((segment, index) => (
            <circle
              key={`${segment.label}-${index}`}
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={segment.strokeColor}
              strokeWidth="20"
              strokeDasharray={`${segment.dashLength} ${chartData.circumference}`}
              strokeDashoffset={segment.dashOffset}
              className="transition-all duration-300 hover:stroke-width-[24]"
            />
          ))}
        </svg>
        
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{chartData.total.toLocaleString()}</p>
            <p className="text-sm text-slate-600">{totalLabel}</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {chartData.segments.map((segment) => (
          <div key={segment.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.strokeColor }}
              ></div>
              <span className="text-sm text-slate-700">{segment.label}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold" style={{ color: segment.strokeColor }}>
                {segment.value.toLocaleString()} ({segment.percentageText}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
