import React, { useMemo, useState, useEffect, useRef } from "react";

export interface PieSegmentData {
  label: string;
  value: number;
  color: string;
  id?: string;
}

interface PieChartProps {
  data: PieSegmentData[];
  size?: number;
  strokeWidth?: number;
  strokeColor?: string;
  onSegmentClick?: (segment: PieSegmentData) => void;
  onSegmentMiddleClick?: (
    segment: PieSegmentData,
    event: React.MouseEvent
  ) => void;
  hoveredLabel: string | null;
  onHover: (label: string | null) => void;
  activeLabel?: string | null;
}

interface TooltipData {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  value: string;
  percentage: string;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 100,
  strokeWidth = 0,
  strokeColor = "#fff",
  onSegmentClick,
  onSegmentMiddleClick,
  hoveredLabel,
  onHover,
  activeLabel,
}) => {
  const [animationKey, setAnimationKey] = useState(0);
  const [tooltipData, setTooltipData] = useState<TooltipData>({
    visible: false,
    x: 0,
    y: 0,
    label: "",
    value: "",
    percentage: "",
  });
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the main container div

  useEffect(() => {
    setAnimationKey((prevKey) => prevKey + 1);
  }, [data]);

  const viewBox = `0 0 ${size} ${size}`;
  const cx = size / 2;
  const cy = size / 2;

  const hoverEffectScale = 1.03;
  const radius = size / 2 / hoverEffectScale;

  const totalValue = useMemo(
    () => data.reduce((sum, segment) => sum + segment.value, 0),
    [data]
  );

  const styles = `
    .pie-segment-group-anim {
      transform-origin: var(--cx) var(--cy);
      animation: pieSegmentEnter var(--anim-duration, 0.5s) ease-out forwards;
      opacity: 0;
    }
    @keyframes pieSegmentEnter {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
    .pie-segment-path-interactive {
      cursor: pointer;
      transform-origin: var(--cx) var(--cy);
      transition: transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1), 
                  filter 0.2s cubic-bezier(0.25, 0.1, 0.25, 1),
                  opacity 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
    }

    .pie-segment-path-interactive.active {
      transform: scale(1.02);
      filter: brightness(1.08);
      opacity: 1;
    }

    .pie-segment-path-interactive.hovered {
      transform: scale(1.05); 
      filter: brightness(1.15);
      opacity: 1;
    }

    /* style for when hovering over an already active segment */
    .pie-segment-path-interactive.active.hovered {
      transform: scale(1.06); /* Slightly larger */
      filter: brightness(1.20); /* Even brighter */
    }

    /* style for when the mouse button is pressed down */
    .pie-segment-path-interactive:active {
      transform: scale(1.01);
      filter: brightness(0.95);
      transition: transform 0.05s ease-out, filter 0.05s ease-out;
    }
    .pie-empty-circle-anim {
      transform-origin: var(--cx) var(--cy);
      animation: pieSegmentEnter var(--anim-duration, 0.5s) ease-out 0.1s forwards;
      opacity: 0;
    }
    .doughnut-hole-anim {
      transform-origin: var(--cx) var(--cy);
      animation: doughnutHoleEnter var(--anim-duration, 0.5s) ease-out var(--anim-delay, 0.2s) forwards;
      opacity: 0;
      transform: scale(0.8);
    }
    @keyframes doughnutHoleEnter {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }

    .pie-chart-tooltip {
      position: absolute;
      background-color: rgba(40, 40, 40, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      line-height: 1.4;
      pointer-events: none; 
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      white-space: nowrap;
      opacity: 0;
      transform: translate(-50%, calc(-100% - 10px)); 
      transition: opacity 0.15s ease-out, transform 0.15s ease-out;
      will-change: opacity, transform;
    }
    .pie-chart-tooltip.visible {
      opacity: 1;
      transform: translate(-50%, calc(-100% - 15px)); 
    }
    .pie-chart-tooltip strong {
      font-weight: 600;
    }

    .pie-segments-container:has(.pie-segment-path-interactive.active):not(:has(.pie-segment-path-interactive.hovered)) .pie-segment-path-interactive:not(.active) {
      opacity: 0.5;
      filter: saturate(0.7);
    }

    .pie-segments-container:has(.pie-segment-path-interactive.hovered) .pie-segment-path-interactive:not(.hovered) {
      opacity: 0.4;
      filter: saturate(0.6);
    }
  `;

  const handleSegmentMouseEnter = (
    event: React.MouseEvent,
    segment: PieSegmentData,
    percentage: number
  ) => {
    onHover(segment.label);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipData({
        visible: true,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        label: segment.label,
        value: segment.value.toLocaleString(),
        percentage: percentage.toFixed(1) + "%",
      });
    }
  };

  const handleSegmentMouseMove = (event: React.MouseEvent) => {
    if (tooltipData.visible && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipData((prev) => ({
        ...prev,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }));
    }
  };

  const handleSegmentMouseLeave = () => {
    onHover(null);
    setTooltipData((prev) => ({ ...prev, visible: false }));
  };

  const segments = useMemo(() => {
    if (radius <= 0) return null;

    if (totalValue === 0) {
      return (
        <circle
          key={`empty-circle-${animationKey}`}
          cx={cx}
          cy={cy}
          r={radius}
          fill="#E5E7EB"
          className="pie-empty-circle-anim"
        />
      );
    }

    let accumulatedPercentage = 0;
    const animationBaseDuration = 0.5;
    const animationStagger = 0.07;

    return data
      .filter((segment) => segment.value > 0)
      .map((segment, index) => {
        const percentage = (segment.value / totalValue) * 100;
        if (percentage === 0) return null;

        const startAngleDeg = (accumulatedPercentage / 100) * 360;
        let endAngleDeg = ((accumulatedPercentage + percentage) / 100) * 360;

        if (
          data.filter((s) => s.value > 0).length === 1 &&
          percentage === 100 &&
          startAngleDeg === 0
        ) {
          endAngleDeg = 359.999;
        } else if (endAngleDeg === startAngleDeg && percentage > 0) {
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

        const segmentAnimationDuration = `${animationBaseDuration}s`;
        const segmentAnimationDelay = `${index * animationStagger}s`;

        const isHovered = segment.label === hoveredLabel;
        const isActive = segment.label === activeLabel;
        return (
          <g
            key={`segment-group-${index}-${animationKey}`}
            className="pie-segment-group-anim" // This group receives the animation
            style={{
              animationDelay: segmentAnimationDelay,
              // @ts-ignore
              "--anim-duration": segmentAnimationDuration,
            }}
          >
            <path
              d={pathData}
              fill={segment.color}
              className={`pie-segment-path-interactive ${
                isHovered ? "hovered" : ""
              } ${isActive ? "active" : ""}`}
              onMouseEnter={(e) =>
                handleSegmentMouseEnter(e, segment, percentage)
              }
              onMouseLeave={handleSegmentMouseLeave}
              onMouseMove={handleSegmentMouseMove}
              onClick={() => onSegmentClick && onSegmentClick(segment)}
              onMouseDown={(e) => {
                // Only enter this block if it's a middle-click AND the handler prop exists
                if (e.button === 1 && onSegmentMiddleClick) {
                  e.preventDefault(); // Now it's only called when we have a custom action
                  onSegmentMiddleClick(segment, e);
                }
              }}
            />
          </g>
        );
      });
  }, [
    data,
    totalValue,
    radius,
    cx,
    cy,
    animationKey,
    hoveredLabel,
    activeLabel,
  ]);

  const doughnutHoleRadius = radius - strokeWidth;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <style>{styles}</style>
      <svg
        viewBox={viewBox}
        width="100%"
        height="100%"
        className="pie-segments-container" // Added class for targeting
        aria-label={`Pie chart showing ${data.map((s) => s.label).join(", ")}`}
        style={{
          // @ts-ignore
          "--cx": `${cx}px`,
          "--cy": `${cy}px`,
          overflow: "visible",
        }}
      >
        {segments}
        {strokeWidth > 0 &&
          totalValue > 0 &&
          doughnutHoleRadius > 0 &&
          radius > doughnutHoleRadius && (
            <circle
              key={`doughnut-hole-${animationKey}`}
              cx={cx}
              cy={cy}
              r={doughnutHoleRadius}
              fill={strokeColor}
              className="doughnut-hole-anim"
              style={{
                // @ts-ignore
                "--anim-delay": `${
                  data.filter((s) => s.value > 0).length * 0.07 + 0.1
                }s`,
                "--anim-duration": "0.4s",
              }}
            />
          )}
      </svg>
      {tooltipData.visible && (
        <div
          className={`pie-chart-tooltip ${
            tooltipData.visible ? "visible" : ""
          }`}
          style={{
            left: `${tooltipData.x}px`,
            top: `${tooltipData.y}px`,
          }}
        >
          <strong>{tooltipData.label}</strong>
          <br />
          Брой: {tooltipData.value}
          <br />
          {tooltipData.percentage}
        </div>
      )}
    </div>
  );
};

export default PieChart;
