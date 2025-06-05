// components/charts/BarChart.tsx
import React, { useState, useRef, useEffect } from "react";

interface BarDataPoint {
  [key: string]: any;
}

interface BarChartProps {
  data: BarDataPoint[];
  dataKeyX: string;
  dataKeyY1: string;
  dataKeyY2: string;
  labelY1: string;
  labelY2: string;
  title: string;
  colorY1?: string;
  colorY2?: string;
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
  dataKeyY1,
  dataKeyY2,
  labelY1,
  labelY2,
  title,
  colorY1 = "#F87171",
  colorY2 = "#22C55E",
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
  const marginBottom = 45; // MODIFIED: Increased for larger X-axis labels
  const marginLeft = 35;

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

  if (!data || data.length === 0) {
    return (
      <div
        ref={containerRef}
        className="w-full p-4 border rounded-lg shadow-sm bg-white"
      >
        <p className="text-sm font-semibold mb-1 text-center text-gray-700">
          {title}
        </p>
        <div className="h-[220px] flex items-center justify-center text-gray-500">
          Няма данни.
        </div>
      </div>
    );
  }

  const plotWidth = Math.max(0, svgContainerWidth - marginLeft - marginRight);
  const plotHeight = Math.max(0, chartHeight - marginTop - marginBottom);
  const maxValue = Math.max(
    1,
    ...data.map((d) => Math.max(d[dataKeyY1] || 0, d[dataKeyY2] || 0))
  );
  const numDataPoints = data.length;

  // These calculations determine how bars fit within the plotWidth
  const groupAvailableWidth =
    plotWidth > 0 && numDataPoints > 0 ? plotWidth / numDataPoints : 0;
  const groupPaddingRatio = 0.2;
  const barAreaWidth = groupAvailableWidth * (1 - groupPaddingRatio);
  const individualBarPadding = Math.max(1, barAreaWidth * 0.1);
  const barWidth = Math.max(1, (barAreaWidth - individualBarPadding) / 2);

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

    const content = `
      <div style="font-weight: bold; margin-bottom: 4px; font-size:13px;">${
        item[dataKeyX]
      }</div>
      <div style="font-size:12px;"><span style="display:inline-block; width:10px; height:10px; margin-right:4px; background-color:${colorY1}; border-radius: 2px;"></span> ${labelY1}: ${
      item[dataKeyY1] || 0
    }</div>
      <div style="font-size:12px;"><span style="display:inline-block; width:10px; height:10px; margin-right:4px; background-color:${colorY2}; border-radius: 2px;"></span> ${labelY2}: ${
      item[dataKeyY2] || 0
    }</div>
    `;
    setTooltipData({
      visible: true,
      x: event.clientX - containerRect.left,
      y: event.clientY - containerRect.top,
      contentHtml: content,
    });
  };

  return (
    <div
      ref={containerRef}
      className="w-full p-4 rounded-lg shadow-sm bg-white relative"
    >
      <style>{`
        .bar-chart-tooltip {
            position: absolute;
            background-color: rgba(30, 30, 30, 0.92);
            color: white;
            padding: 8px 12px;
            border-radius: 5px;
            font-size: 12px;
            line-height: 1.5;
            pointer-events: none;
            z-index: 1000;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            white-space: nowrap;
            opacity: 0;
            transform: translate(-50%, calc(-100% - 12px));
            transition: opacity 0.1s ease-out, transform 0.1s ease-out;
        }
        .bar-chart-tooltip.visible {
            opacity: 1;
            transform: translate(-50%, calc(-100% - 18px));
        }
      `}</style>
      <p className="text-sm font-semibold mb-1 text-center text-gray-700">
        {title}
      </p>
      <div className="flex justify-end space-x-3 mb-3 text-xs">
        <div className="flex items-center">
          <span
            className="w-2.5 h-2.5 mr-1 rounded-sm"
            style={{ backgroundColor: colorY1 }}
          ></span>
          {labelY1}
        </div>
        <div className="flex items-center">
          <span
            className="w-2.5 h-2.5 mr-1 rounded-sm"
            style={{ backgroundColor: colorY2 }}
          ></span>
          {labelY2}
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <svg
          ref={svgRef}
          // MODIFIED: SVG width should primarily be driven by its container's width.
          // Fallback to 300px if container width isn't available yet.
          width={svgContainerWidth > 0 ? svgContainerWidth : 300}
          height={chartHeight}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeaveChart}
        >
          <g transform={`translate(${marginLeft}, ${marginTop})`}>
            {/* Y-axis Grid Lines and Labels */}
            {yTicks.map((tick) => (
              <g key={`y-tick-${tick.value}-${tick.yPos}`}>
                <line
                  x1={0}
                  y1={tick.yPos}
                  x2={plotWidth}
                  y2={tick.yPos}
                  stroke="#e5e7eb"
                  strokeDasharray="2,2"
                />
                <text
                  x={-5}
                  y={tick.yPos + 3}
                  fontSize="16px"
                  textAnchor="end"
                  fill="gray"
                >
                  {tick.value}
                </text>
              </g>
            ))}

            {/* Vertical Separator Lines */}
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

            {/* X-axis Line */}
            <line
              x1={0}
              y1={plotHeight}
              x2={plotWidth}
              y2={plotHeight}
              stroke="gray"
            />

            {/* Bars and X-axis Labels */}
            {plotWidth > 0 &&
              numDataPoints > 0 &&
              data.map((item, index) => {
                const groupXStart =
                  index * groupAvailableWidth +
                  (groupAvailableWidth * groupPaddingRatio) / 2;

                const bar1X = groupXStart;
                const bar2X = groupXStart + barWidth + individualBarPadding;

                const val1 = item[dataKeyY1] || 0;
                const val2 = item[dataKeyY2] || 0;

                const bar1Height =
                  maxValue > 0
                    ? Math.max(0, (val1 / maxValue) * plotHeight)
                    : 0;
                const bar2Height =
                  maxValue > 0
                    ? Math.max(0, (val2 / maxValue) * plotHeight)
                    : 0;

                return (
                  <g
                    key={`group-${index}-${item[dataKeyX]}`}
                    className="bar-group"
                  >
                    <rect
                      x={bar1X}
                      y={plotHeight - bar1Height}
                      width={barWidth > 0 ? barWidth : 0}
                      height={bar1Height}
                      fill={colorY1}
                      onMouseEnter={(e) => handleBarMouseEnter(e, item)}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                    />
                    <rect
                      x={bar2X}
                      y={plotHeight - bar2Height}
                      width={barWidth > 0 ? barWidth : 0}
                      height={bar2Height}
                      fill={colorY2}
                      onMouseEnter={(e) => handleBarMouseEnter(e, item)}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                    />
                    {/* 👇 THIS IS WHERE YOU CHANGE THE X-AXIS LABEL FONT SIZE 👇 */}
                    <text
                      x={groupXStart + barAreaWidth / 2}
                      y={plotHeight + 25} // MODIFIED: Adjusted Y position
                      fontSize="18px" // MODIFIED: Increased font size
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
