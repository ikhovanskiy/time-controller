import React, { useState, Suspense, lazy } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import "./App.css";
import { TimeConfig } from "../types/types";

const MainPage = lazy(() =>
  import("./MainPage").then((module) => ({ default: module.MainPage }))
);
const WeeklyCharts = lazy(() =>
  import("./WeeklyCharts").then((module) => ({ default: module.WeeklyCharts }))
);
const Settings = lazy(() =>
  import("./Settings").then((module) => ({ default: module.Settings }))
);

const ROUTES = {
  HOME: "/",
  WEEKLY: "/weekly",
  SETTINGS: "/settings",
} as const;

const PAGE_CONFIG = {
  [ROUTES.HOME]: {
    title: "Время на доменах сегодня",
    showBackButton: false,
    navigationButtons: [
      { to: ROUTES.WEEKLY, icon: "📈" },
      { to: ROUTES.SETTINGS, icon: "⚙️" },
    ],
  },
  [ROUTES.WEEKLY]: {
    title: "Недельная статистика",
    showBackButton: true,
    navigationButtons: [],
  },
  [ROUTES.SETTINGS]: {
    title: "Настройки",
    showBackButton: true,
    navigationButtons: [],
  },
} as const;

const App: React.FC = () => {
  const [timeConfig, setTimeConfig] = useState<TimeConfig>({
    defaultTimeLimit: 60 * 60 * 1000,
    domainConfigs: [],
  });
  const location = useLocation();

  const handleConfigChange = (config: TimeConfig) => {
    setTimeConfig(config);
  };

  const currentPageConfig =
    PAGE_CONFIG[location.pathname as keyof typeof PAGE_CONFIG] ||
    PAGE_CONFIG[ROUTES.HOME];

  return (
    <div className="app">
      <div className="header">
        <h3>{currentPageConfig.title}</h3>
        <div className="headerButtons">
          {currentPageConfig.showBackButton && (
            <Link to={ROUTES.HOME} className="settingsBtn">
              ← Назад
            </Link>
          )}
          {currentPageConfig.navigationButtons.map(({ to, icon }) => (
            <Link key={to} to={to} className="settingsBtn">
              {icon}
            </Link>
          ))}
        </div>
      </div>

      <Suspense fallback={<div className="loading">Загрузка...</div>}>
        <Routes>
          <Route
            path={ROUTES.HOME}
            element={<MainPage timeConfig={timeConfig} />}
          />
          <Route path={ROUTES.WEEKLY} element={<WeeklyCharts />} />
          <Route
            path={ROUTES.SETTINGS}
            element={<Settings onConfigChange={handleConfigChange} />}
          />
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export { App };
