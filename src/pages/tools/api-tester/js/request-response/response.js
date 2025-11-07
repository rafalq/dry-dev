import {state as appState} from '../state.js'
import { escapeHtml } from '../../../../../js/shared/helpers/escape-html.js';
import { formatBytes } from '../utils/format-bytes.js';

/**
 * Display API response
 * @param {Object} response - Response object
 * @param {string} url - Request URL
 * @param {boolean} isError - Is error response
 */
export function displayResponse(response, url, isError = false) {
  appState.lastResponse = response;

  // Remove existing response if any
  const existingResponse = document.querySelector(".response-section");
  if (existingResponse) {
    existingResponse.remove();
  }

  // Create response section
  const responseSection = createResponseSection(response, url, isError);

  // Insert after send button
  const sendSection = document.querySelector(".send-request-section");
  if (sendSection) {
    sendSection.insertAdjacentElement("afterend", responseSection);
  }

  // Initialize tabs
  initResponseTabs();

  // Scroll to response
  setTimeout(() => {
    responseSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

/**
 * Create response section HTML
 * @param {Object} response - Response object
 * @param {string} url - Request URL
 * @param {boolean} isError - Is error response
 * @returns {HTMLElement}
 */
function createResponseSection(response, url, isError) {
  const section = document.createElement("section");
  section.className = "response-section";
  section.style.cssText = `
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-card);
    padding: var(--space-6);
    margin-top: var(--space-8);
    box-shadow: var(--shadow-lg);
    animation: fadeIn 0.3s ease-in-out;
  `;

  // Request info
  const requestInfo = `
    <div style="
      padding: var(--space-4);
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-6);
      font-family: var(--font-mono);
      font-size: var(--font-size-sm);
    ">
      <div style="color: var(--text-secondary); margin-bottom: var(--space-2);">
        <strong>Request:</strong>
      </div>
      <div style="color: var(--text-primary);">
        ${appState.currentMethod} ${escapeHtml(url)}
      </div>
    </div>
  `;

  // Response header
  const statusIcon = isError
    ? '<i data-lucide="x-circle" style="width: 20px; height: 20px;"></i>'
    : response.ok
      ? '<i data-lucide="check-circle" style="width: 20px; height: 20px;"></i>'
      : '<i data-lucide="alert-circle" style="width: 20px; height: 20px;"></i>';

  const statusColor = isError
    ? "var(--color-error)"
    : response.ok
      ? "var(--color-success)"
      : "var(--color-warning)";

  const responseHeader = `
    <div style="
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-6);
      padding-bottom: var(--space-4);
      border-bottom: 2px solid var(--border-primary);
    ">
      <i data-lucide="file-text" style="width: 24px; height: 24px; color: var(--color-primary);"></i>
      <h3 style="
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--text-primary);
        margin: 0;
      ">RESPONSE</h3>
    </div>

    <div style="
      display: flex;
      align-items: center;
      gap: var(--space-4);
      flex-wrap: wrap;
      margin-bottom: var(--space-6);
      padding: var(--space-4);
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
    ">
      <div style="display: flex; align-items: center; gap: var(--space-2);">
        <span style="color: ${statusColor};">${statusIcon}</span>
        <strong style="color: ${statusColor}; font-size: var(--font-size-lg);">
          ${response.status} ${escapeHtml(response.statusText)}
        </strong>
      </div>
      <span style="color: var(--text-secondary);">•</span>
      <span style="color: var(--text-secondary); font-size: var(--font-size-sm);">
        ${response.time}ms
      </span>
      <span style="color: var(--text-secondary);">•</span>
      <span style="color: var(--text-secondary); font-size: var(--font-size-sm);">
        ${formatBytes(response.size)}
      </span>
    </div>
  `;

  // Response tabs
  const responseTabs = createResponseTabs(response, isError);

  section.innerHTML = requestInfo + responseHeader + responseTabs;

  // Reinit icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  return section;
}


/**
 * Create response tabs
 * @param {Object} response - Response object
 * @param {boolean} isError - Is error response
 * @returns {string}
 */
function createResponseTabs(response, isError) {
  const bodyContent = isError
    ? createErrorBody(response)
    : createResponseBody(response.data);

  const headersContent = createHeadersTable(response.headers);

  return `
    <div class="response-tabs">
      <div style="
        display: flex;
        gap: var(--space-4);
        margin-bottom: var(--space-6);
        border-bottom: 1px solid var(--border-primary);
      ">
        <button class="response-tab active" data-tab="body" style="
          padding: var(--space-3) var(--space-4);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: var(--transition-base);
        ">Body</button>
        <button class="response-tab" data-tab="headers" style="
          padding: var(--space-3) var(--space-4);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: var(--transition-base);
        ">Headers</button>
        <button class="response-tab" data-tab="raw" style="
          padding: var(--space-3) var(--space-4);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: var(--transition-base);
        ">Raw</button>
      </div>

      <div class="response-tab-content active" data-content="body">
        ${bodyContent}
      </div>

      <div class="response-tab-content" data-content="headers" style="display: none;">
        ${headersContent}
      </div>

      <div class="response-tab-content" data-content="raw" style="display: none;">
        ${createRawResponse(response)}
      </div>

      <div style="
        display: flex;
        gap: var(--space-3);
        margin-top: var(--space-6);
        padding-top: var(--space-4);
        border-top: 1px solid var(--border-primary);
      ">
        <button class="btn btn-secondary btn-sm" onclick="copyResponse()">
          <i data-lucide="copy" style="width: 14px; height: 14px;"></i>
          Copy Response
        </button>
        <button class="btn btn-secondary btn-sm" onclick="exportResponse()">
          <i data-lucide="download" style="width: 14px; height: 14px;"></i>
          Export
        </button>
      </div>
    </div>
  `;
}

/**
 * Create response body content
 * @param {any} data - Response data
 * @returns {string}
 */
function createResponseBody(data) {
  let jsonString;

  try {
    jsonString =
      typeof data === "string" ? data : JSON.stringify(data, null, 2);
  } catch (error) {
    jsonString = String(data);
  }

  const lines = jsonString.split("\n");
  const lineNumbers = lines.map((_, i) => `<div>${i + 1}</div>`).join("");

  return `
    <div style="
      background: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg);
      overflow: hidden;
    ">
      <div style="display: grid; grid-template-columns: auto 1fr; max-height: 100vh; overflow-y: auto; overflow-x: auto;">
        <div style="
          padding: var(--space-4) var(--space-3);
          background: var(--bg-tertiary);
          border-right: 1px solid var(--border-primary);
          font-family: var(--font-mono);
          font-size: var(--font-size-sm);
          color: var(--text-tertiary);
          text-align: right;
          user-select: none;
          line-height: 1.6;
        ">
          ${lineNumbers}
        </div>
        <pre style="
          padding: var(--space-4);
          margin: 0;
          font-family: var(--font-mono);
          font-size: var(--font-size-sm);
          color: var(--text-primary);
          line-height: 1.6;
        ">${escapeHtml(jsonString)}</pre>
      </div>
    </div>
  `;
}

/**
 * Create error body content
 * @param {Object} response - Response object
 * @returns {string}
 */
function createErrorBody(response) {
  const errorData = response.data;

  return `
    <div style="
      padding: var(--space-6);
      background: var(--color-error-light);
      border: 1px solid var(--color-error);
      border-radius: var(--radius-lg);
      color: var(--color-error-dark);
    ">
      <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4);">
        <i data-lucide="alert-triangle" style="width: 24px; height: 24px;"></i>
        <strong style="font-size: var(--font-size-lg);">
          ${escapeHtml(errorData.type || "Error")}
        </strong>
      </div>
      <p style="margin: 0; font-size: var(--font-size-base);">
        ${escapeHtml(errorData.error || "An error occurred")}
      </p>
    </div>

    ${
      response.statusText
        ? `
      <div style="margin-top: var(--space-6);">
        <h4 style="
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          margin-bottom: var(--space-4);
        ">Error Details:</h4>
        <ul style="
          list-style: disc;
          padding-left: var(--space-6);
          color: var(--text-secondary);
        ">
          <li>Status: ${escapeHtml(response.statusText)}</li>
          <li>Message: ${escapeHtml(errorData.error || "Request failed")}</li>
        </ul>
      </div>
    `
        : ""
    }
  `;
}

/**
 * Create headers table
 * @param {Object} headers - Response headers
 * @returns {string}
 */
function createHeadersTable(headers) {
  if (!headers || Object.keys(headers).length === 0) {
    return `
      <div style="
        padding: var(--space-6);
        text-align: center;
        color: var(--text-tertiary);
      ">
        No headers available
      </div>
    `;
  }

  const rows = Object.entries(headers)
    .map(
      ([key, value]) => `
    <tr style="border-bottom: 1px solid var(--border-primary);">
      <td style="
        padding: var(--space-3) var(--space-4);
        font-family: var(--font-mono);
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
      ">${escapeHtml(key)}</td>
      <td style="
        padding: var(--space-3) var(--space-4);
        font-family: var(--font-mono);
        font-size: var(--font-size-sm);
        color: var(--text-primary);
      ">${escapeHtml(value)}</td>
    </tr>
  `,
    )
    .join("");

  return `
    <div style="overflow-x: auto;">
      <table style="
        width: 100%;
        border-collapse: collapse;
        background: var(--bg-secondary);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-lg);
      ">
        <thead>
          <tr style="
            background: var(--bg-tertiary);
            border-bottom: 2px solid var(--border-primary);
          ">
            <th style="
              padding: var(--space-3) var(--space-4);
              text-align: left;
              font-size: var(--font-size-sm);
              font-weight: var(--font-weight-semibold);
              color: var(--text-secondary);
              text-transform: uppercase;
            ">Header Name</th>
            <th style="
              padding: var(--space-3) var(--space-4);
              text-align: left;
              font-size: var(--font-size-sm);
              font-weight: var(--font-weight-semibold);
              color: var(--text-secondary);
              text-transform: uppercase;
            ">Value</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Create raw response content
 * @param {Object} response - Response object
 * @returns {string}
 */
function createRawResponse(response) {
  const rawData = JSON.stringify(
    {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      body: response.data,
    },
    null,
    2,
  );

  return `
    <pre style="
      padding: var(--space-4);
      margin: 0;
      font-family: var(--font-mono);
      font-size: var(--font-size-sm);
      color: var(--text-primary);
      background: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg);
      overflow-x: auto;
      line-height: 1.6;
    ">${escapeHtml(rawData)}</pre>
  `;
}

/**
 * Initialize response tabs
 */
function initResponseTabs() {
  const tabs = document.querySelectorAll(".response-tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const targetTab = this.dataset.tab;

      // Remove active from all tabs
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.style.color = "var(--text-secondary)";
        t.style.borderBottomColor = "transparent";
      });

      // Add active to clicked tab
      this.classList.add("active");
      this.style.color = "var(--color-primary)";
      this.style.borderBottomColor = "var(--color-primary)";

      // Hide all content
      document.querySelectorAll(".response-tab-content").forEach((content) => {
        content.style.display = "none";
        content.classList.remove("active");
      });

      // Show target content
      const targetContent = document.querySelector(
        `.response-tab-content[data-content="${targetTab}"]`,
      );
      if (targetContent) {
        targetContent.style.display = "block";
        targetContent.classList.add("active");
      }
    });
  });
}

/**
 * Copy response to clipboard
 */
function copyResponse() {
  if (!appState.lastResponse) {
    ToastSystem.error("No response to copy");
    return;
  }

  const text = JSON.stringify(appState.lastResponse.data, null, 2);

  navigator.clipboard
    .writeText(text)
    .then(() => {
      ToastSystem.success("Response copied to clipboard");
    })
    .catch(() => {
      ToastSystem.error("Failed to copy response");
    });
}

/**
 * Export response as JSON file
 */
function exportResponse() {
  if (!appState.lastResponse) {
    ToastSystem.error("No response to export");
    return;
  }

  const data = JSON.stringify(appState.lastResponse.data, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `api-response-${Date.now()}.json`;
  a.click();

  URL.revokeObjectURL(url);
  ToastSystem.success("Response exported");
}

window.copyResponse = copyResponse;
window.exportResponse = exportResponse;