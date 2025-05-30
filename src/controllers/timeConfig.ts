import { TimeConfig as ITimeConfig } from "../types/types";
import { DEFAULT_TIME_LIMIT, MINUTES_TO_MS } from "../constants/time";

const DEFAULT_CONFIG: ITimeConfig = {
  defaultTimeLimit: DEFAULT_TIME_LIMIT,
  domainConfigs: [],
};

class TimeConfigController {
  public loadTimeConfig = async (): Promise<ITimeConfig> => {
    try {
      const result = await chrome.storage.local.get(["timeConfig"]);
      return result.timeConfig || DEFAULT_CONFIG;
    } catch (error) {
      console.error("Error loading time config:", error);
      return DEFAULT_CONFIG;
    }
  };

  private saveTimeConfig = async (config: ITimeConfig): Promise<void> => {
    try {
      await chrome.storage.local.set({ timeConfig: config });
    } catch (error) {
      console.error("Error saving time config:", error);
    }
  };

  private updateConfig = async (
    currentConfig: ITimeConfig,
    updater: (config: ITimeConfig) => ITimeConfig
  ): Promise<ITimeConfig> => {
    const newConfig = updater(currentConfig);
    await this.saveTimeConfig(newConfig);
    return newConfig;
  };

  public addDomainConfig = async (
    currentConfig: ITimeConfig,
    domain: string,
    timeLimit: number
  ): Promise<ITimeConfig> => {
    if (!domain.trim()) return currentConfig;

    return this.updateConfig(currentConfig, (config) => ({
      ...config,
      domainConfigs: [
        ...config.domainConfigs.filter((dc) => dc.domain !== domain.trim()),
        {
          domain: domain.trim(),
          timeLimit: timeLimit * MINUTES_TO_MS,
          enabled: true,
        },
      ],
    }));
  };

  public removeDomainConfig = async (
    currentConfig: ITimeConfig,
    domain: string
  ): Promise<ITimeConfig> => {
    return this.updateConfig(currentConfig, (config) => ({
      ...config,
      domainConfigs: config.domainConfigs.filter((dc) => dc.domain !== domain),
    }));
  };

  public toggleDomainConfig = async (
    currentConfig: ITimeConfig,
    domain: string
  ): Promise<ITimeConfig> => {
    return this.updateConfig(currentConfig, (config) => ({
      ...config,
      domainConfigs: config.domainConfigs.map((dc) =>
        dc.domain === domain ? { ...dc, enabled: !dc.enabled } : dc
      ),
    }));
  };

  public updateDomainTimeLimit = async (
    currentConfig: ITimeConfig,
    domain: string,
    timeLimit: number
  ): Promise<ITimeConfig> => {
    return this.updateConfig(currentConfig, (config) => ({
      ...config,
      domainConfigs: config.domainConfigs.map((dc) =>
        dc.domain === domain
          ? { ...dc, timeLimit: timeLimit * MINUTES_TO_MS }
          : dc
      ),
    }));
  };

  public getDomainTimeLimit = (
    config: ITimeConfig,
    domain: string
  ): number | null => {
    const domainConfig = config.domainConfigs.find((dc) => {
      if (dc.domain.startsWith("*.")) {
        const baseDomain = dc.domain.slice(2);
        return domain.endsWith(baseDomain);
      }
      return domain === dc.domain;
    });

    return domainConfig && domainConfig.enabled ? domainConfig.timeLimit : null;
  };
}

export { TimeConfigController };
