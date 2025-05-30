import React, { useState, useEffect } from "react";
import { TimeConfig } from "../types/types";
import { TimeConfigController } from "../controllers/timeConfig";
import { DEFAULT_TIME_LIMIT, MINUTES_TO_MS } from "../constants/time";
import "./Settings.css";

const timeConfigController = new TimeConfigController();

interface SettingsProps {
  onConfigChange?: (config: TimeConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ onConfigChange }) => {
  const [timeConfig, setTimeConfig] = useState<TimeConfig>({
    defaultTimeLimit: DEFAULT_TIME_LIMIT,
    domainConfigs: [],
  });
  const [newDomain, setNewDomain] = useState("");
  const [newTimeLimit, setNewTimeLimit] = useState(60);

  useEffect(() => {
    loadTimeConfig();
  }, []);

  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(timeConfig);
    }
  }, [timeConfig, onConfigChange]);

  const loadTimeConfig = async () => {
    const config = await timeConfigController.loadTimeConfig();
    setTimeConfig(config);
  };

  const addDomainConfig = async () => {
    const newConfig = await timeConfigController.addDomainConfig(
      timeConfig,
      newDomain,
      newTimeLimit
    );
    setTimeConfig(newConfig);
    setNewDomain("");
    setNewTimeLimit(60);
  };

  const removeDomainConfig = async (domain: string) => {
    const newConfig = await timeConfigController.removeDomainConfig(
      timeConfig,
      domain
    );
    setTimeConfig(newConfig);
  };

  const toggleDomainConfig = async (domain: string) => {
    const newConfig = await timeConfigController.toggleDomainConfig(
      timeConfig,
      domain
    );
    setTimeConfig(newConfig);
  };

  const updateDomainTimeLimit = async (domain: string, timeLimit: number) => {
    const newConfig = await timeConfigController.updateDomainTimeLimit(
      timeConfig,
      domain,
      timeLimit
    );
    setTimeConfig(newConfig);
  };

  return (
    <div className="settingsPage">
      <h4>Настройки лимитов времени</h4>

      <div className="addDomain">
        <input
          type="text"
          placeholder="Домен (например: youtube.com или *.google.com)"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
        />
        <input
          type="number"
          placeholder="Лимит в минутах"
          value={newTimeLimit}
          onChange={(e) => setNewTimeLimit(Number(e.target.value))}
          min="1"
        />
        <button onClick={addDomainConfig}>Добавить</button>
      </div>

      <div className="domainConfigs">
        {timeConfig.domainConfigs.map((config) => (
          <div key={config.domain} className="domainConfig">
            <div className="configInfo">
              <span className={`domain ${!config.enabled ? "disabled" : ""}`}>
                {config.domain}
              </span>
              <input
                type="number"
                value={Math.floor(config.timeLimit / MINUTES_TO_MS)}
                onChange={(e) =>
                  updateDomainTimeLimit(config.domain, Number(e.target.value))
                }
                min="1"
                disabled={!config.enabled}
              />
              <span>мин</span>
            </div>
            <div className="configActions">
              <button
                onClick={() => toggleDomainConfig(config.domain)}
                className={config.enabled ? "enabled" : "disabled"}
              >
                {config.enabled ? "✓" : "✗"}
              </button>
              <button
                onClick={() => removeDomainConfig(config.domain)}
                className="remove"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Settings, timeConfigController };
