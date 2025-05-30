import React, { useState, useEffect, useCallback } from "react";
import { DomainTimeRecord, TimeConfig } from "../types/types";
import { isToday } from "../helpers/dateUtils";
import { formatDuration } from "../helpers/dateUtils";
import { loadDomainTimeRecords } from "../helpers/storageUtils";
import { useActiveSession } from "../hooks/useStorageData";
import { timeConfigController } from "./Settings";
import "./MainPage.css";

interface MainPageProps {
  timeConfig: TimeConfig;
}

const MainPage: React.FC<MainPageProps> = ({ timeConfig }) => {
  const [domainTimes, setDomainTimes] = useState<DomainTimeRecord[]>([]);
  const { activeSession } = useActiveSession();

  const loadDomainTimes = useCallback(async () => {
    try {
      const records = await loadDomainTimeRecords();

      const todayRecords = records
        .filter((record) => {
          const isActiveNow =
            activeSession && activeSession.domain === record.domain;

          return record.todaySeconds > 0 || isActiveNow;
        })
        .sort((a, b) => {
          const isActiveA = activeSession && activeSession.domain === a.domain;
          const isActiveB = activeSession && activeSession.domain === b.domain;

          if (isActiveA && !isActiveB) return -1;
          if (!isActiveA && isActiveB) return 1;

          return b.todaySeconds - a.todaySeconds;
        });

      setDomainTimes(todayRecords);
    } catch (error) {
      console.error("Error loading domain times:", error);
    }
  }, [activeSession]);

  useEffect(() => {
    loadDomainTimes();
  }, [loadDomainTimes]);

  const getDomainTimeLimit = (domain: string): number | null => {
    return timeConfigController.getDomainTimeLimit(timeConfig, domain);
  };

  return domainTimes.length === 0 ? (
    <p>Нет данных за сегодня</p>
  ) : (
    <div className="domainList">
      {domainTimes.map((domain) => {
        const timeLimit = getDomainTimeLimit(domain.domain);
        const currentSecond = domain.timestamps.filter(isToday).length;
        if (!currentSecond) return null;
        const currentTime = currentSecond * 1000;
        const isOverLimit = timeLimit && currentTime > timeLimit;

        return (
          <div
            key={domain.domain}
            className={`domainItem ${
              activeSession && activeSession.domain === domain.domain
                ? "activeDomain"
                : ""
            } ${isOverLimit ? "overLimit" : ""}`}
          >
            <div className="domainName">{domain.domain}</div>
            <div className="domainTime">
              {formatDuration(currentSecond * 1000)}
              {timeLimit && (
                <span className="limitInfo">/ {formatDuration(timeLimit)}</span>
              )}
            </div>
            {isOverLimit && <div className="warningIcon">⚠️</div>}
          </div>
        );
      })}
    </div>
  );
};

export { MainPage };
