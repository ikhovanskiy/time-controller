import { useState, useEffect } from "react";
import { DomainTimeRecord, CurrentActiveTab } from "../types/types";
import {
  loadDomainTimeRecords,
  loadActiveSession,
} from "../helpers/storageUtils";
import { ACTIVE_SESSION_REFRESH_INTERVAL } from "../constants/time";

const useActiveSession = () => {
  const [activeSession, setActiveSession] = useState<CurrentActiveTab | null>(
    null
  );

  const loadData = async () => {
    const session = await loadActiveSession();
    setActiveSession(session);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, ACTIVE_SESSION_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return { activeSession, refreshActiveSession: loadData };
};

const useDomainTimeRecords = () => {
  const [records, setRecords] = useState<DomainTimeRecord[]>([]);

  const loadData = async () => {
    const data = await loadDomainTimeRecords();
    setRecords(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  return { records, refreshRecords: loadData };
};

export { useActiveSession, useDomainTimeRecords };
