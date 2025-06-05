// components/charts/BarChart.tsx
import React, { useState, useRef, useEffect } from "react";

interface BarDataPoint {
  [key: string]: any; // Allows arbitrary properties, e.g., periodLabel, problems, low, medium, high
}

export interface BarSeriesConfig {
  // Exporting for use in Analyses.tsx
  dataKey: string; // e.g., 'problems', 'lowPriority'
  label: string; // e.g., 'Проблеми', 'Нисък Приоритет'
  color: string;
}

interface BarChartProps {
  data: BarDataPoint[];
  dataKeyX: string; // Key for the X-axis label in each data point
  series: BarSeriesConfig[]; // Array defining the series to plot
  title: string;
}

interface TooltipData {
  visible: boolean;
  x: number;
  y: number;
  contentHtml: string | null;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  dataKeyX,
  series, // New prop
  title,
}) => {
  const [tooltipData, setTooltipData] = useState<TooltipData>({
    visible: false,
    x: 0,
    y: 0,
    contentHtml: null,
  });
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContainerWidth, setSvgContainerWidth] = useState(0);

  const chartHeight = 220;
  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 45; // For X-axis labels
  const marginLeft = 35; // For Y-axis labels

  useEffect(() => {
    const currentContainerRef = containerRef.current;
    if (currentContainerRef) {
      setSvgContainerWidth(currentContainerRef.offsetWidth);
      const resizeObserver = new ResizeObserver((entries) => {
        if (entries[0]) {
          setSvgContainerWidth(entries[0].contentRect.width);
        }
      });
      resizeObserver.observe(currentContainerRef);
      return () => {
        if (currentContainerRef) {
          resizeObserver.unobserve(currentContainerRef);
        }
        resizeObserver.disconnect();
      };
    }
  }, []);

  if (!data || data.length === 0 || !series || series.length === 0) {
    return (
      <div
        ref={containerRef}
        className="w-full p-4 border rounded-lg shadow-sm bg-white"
      >
        <p className="text-sm font-semibold mb-1 text-center text-gray-700">
          {title}
        </p>
        <div className="h-[220px] flex items-center justify-center text-gray-500">
          Няма данни{" "}
          {(!series || series.length === 0) && "или конфигурация на сериите"}.
        </div>
      </div>
    );
  }

  const plotWidth = Math.max(0, svgContainerWidth - marginLeft - marginRight);
  const plotHeight = Math.max(0, chartHeight - marginTop - marginBottom);

  // Calculate maxValue across all series
  const maxValue = Math.max(
    1,
    ...data.map((d) => Math.max(...series.map((s) => d[s.dataKey] || 0)))
  );
  const numDataPoints = data.length;
  const numBarsInGroup = series.length;

  // Calculate widths for bars and groups
  const groupAvailableWidth =
    plotWidth > 0 && numDataPoints > 0 ? plotWidth / numDataPoints : 0;
  const groupPaddingRatio = 0.2; // Padding on each side of the group of bars
  const barAreaWidth = groupAvailableWidth * (1 - groupPaddingRatio); // Total width available for bars within a group

  // Padding between individual bars within a group
  const individualBarPadding =
    numBarsInGroup > 1 ? Math.max(1, barAreaWidth * 0.05) : 0;

  // Width of each individual bar
  const calculatedBarWidth =
    numBarsInGroup > 0
      ? Math.max(
          1,
          (barAreaWidth - individualBarPadding * (numBarsInGroup - 1)) /
            numBarsInGroup
        )
      : 0;

  let yTickValues: number[] = [];
  if (maxValue > 0 && plotHeight > 0) {
    if (Number.isInteger(maxValue) && maxValue <= 10) {
      for (let i = 0; i <= maxValue; i++) {
        yTickValues.push(i);
      }
    } else {
      const numberOfDivisions = 5;
      for (let i = 0; i <= numberOfDivisions; i++) {
        yTickValues.push(Math.round((maxValue / numberOfDivisions) * i));
      }
      yTickValues = Array.from(
        new Set([0, ...yTickValues, Math.round(maxValue)])
      ).sort((a, b) => a - b);
    }
  } else if (plotHeight > 0) {
    yTickValues = [0];
  }

  const yTicks = yTickValues.map((value) => {
    const effectiveMaxValueForYPos = maxValue === 0 ? 1 : maxValue;
    const yPos = plotHeight - (value / effectiveMaxValueForYPos) * plotHeight;
    return { value, yPos: Math.max(0, Math.min(plotHeight, yPos)) };
  });

  const handleMouseMove = (
    event: React.MouseEvent<SVGSVGElement, MouseEvent>
  ) => {
    if (tooltipData.visible && svgRef.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setTooltipData((prev) => ({
        ...prev,
        x: event.clientX - containerRect.left,
        y: event.clientY - containerRect.top,
      }));
    }
  };

  const handleMouseLeaveChart = () => {
    setTooltipData({ visible: false, x: 0, y: 0, contentHtml: null });
  };

  const handleBarMouseEnter = (event: React.MouseEvent, item: BarDataPoint) => {
    if (!svgRef.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    let tooltipContent = `<div style="font-weight: bold; margin-bottom: 4px; font-size:13px;">${item[dataKeyX]}</div>`;
    series.forEach((s) => {
      tooltipContent += `<div style="font-size:12px;"><span style="display:inline-block; width:10px; height:10px; margin-right:4px; background-color:${
        s.color
      }; border-radius: 2px;"></span> ${s.label}: ${
        item[s.dataKey] || 0
      }</div>`;
    });

    setTooltipData({
      visible: true,
      x: event.clientX - containerRect.left,
      y: event.clientY - containerRect.top,
      contentHtml: tooltipContent,
    });
  };

  return (
    <div
      ref={containerRef}
      className="w-full p-4 rounded-lg shadow-sm bg-white relative"
    >
      <style>{`
        .bar-chart-tooltip { position: absolute; background-color: rgba(30, 30, 30, 0.92); color: white; padding: 8px 12px; border-radius: 5px; font-size: 12px; line-height: 1.5; pointer-events: none; z-index: 1000; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2); white-space: nowrap; opacity: 0; transform: translate(-50%, calc(-100% - 12px)); transition: opacity 0.1s ease-out, transform 0.1s ease-out; }
        .bar-chart-tooltip.visible { opacity: 1; transform: translate(-50%, calc(-100% - 18px)); }
      `}</style>
      <p className="text-sm font-semibold mb-1 text-center text-gray-700">
        {title}
      </p>
      {/* Legend now generated from series prop */}
      <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 mb-3 text-xs">
        {series.map((s) => (
          <div key={s.dataKey} className="flex items-center">
            <span
              className="w-2.5 h-2.5 mr-1 rounded-sm"
              style={{ backgroundColor: s.color }}
            ></span>
            {s.label}
          </div>
        ))}
      </div>
      <div className="w-full overflow-x-auto">
        <svg
          ref={svgRef}
          width={svgContainerWidth > 0 ? svgContainerWidth : 300}
          height={chartHeight}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeaveChart}
        >
          <g transform={`translate(${marginLeft}, ${marginTop})`}>
            {yTicks.map((tick) => (
              <g key={`y-tick-${tick.value}-${tick.yPos}`}>
                {" "}
                <line
                  x1={0}
                  y1={tick.yPos}
                  x2={plotWidth}
                  y2={tick.yPos}
                  stroke="#e5e7eb"
                  strokeDasharray="2,2"
                />{" "}
                <text
                  x={-5}
                  y={tick.yPos + 3}
                  fontSize="16px"
                  textAnchor="end"
                  fill="gray"
                >
                  {" "}
                  {tick.value}{" "}
                </text>{" "}
              </g>
            ))}
            {plotWidth > 0 &&
              numDataPoints > 1 &&
              Array.from({ length: numDataPoints - 1 }).map((_, i) => {
                const xPosition = (i + 1) * groupAvailableWidth;
                return (
                  <line
                    key={`v-sep-${i}`}
                    x1={xPosition}
                    y1={0}
                    x2={xPosition}
                    y2={plotHeight}
                    stroke="#e0e0e0"
                    strokeWidth="1"
                  />
                );
              })}
            <line
              x1={0}
              y1={plotHeight}
              x2={plotWidth}
              y2={plotHeight}
              stroke="gray"
            />

            {plotWidth > 0 &&
              numDataPoints > 0 &&
              data.map((item, groupIndex) => {
                const groupXStartOuter = groupIndex * groupAvailableWidth; // Start of the entire group's allocated space
                const groupBarsXStart =
                  groupXStartOuter +
                  (groupAvailableWidth * groupPaddingRatio) / 2; // Actual start for drawing bars after left padding

                return (
                  <g
                    key={`group-${groupIndex}-${item[dataKeyX]}`}
                    className="bar-group"
                  >
                    {series.map((s, barIndex) => {
                      const val = item[s.dataKey] || 0;
                      const barHeight =
                        maxValue > 0
                          ? Math.max(0, (val / maxValue) * plotHeight)
                          : 0;
                      const barX =
                        groupBarsXStart +
                        barIndex * (calculatedBarWidth + individualBarPadding);

                      return (
                        <rect
                          key={s.dataKey}
                          x={barX}
                          y={plotHeight - barHeight}
                          width={
                            calculatedBarWidth > 0 ? calculatedBarWidth : 0
                          }
                          height={barHeight}
                          fill={s.color}
                          onMouseEnter={(e) => handleBarMouseEnter(e, item)}
                          className="cursor-pointer transition-opacity hover:opacity-80"
                        />
                      );
                    })}
                    <text
                      x={
                        groupBarsXStart +
                        barAreaWidth / 2 -
                        (groupAvailableWidth * groupPaddingRatio) / 2
                      }
                      y={plotHeight + 25}
                      fontSize="18px"
                      fontWeight="normal"
                      textAnchor="middle"
                      fill="#555555"
                    >
                      {item[dataKeyX]}
                    </text>
                  </g>
                );
              })}
          </g>
        </svg>
      </div>
      {tooltipData.visible && tooltipData.contentHtml && (
        <div
          className={`bar-chart-tooltip ${
            tooltipData.visible ? "visible" : ""
          }`}
          style={{ left: `${tooltipData.x}px`, top: `${tooltipData.y}px` }}
          dangerouslySetInnerHTML={{ __html: tooltipData.contentHtml }}
        />
      )}
    </div>
  );
};

export default BarChart;
