interface DomainTimeRecord {
  domain: string;
  timestamps: number[];
  todaySeconds: number;
}

interface CurrentActiveTab {
  domain: string;
}

interface DomainConfig {
  domain: string;
  timeLimit: number;
  enabled: boolean;
}

interface TimeConfig {
  defaultTimeLimit: number;
  domainConfigs: DomainConfig[];
}

interface DayData {
  date: string;
  domains: DomainSummary[];
  totalTime: number;
}

interface DomainSummary {
  domain: string;
  time: number;
  percentage: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: DomainSummary;
  }>;
}

export type {
  CurrentActiveTab,
  DomainTimeRecord,
  TimeConfig,
  DayData,
  DomainSummary,
  TooltipProps,
};
