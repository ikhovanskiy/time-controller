import { isToday } from "./helpers/dateUtils";
import { CurrentActiveTab, DomainTimeRecord, TimeConfig } from "./types/types";

let notificationElement: HTMLElement | null = null;

function createNotificationElement(): HTMLElement {
  const notification = document.createElement("div");
  notification.id = "time-controller-notification";
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2147483647;
    pointer-events: auto;
    animation: fadeIn 0.3s ease-out;
  `;

  notification.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-sizing: border-box;
      border: 2px solid rgba(255,255,255,0.2);
    ">
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <span style="font-size: 20px; flex-shrink: 0; margin-top: 1px;">⏰</span>
        <div style="flex: 1; line-height: 1.4;">
          <div style="font-weight: 700; font-size: 16px;">Превышен лимит времени</div>
        </div>
        <button id="time-controller-close" style="
          background: rgba(255,255,255,0.25);
          border: none;
          color: white;
          padding: 6px 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          flex-shrink: 0;
          transition: all 0.2s ease;
          font-weight: bold;
          line-height: 1;
        ">✕</button>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
    
    #time-controller-close:hover {
      background: rgba(255,255,255,0.4) !important;
      transform: scale(1.1);
    }
    
    #time-controller-notification {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
  `;
  document.head.appendChild(style);

  const closeButton = notification.querySelector("#time-controller-close");
  closeButton?.addEventListener("click", () => {
    removeNotification();
  });

  return notification;
}

function showNotification(): void {
  if (notificationElement) {
    return;
  }

  if (!document.body) {
    console.error("Document body not ready");
    return;
  }

  try {
    const existingNotification = document.getElementById(
      "time-controller-notification"
    );
    if (existingNotification) {
      existingNotification.remove();
    }

    notificationElement = createNotificationElement();
    document.body.appendChild(notificationElement);

    setTimeout(() => {
      if (notificationElement) {
        notificationElement.style.animation = "none";
      }
    }, 400);

    console.log("Notification shown successfully");
  } catch (error) {
    console.error("Error showing notification:", error);
  }
}

function removeNotification(): void {
  if (notificationElement) {
    notificationElement.style.animation =
      "slideInRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse";
    setTimeout(() => {
      if (notificationElement) {
        notificationElement.remove();
        notificationElement = null;
      }
    }, 300);
  }

  const existingNotification = document.getElementById(
    "time-controller-notification"
  );
  if (existingNotification && !notificationElement) {
    existingNotification.remove();
  }
}

async function checkTimeLimit(): Promise<void> {
  if (chrome.runtime?.id) {
    try {
      const recordsResult = await chrome.storage.local.get([
        "domainTimeRecords",
        "currentActiveTab",
        "timeConfig",
      ]);

      const records: DomainTimeRecord[] = recordsResult.domainTimeRecords || [];
      const currentActiveTab: CurrentActiveTab = recordsResult.currentActiveTab;
      const timeConfig: TimeConfig = recordsResult.timeConfig;

      const currentDomain = window.location.hostname;

      const domainRecord = records.find(
        (record) => record.domain === currentDomain
      );

      const domainConfig = timeConfig?.domainConfigs?.find(
        (config) => config.domain === currentDomain
      );

      if (!domainRecord || !domainConfig) return;

      if (currentActiveTab && currentActiveTab.domain !== currentDomain) return;

      if (domainRecord.todaySeconds * 1000 > domainConfig.timeLimit) {
        console.log("Time limit exceeded, showing notification");
        showNotification();
      }
    } catch (error) {
      console.error("Error checking time limit:", error);
    }
  }
}

function init(): void {
  checkTimeLimit();

  setInterval(() => {
    checkTimeLimit();
  }, 10000);

  setInterval(() => {
    if (!document.hidden) {
      recordActiveTabTime();
    }
  }, 1000);
}

async function recordDomainTime(domain: string): Promise<void> {
  try {
    const result = await chrome.storage.local.get(["domainTimeRecords"]);
    const records: DomainTimeRecord[] = result.domainTimeRecords || [];
    const time = Date.now();

    let domainRecord = records.find((record) => record.domain === domain);

    if (!domainRecord) {
      domainRecord = {
        domain,
        timestamps: [time],
        todaySeconds: 1,
      };

      records.push(domainRecord);
      await chrome.storage.local.set({ domainTimeRecords: records });
      return;
    }

    domainRecord.timestamps.push(time);

    domainRecord.todaySeconds = domainRecord.timestamps.filter((timestamp) =>
      isToday(timestamp)
    ).length;

    const recordIndex = records.findIndex((record) => record.domain === domain);
    if (recordIndex !== -1) {
      records[recordIndex] = domainRecord;
    }

    await chrome.storage.local.set({ domainTimeRecords: records });
  } catch (error) {
    console.error("Error recording domain time:", error);
  }
}

async function recordActiveTabTime(): Promise<void> {
  if (!chrome.runtime?.id) return;
  try {
    const domain = window.location.hostname;

    await recordDomainTime(domain);

    const currentActiveTab: CurrentActiveTab = {
      domain: domain,
    };

    await chrome.storage.local.set({
      currentActiveTab,
    });
  } catch (error) {
    console.error("Error recording active tab time:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
