// components/charts/BarChart.tsx
import React, { useState, useRef, useEffect } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

interface BarDataPoint {
  [key: string]: any;
}

export interface BarSeriesConfig {
  dataKey: string;
  label: string;
  color: string;
}

interface BarChartProps {
  data: BarDataPoint[];
  dataKeyX: string;
  series: BarSeriesConfig[];
  title: string;
  barStyle?: "grouped" | "stacked";
  onBarClick?: (dataPoint: BarDataPoint) => void;
  onChartAreaRightClick?: (event: React.MouseEvent) => void;
  onBarMiddleClick?: (
    dataPoint: BarDataPoint,
    event: React.MouseEvent,
    seriesKey?: string
  ) => void;
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
  series,
  title,
  barStyle = "grouped",
  onBarClick,
  onChartAreaRightClick,
  onBarMiddleClick,
}) => {
  const [tooltipData, setTooltipData] = useState<TooltipData>({
    visible: false,
    x: 0,
    y: 0,
    contentHtml: null,
  });
  const [hoverOverlay, setHoverOverlay] = useState<{
    x: number;
    width: number;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContainerWidth, setSvgContainerWidth] = useState(0);

  const chartHeight = 220;
  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 45;
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

  useEffect(() => {
    setHoverOverlay(null);
    hideTooltip();
  }, [data, title]);

  const plotWidth = Math.max(0, svgContainerWidth - marginLeft - marginRight);
  const plotHeight = Math.max(0, chartHeight - marginTop - marginBottom);

  const maxValue =
    barStyle === "stacked"
      ? Math.max(
          1,
          ...data.map((d) =>
            series.reduce((sum, s) => sum + (d[s.dataKey] || 0), 0)
          )
        )
      : Math.max(
          1,
          ...data.map((d) => Math.max(...series.map((s) => d[s.dataKey] || 0)))
        );

  const numDataPoints = data.length;
  const numBarsInGroup = series.length;

  const groupAvailableWidth =
    plotWidth > 0 && numDataPoints > 0 ? plotWidth / numDataPoints : 0;
  const groupPaddingRatio = 0.2;
  const barAreaWidth = groupAvailableWidth * (1 - groupPaddingRatio);

  const individualBarPadding =
    numBarsInGroup > 1 ? Math.max(1, barAreaWidth * 0.05) : 0;
  const groupedBarWidth =
    numBarsInGroup > 0
      ? Math.max(
          1,
          (barAreaWidth - individualBarPadding * (numBarsInGroup - 1)) /
            numBarsInGroup
        )
      : 0;

  const stackedBarWidth = Math.max(1, barAreaWidth);

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

  const hideTooltip = () => {
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

  const handleGroupMouseLeave = () => {
    hideTooltip();
    setHoverOverlay(null);
  };

  return (
    <div
      ref={containerRef}
      className="w-full p-4 rounded-lg shadow-sm bg-white relative"
    >
      <div className="group absolute top-2 right-2 z-10">
        <QuestionMarkCircleIcon className="h-5 w-5 text-gray-400 cursor-help group-hover:text-sky-600 transition-colors" />
        <div className="absolute bottom-full right-0 mb-2 w-max p-3 rounded-md shadow-lg bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <ul className="space-y-1 text-left">
            <li>
              <strong className="font-semibold">Ляв клик:</strong> Увеличаване
            </li>
            <li>
              <strong className="font-semibold">Десен клик:</strong>{" "}
              Отдалечаване
            </li>
            {onBarMiddleClick && (
              <li>
                <strong className="font-semibold">Среден клик:</strong> Преглед
                на конкретните сигнали
              </li>
            )}
          </ul>
          <div className="absolute top-full right-2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
        </div>
      </div>
      <style>{`
        .bar-chart-tooltip { position: absolute; background-color: rgba(30, 30, 30, 0.92); color: white; padding: 8px 12px; border-radius: 5px; font-size: 12px; line-height: 1.5; pointer-events: none; z-index: 1000; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2); white-space: nowrap; opacity: 0; transform: translate(-50%, calc(-100% - 12px)); transition: opacity 0.1s ease-out, transform 0.1s ease-out; }
        .bar-chart-tooltip.visible { opacity: 1; transform: translate(-50%, calc(-100% - 18px)); }
      `}</style>
      <p className="text-sm font-semibold mb-1 text-center text-gray-700">
        {title ? title : "Няма дефиниран период"}
      </p>

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

      <div style={{ height: `${chartHeight}px` }} className="w-full">
        {!data || data.length === 0 || !series || series.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Няма данни
            {(!series || series.length === 0) && "или конфигурация на сериите"}.
          </div>
        ) : (
          <div className="w-full h-full overflow-x-auto">
            <svg
              ref={svgRef}
              width={svgContainerWidth > 0 ? svgContainerWidth : 300}
              height={chartHeight}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleGroupMouseLeave}
              onContextMenu={(e) =>
                onChartAreaRightClick && onChartAreaRightClick(e)
              }
            >
              <g transform={`translate(${marginLeft}, ${marginTop})`}>
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

                {plotWidth > 0 &&
                  numDataPoints > 1 &&
                  Array.from({ length: numDataPoints - 1 }).map((_, i) => (
                    <line
                      key={`v-sep-${i}`}
                      x1={(i + 1) * groupAvailableWidth}
                      y1={0}
                      x2={(i + 1) * groupAvailableWidth}
                      y2={plotHeight}
                      stroke="#e0e0e0"
                      strokeWidth="1"
                    />
                  ))}

                <line
                  x1={0}
                  y1={plotHeight}
                  x2={plotWidth}
                  y2={plotHeight}
                  stroke="gray"
                />

                {hoverOverlay && (
                  <rect
                    x={hoverOverlay.x}
                    y={0}
                    width={hoverOverlay.width}
                    height={plotHeight}
                    fill="gray"
                    opacity="0.1"
                    style={{ pointerEvents: "none" }}
                  />
                )}

                {plotWidth > 0 &&
                  numDataPoints > 0 &&
                  data.map((item, groupIndex) => {
                    const groupXStartOuter = groupIndex * groupAvailableWidth;
                    const groupContentXStart =
                      groupXStartOuter +
                      (groupAvailableWidth * groupPaddingRatio) / 2;
                    const totalValue = series.reduce(
                      (sum, s) => sum + (item[s.dataKey] || 0),
                      0
                    );

                    return (
                      <g key={`group-${groupIndex}-${item[dataKeyX]}`}>
                        <g style={{ pointerEvents: "none" }}>
                          {barStyle === "stacked"
                            ? (() => {
                                let cumulativeHeight = 0;
                                return series.map((s) => {
                                  const val = item[s.dataKey] || 0;
                                  if (val === 0) return null;
                                  const barHeight =
                                    maxValue > 0
                                      ? (val / maxValue) * plotHeight
                                      : 0;
                                  const barY =
                                    plotHeight - barHeight - cumulativeHeight;
                                  cumulativeHeight += barHeight;
                                  return (
                                    <rect
                                      key={s.dataKey}
                                      x={groupContentXStart}
                                      y={barY}
                                      width={stackedBarWidth}
                                      height={barHeight}
                                      fill={s.color}
                                    />
                                  );
                                });
                              })()
                            : series.map((s, barIndex) => {
                                const val = item[s.dataKey] || 0;
                                const barHeight =
                                  maxValue > 0
                                    ? (val / maxValue) * plotHeight
                                    : 0;
                                const barX =
                                  groupContentXStart +
                                  barIndex *
                                    (groupedBarWidth + individualBarPadding);
                                return (
                                  <rect
                                    key={s.dataKey}
                                    x={barX}
                                    y={plotHeight - barHeight}
                                    width={groupedBarWidth}
                                    height={barHeight}
                                    fill={s.color}
                                  />
                                );
                              })}
                        </g>

                        {barStyle === "stacked" ? (
                          <rect
                            x={groupXStartOuter}
                            y={0}
                            width={groupAvailableWidth}
                            height={plotHeight}
                            fill="transparent"
                            className={totalValue > 0 ? "cursor-pointer" : ""}
                            onMouseEnter={(e) => {
                              if (totalValue > 0) {
                                handleBarMouseEnter(e, item);
                                setHoverOverlay({
                                  x: groupXStartOuter,
                                  width: groupAvailableWidth,
                                });
                              }
                            }}
                            onMouseLeave={handleGroupMouseLeave}
                            onClick={() => {
                              if (totalValue > 0) onBarClick?.(item);
                            }}
                            onMouseDown={(e) => {
                              if (e.button === 1 && totalValue > 0)
                                onBarMiddleClick?.(item, e);
                            }}
                          />
                        ) : (
                          <>
                            <rect
                              x={groupXStartOuter}
                              y={0}
                              width={groupAvailableWidth}
                              height={plotHeight}
                              fill="transparent"
                              className={totalValue > 0 ? "cursor-pointer" : ""}
                              onClick={() => {
                                if (totalValue > 0) onBarClick?.(item);
                              }}
                            />
                            {series.map((s, barIndex) => {
                              const barX =
                                groupContentXStart +
                                barIndex *
                                  (groupedBarWidth + individualBarPadding);
                              return (
                                <rect
                                  key={`hitbox-${s.dataKey}`}
                                  x={barX}
                                  y={0}
                                  width={groupedBarWidth}
                                  height={plotHeight}
                                  fill="transparent"
                                  className={
                                    totalValue > 0 ? "cursor-pointer" : ""
                                  }
                                  onMouseEnter={(e) => {
                                    if (totalValue > 0) {
                                      handleBarMouseEnter(e, item);
                                      setHoverOverlay({
                                        x: barX,
                                        width: groupedBarWidth,
                                      });
                                    }
                                  }}
                                  onMouseLeave={handleGroupMouseLeave}
                                  onClick={() => {
                                    if (totalValue > 0) onBarClick?.(item);
                                  }}
                                  onMouseDown={(e) => {
                                    if (e.button === 1 && totalValue > 0) {
                                      e.stopPropagation();
                                      onBarMiddleClick?.(item, e, s.dataKey);
                                    }
                                  }}
                                />
                              );
                            })}
                          </>
                        )}

                        <text
                          x={groupXStartOuter + groupAvailableWidth / 2}
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
        )}
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
