// src/components/charts/PieChart.tsx
import React, { useMemo } from "react";

export interface PieSegmentData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieSegmentData[];
  size?: number; // ViewBox size, e.g., 100
  strokeWidth?: number; // For creating a doughnut chart effect if desired
  strokeColor?: string; // Color for the stroke (e.g., background color for doughnut)
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 100,
  strokeWidth = 0, // Default to a pie chart, not a doughnut
  strokeColor = "#fff", // Default stroke color, useful for doughnut
}) => {
  const viewBox = `0 0 ${size} ${size}`;
  const radius = (size - strokeWidth) / 2 - (strokeWidth > 0 ? size * 0.05 : 0); // Slightly smaller radius if it's a doughnut to prevent edge clipping
  const cx = size / 2;
  const cy = size / 2;

  const totalValue = useMemo(
    () => data.reduce((sum, segment) => sum + segment.value, 0),
    [data]
  );

  const segments = useMemo(() => {
    if (totalValue === 0) {
      // If total is 0, draw a full circle with a default color or handle as empty
      return [
        <circle key="empty-circle" cx={cx} cy={cy} r={radius} fill="#E5E7EB" />, // gray-200
      ];
    }

    let accumulatedPercentage = 0;
    return data
      .filter((segment) => segment.value > 0) // Only draw segments with value
      .map((segment, index) => {
        const percentage = (segment.value / totalValue) * 100;
        if (percentage === 0) return null;

        const startAngleDeg = (accumulatedPercentage / 100) * 360;
        let endAngleDeg = ((accumulatedPercentage + percentage) / 100) * 360;

        // If it's a full circle from a single segment, ensure it draws correctly
        if (
          data.filter((s) => s.value > 0).length === 1 &&
          percentage === 100 &&
          startAngleDeg === 0
        ) {
          endAngleDeg = 359.999; // Small gap to force SVG to draw the arc
        } else if (endAngleDeg === startAngleDeg && percentage > 0) {
          // This can happen if there are multiple segments but only one has value due to filtering
          endAngleDeg = startAngleDeg + 359.999;
        }

        accumulatedPercentage += percentage;

        const startAngleRad = (startAngleDeg - 90) * (Math.PI / 180);
        const endAngleRad = (endAngleDeg - 90) * (Math.PI / 180);

        const x1 = cx + radius * Math.cos(startAngleRad);
        const y1 = cy + radius * Math.sin(startAngleRad);
        const x2 = cx + radius * Math.cos(endAngleRad);
        const y2 = cy + radius * Math.sin(endAngleRad);

        const largeArcFlag = percentage > 50 ? 1 : 0;

        const pathData = `M ${cx},${cy} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;

        return (
          <path
            key={`segment-${index}-${segment.label}`}
            d={pathData}
            fill={segment.color}
          />
        );
      });
  }, [data, totalValue, radius, cx, cy]);

  return (
    <svg
      viewBox={viewBox}
      width="100%"
      height="100%"
      aria-label={`Pie chart showing ${data.map((s) => s.label).join(", ")}`}
    >
      {segments}
      {strokeWidth > 0 &&
        totalValue > 0 && ( // Draw center circle for doughnut effect if data exists
          <circle cx={cx} cy={cy} r={radius - strokeWidth} fill={strokeColor} />
        )}
    </svg>
  );
};

export default PieChart;
