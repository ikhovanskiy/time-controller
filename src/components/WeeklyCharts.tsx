import React, { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DayData, TooltipProps } from "../types/types";
import { formatDuration } from "../helpers/dateUtils";
import { formatDate } from "../helpers/dateUtils";
import { useDomainTimeRecords } from "../hooks/useStorageData";
import { CHART_COLORS } from "../constants/colors";
import {
  DAYS_IN_WEEK,
  CHART_INNER_RADIUS,
  CHART_OUTER_RADIUS,
  CHART_PADDING_ANGLE,
  CHART_HEIGHT,
  MAX_DISPLAYED_DOMAINS,
} from "../constants/charts";
import "./WeeklyCharts.css";

const WeeklyCharts: React.FC = () => {
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const { records } = useDomainTimeRecords();

  const loadWeekData = useCallback(async () => {
    try {
      const weekData: DayData[] = [];
      const today = new Date();

      for (let i = DAYS_IN_WEEK - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        const dayDomains = new Map<string, number>();

        records.forEach((record) => {
          const dayTimestamps = record.timestamps.filter((timestamp) => {
            const timestampDate = new Date(timestamp);
            return timestampDate >= date && timestampDate < nextDay;
          });

          if (dayTimestamps.length > 0) {
            const dayTime = dayTimestamps.length * 1000;
            dayDomains.set(record.domain, dayTime);
          }
        });

        const totalTime = Array.from(dayDomains.values()).reduce(
          (sum, time) => sum + time,
          0
        );

        const domains = Array.from(dayDomains.entries())
          .map(([domain, time]) => ({
            domain,
            time,
            percentage: totalTime > 0 ? (time / totalTime) * 100 : 0,
          }))
          .sort((a, b) => b.time - a.time);

        weekData.push({
          date: formatDate(date),
          domains,
          totalTime,
        });
      }

      setWeekData(weekData);
    } catch (error) {
      console.error("Error loading week data:", error);
    }
  }, [records]);

  useEffect(() => {
    loadWeekData();
  }, [loadWeekData]);

  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chartTooltip">
          <p className="tooltipDomain">{data.domain}</p>
          <p className="tooltipTime">{formatDuration(data.time)}</p>
          <p className="tooltipPercentage">{data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="weeklyCharts">
      <h3>Время на доменах за последние 7 дней</h3>

      <div className="chartsGrid">
        {weekData.reverse().map((dayData) => (
          <div key={dayData.date} className="dayChart">
            <h4 className="dayTitle">{dayData.date}</h4>

            {dayData.totalTime > 0 ? (
              <>
                <div className="chartContainer">
                  <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                    <PieChart>
                      <Pie
                        data={dayData.domains}
                        cx="50%"
                        cy="50%"
                        innerRadius={CHART_INNER_RADIUS}
                        outerRadius={CHART_OUTER_RADIUS}
                        paddingAngle={CHART_PADDING_ANGLE}
                        dataKey="time"
                      >
                        {dayData.domains.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="daySummary">
                  <p className="totalTime">
                    Всего: {formatDuration(dayData.totalTime)}
                  </p>

                  <div className="domainsList">
                    {dayData.domains
                      .slice(0, MAX_DISPLAYED_DOMAINS)
                      .map((domain, index) => (
                        <div key={domain.domain} className="domainSummary">
                          <div
                            className={`domainColor domainColor${
                              index % CHART_COLORS.length
                            }`}
                          />
                          <span className="domainName">{domain.domain}</span>
                          <span className="domainTime">
                            {formatDuration(domain.time)}
                          </span>
                        </div>
                      ))}
                    {dayData.domains.length > MAX_DISPLAYED_DOMAINS && (
                      <div className="moreDomains">
                        +{dayData.domains.length - MAX_DISPLAYED_DOMAINS} еще
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="noData">
                <p>Нет данных</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export { WeeklyCharts };
