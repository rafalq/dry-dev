import { CONFIG } from "../config.js";
import {state as appState} from "../state.js";
import { escapeHtml } from "../../../../../js/shared/helpers/escape-html.js";
import { updateLineNumbers } from "../utils/dom.js";
import { collectHeaders, collectQueryParams } from "../request-response/builder.js";

/**
 * Validate history item structure
 * @param {Object} item - History item to validate
 * @returns {boolean} True if valid
 */
function isValidHistoryItem(item) {
  return (
    item &&
    typeof item === 'object' &&
    item.id &&
    item.request &&
    item.response &&
    typeof item.response.ok === 'boolean'
  );
}

/**
 * Save request to history
 * @param {Object} request - Request data
 */
export function saveToHistory(request) {
  let history = getHistory();

  // Add to beginning
  history.unshift(request);

  // Limit size
  if (history.length > CONFIG.maxHistoryItems) {
    history = history.slice(0, CONFIG.maxHistoryItems);
  }

  // Save to localStorage
  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(history));
    console.log("💾 Saved to history");
  } catch (error) {
    console.error("Failed to save history:", error);
  }

  // Re-render history
  renderHistory();
}

/**
 * Get history from localStorage
 * @returns {Array}
 */
function getHistory() {
  try {
    const data = localStorage.getItem(CONFIG.storageKey);
    if (!data) return [];
    
    const history = JSON.parse(data);
    return history.filter(isValidHistoryItem); 
  } catch (error) {
    console.error("Failed to load history:", error);
    return [];
  }
}

/**
 * Render request history
 */
export function renderHistory() {
  const history = getHistory();

  // Check if history section exists
  let historySection = document.querySelector(".history-section");

  if (!historySection) {
    // Create history section
    historySection = document.createElement("section");
    historySection.className = "history-section";
    historySection.style.cssText = `
      background: var(--bg-primary);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-card);
      padding: var(--space-6);
      margin-top: var(--space-8);
      box-shadow: var(--shadow-sm);
    `;

    // Insert at end of container
    const container = document.querySelector(".api-tester-container");
    if (container) {
      container.appendChild(historySection);
    }
  }

  if (history.length === 0) {
    historySection.innerHTML = `
      <h3 style="
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--text-primary);
        margin-bottom: var(--space-4);
      ">
        <i data-lucide="clock" style="width: 20px; height: 20px; display: inline; vertical-align: middle;"></i>
        Request History
      </h3>
      <p style="color: var(--text-secondary); text-align: center; padding: var(--space-8);">
        No requests yet. Send your first request to see it here.
      </p>
    `;
    return;
  }

  // Group by date
  const grouped = groupHistoryByDate(history);

  let historyHtml = `
    <div style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-6);
      padding-bottom: var(--space-4);
      border-bottom: 2px solid var(--border-primary);
    ">
      <h3 style="
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--text-primary);
        margin: 0;
      ">
        <i data-lucide="clock" style="width: 20px; height: 20px; display: inline; vertical-align: middle;"></i>
        Request History
      </h3>
      <button class="btn btn-secondary btn-sm" onclick="clearHistory()">
        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
        Clear History
      </button>
    </div>
  `;

  Object.entries(grouped).forEach(([date, requests]) => {
    historyHtml += `
      <div style="margin-bottom: var(--space-6);">
        <h4 style="
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--text-secondary);
          margin-bottom: var(--space-4);
          text-transform: uppercase;
          letter-spacing: var(--letter-spacing-wide);
        ">${date}:</h4>
        ${requests.map((req, index) => createHistoryItem(req, index)).filter(Boolean).join("")}
      </div>
    `;
  });

  historySection.innerHTML = historyHtml;

  // Reinit icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Group history by date
 * @param {Array} history - History array
 * @returns {Object}
 */
function groupHistoryByDate(history) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const grouped = {
    Today: [],
    Yesterday: [],
  };

  history.forEach((item) => {
    const itemDate = new Date(item.timestamp);
    itemDate.setHours(0, 0, 0, 0);

    if (itemDate.getTime() === today.getTime()) {
      grouped.Today.push(item);
    } else if (itemDate.getTime() === yesterday.getTime()) {
      grouped.Yesterday.push(item);
    } else {
      const dateKey = itemDate.toLocaleDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    }
  });

  // Remove empty groups
  Object.keys(grouped).forEach((key) => {
    if (grouped[key].length === 0) {
      delete grouped[key];
    }
  });

  return grouped;
}

/**
 * Create history item HTML
 * @param {Object} request - Request data
 * @param {number} index - Item index
 * @returns {string}
 */
function createHistoryItem(request, index) {
  if (!isValidHistoryItem(item)) return null;

  const statusIcon = request.response.ok
    ? '<i data-lucide="check-circle" style="width: 16px; height: 16px; color: var(--color-success);"></i>'
    : '<i data-lucide="x-circle" style="width: 16px; height: 16px; color: var(--color-error);"></i>';

  const time = new Date(request.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const domain = new URL(request.url).hostname;

  return `
    <div style="
      padding: var(--space-4);
      background: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-3);
      transition: var(--transition-base);
    "
    onmouseover="this.style.borderColor='var(--color-primary)'"
    onmouseout="this.style.borderColor='var(--border-primary)'">
      <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2);">
        ${statusIcon}
        <strong style="
          font-family: var(--font-mono);
          font-size: var(--font-size-sm);
          color: var(--color-primary);
        ">${request.method}</strong>
        <span style="
          font-family: var(--font-mono);
          font-size: var(--font-size-sm);
          color: var(--text-primary);
        ">${escapeHtml(request.url.split("?")[0].split("/").pop() || "/")}</span>
      </div>
      <div style="
        font-size: var(--font-size-xs);
        color: var(--text-tertiary);
        margin-bottom: var(--space-3);
      ">
        ${request.response.status} ${request.response.statusText} • ${request.response.time}ms • ${time}
        <br>${escapeHtml(domain)}
      </div>
      <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
        <button
          class="btn btn-sm"
          style="
            padding: var(--space-2) var(--space-3);
            font-size: var(--font-size-xs);
            background: var(--color-primary);
            color: var(--color-white);
            border: none;
          "
          onclick='rerunRequest(${JSON.stringify(request).replace(/'/g, "&apos;")})'
        >
          <i data-lucide="play" style="width: 12px; height: 12px;"></i>
          Rerun
        </button>
        <button
          class="btn btn-secondary btn-sm"
          style="
            padding: var(--space-2) var(--space-3);
            font-size: var(--font-size-xs);
          "
          onclick='editRequest(${JSON.stringify(request).replace(/'/g, "&apos;")})'
        >
          <i data-lucide="edit" style="width: 12px; height: 12px;"></i>
          Edit
        </button>
        <button
          class="btn btn-secondary btn-sm"
          style="
            padding: var(--space-2) var(--space-3);
            font-size: var(--font-size-xs);
          "
          onclick="deleteHistoryItem(${index})"
        >
          <i data-lucide="trash" style="width: 12px; height: 12px;"></i>
          Delete
        </button>
      </div>
    </div>
  `;
}

/**
 * Save last request state
 */
export function saveLastRequest() {
  const urlInput = document.querySelector(
    '.url-input-group .input[type="text"]',
  );
  const textarea = document.querySelector(".code-textarea");

  const lastRequest = {
    method: appState.currentMethod,
    url: urlInput?.value || "",
    body: textarea?.value || "",
    headers: collectHeaders(),
    queryParams: collectQueryParams(),
  };

  try {
    localStorage.setItem(
      CONFIG.lastRequestKey,
      JSON.stringify(lastRequest),
    );
  } catch (error) {
    console.error("Failed to save last request:", error);
  }
}

/**
 * Load last request state
 */
export function loadLastRequest() {
  try {
    const data = localStorage.getItem(CONFIG.lastRequestKey);
    if (!data) return;

    const lastRequest = JSON.parse(data);

    // Set method
    const methodBtn = document.querySelector(
      `.method-btn[data-method="${lastRequest.method}"]`,
    );
    if (methodBtn) {
      methodBtn.click();
    }

    // Set URL
    const urlInput = document.querySelector(
      '.url-input-group .input[type="text"]',
    );
    if (urlInput && lastRequest.url) {
      urlInput.value = lastRequest.url;
    }

    // Set body
    const textarea = document.querySelector(".code-textarea");
    if (textarea && lastRequest.body) {
      textarea.value = lastRequest.body;
      updateLineNumbers();
    }

    console.log("📝 Loaded last request");
  } catch (error) {
    console.error("Failed to load last request:", error);
  }
}

/**
 * Delete history item
 * @param {number} index - Item index in today's history
 */
function deleteHistoryItem(index) {
  let history = getHistory();
  history.splice(index, 1);

  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(history));
    renderHistory();
    ToastSystem.success("Request deleted");
  } catch (error) {
    ToastSystem.error("Failed to delete request");
  }
}

/**
 * Clear all history
 */
function clearHistory() {
  // Use modal system if available
  if (window.ModalSystem) {
    window.ModalSystem.showConfirm(
      "Clear History",
      "Are you sure you want to clear all request history? This action cannot be undone.",
      () => {
        try {
          localStorage.removeItem(CONFIG.storageKey);
          renderHistory();
          ToastSystem.success("History cleared");
        } catch (error) {
          ToastSystem.error("Failed to clear history");
        }
      },
    );
  } else {
    // Fallback to confirm
    if (confirm("Are you sure you want to clear all history?")) {
      try {
        localStorage.removeItem(CONFIG.storageKey);
        renderHistory();
        ToastSystem.success("History cleared");
      } catch (error) {
        ToastSystem.error("Failed to clear history");
      }
    }
  }
}

window.deleteHistoryItem = deleteHistoryItem;
window.clearHistory = clearHistory;