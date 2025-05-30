import { DomainTimeRecord } from "../types/types";

const loadDomainTimeRecords = async (): Promise<DomainTimeRecord[]> => {
  try {
    const result = await chrome.storage.local.get(["domainTimeRecords"]);
    return result.domainTimeRecords || [];
  } catch (error) {
    console.error("Error loading domain time records:", error);
    return [];
  }
};

const loadActiveSession = async () => {
  try {
    const result = await chrome.storage.local.get(["currentActiveTab"]);
    return result.currentActiveTab
      ? {
          domain: result.currentActiveTab.domain,
        }
      : null;
  } catch (error) {
    console.error("Error loading active session:", error);
    return null;
  }
};

export { loadDomainTimeRecords, loadActiveSession };
