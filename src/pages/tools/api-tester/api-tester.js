/**
 * ========================================
 * API TESTER - REQUEST BUILDER & HISTORY
 * Full-featured API testing tool with localStorage persistence
 * ========================================
 */

// ===== CONFIGURATION =====
const API_CONFIG = {
  maxHistoryItems: 50,
  requestTimeout: 30000, // 30 seconds
  defaultHeaders: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  storageKey: "api_tester_history",
  lastRequestKey: "api_tester_last_request",
};

// ===== STATE MANAGEMENT =====
let appState = {
  currentMethod: "GET",
  currentUrl: "",
  headers: [],
  queryParams: [],
  requestBody: "",
  isLoading: false,
  lastResponse: null,
  activeTab: "body",
};

// ===== INITIALIZATION =====
/**
 * Initialize API Tester
 */
function initApiTester() {
  initMethodButtons();
  initHeadersAndParams();
  initRequestBody();
  initSendButton();
  initQuickFill();
  loadLastRequest();
  renderHistory();

  console.log("✅ API Tester initialized");
}

// ===== METHOD SELECTOR =====
/**
 * Initialize HTTP method buttons
 */
function initMethodButtons() {
  const methodButtons = document.querySelectorAll(".method-btn");

  methodButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active from all
      methodButtons.forEach((b) => b.classList.remove("active"));

      // Add active to clicked
      this.classList.add("active");

      // Update state
      appState.currentMethod = this.dataset.method;

      console.log(`🔧 Method changed: ${appState.currentMethod}`);
    });
  });
}

// ===== HEADERS MANAGEMENT =====
/**
 * Initialize headers and query parameters
 */
function initHeadersAndParams() {
  const headersSections = document.querySelectorAll(".params-section");

  // Find headers section
  const headersSection = Array.from(headersSections).find((section) =>
    section
      .querySelector(".params-section-title")
      ?.textContent.includes("Headers"),
  );

  if (headersSection) {
    const addBtn = headersSection.querySelector(".add-param-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => addHeaderRow());
    }
  }

  // Find query parameters section
  const querySection = Array.from(headersSections).find((section) =>
    section
      .querySelector(".params-section-title")
      ?.textContent.includes("Query Parameters"),
  );

  if (querySection) {
    const addBtn = querySection.querySelector(".add-param-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => addQueryParamRow());
    }
  }

  // Initialize remove buttons
  initRemoveButtons();
}

/**
 * Add new header row
 */
function addHeaderRow() {
  const headersSection = Array.from(
    document.querySelectorAll(".params-section"),
  ).find((section) =>
    section
      .querySelector(".params-section-title")
      ?.textContent.includes("Headers"),
  );

  if (!headersSection) return;

  const paramsTable = headersSection.querySelector(".params-table");
  const newRow = createParamRow("", "");

  // Insert before add button
  const lastRow = paramsTable.querySelector(".param-row:last-child");
  if (lastRow) {
    lastRow.insertAdjacentElement("afterend", newRow);
  } else {
    paramsTable.appendChild(newRow);
  }

  // Focus on first input
  newRow.querySelector(".input")?.focus();

  // Reinit remove buttons
  initRemoveButtons();

  refreshLucideIcons();
}

/**
 * Add new query parameter row
 */
function addQueryParamRow() {
  const querySection = Array.from(
    document.querySelectorAll(".params-section"),
  ).find((section) =>
    section
      .querySelector(".params-section-title")
      ?.textContent.includes("Query Parameters"),
  );

  if (!querySection) return;

  const paramsTable = querySection.querySelector(".params-table");
  const newRow = createParamRow("", "");

  // Insert before add button
  const lastRow = paramsTable.querySelector(".param-row:last-child");
  if (lastRow) {
    lastRow.insertAdjacentElement("afterend", newRow);
  } else {
    paramsTable.appendChild(newRow);
  }

  // Focus on first input
  newRow.querySelector(".input")?.focus();

  // Reinit remove buttons
  initRemoveButtons();
}

/**
 * Create parameter row HTML
 * @param {string} key - Parameter key
 * @param {string} value - Parameter value
 * @returns {HTMLElement}
 */
function createParamRow(key = "", value = "") {
  const row = document.createElement("div");
  row.className = "param-row";
  row.innerHTML = `
    <input
      type="text"
      class="input input-sm"
      value="${escapeHtml(key)}"
      placeholder="Key"
    />
    <input
      type="text"
      class="input input-sm"
      value="${escapeHtml(value)}"
      placeholder="Value"
    />
    <button class="param-remove-btn" aria-label="Remove parameter">
      <i data-lucide="x" style="width: 16px; height: 16px;"></i>
    </button>
  `;

  refreshLucideIcons();

  return row;
}

/**
 * Initialize remove buttons
 */
function initRemoveButtons() {
  const removeButtons = document.querySelectorAll(".param-remove-btn");

  removeButtons.forEach((btn) => {
    // Remove old listener by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener("click", function () {
      const row = this.closest(".param-row");
      if (row) {
        row.remove();
      }
    });
  });

  refreshLucideIcons();
}

// ===== REQUEST BODY =====
/**
 * Initialize request body editor
 */
function initRequestBody() {
  const textarea = document.querySelector(".code-textarea");

  // Find buttons in body section
  const bodySection = document.querySelector(".request-body-section");
  if (bodySection) {
    const buttons = bodySection.querySelectorAll(".btn");
    buttons.forEach((btn) => {
      const btnText = btn.textContent.trim();
      if (btnText.includes("Format")) {
        btn.addEventListener("click", formatJSON);
      } else if (btnText.includes("Validate")) {
        btn.addEventListener("click", validateJSON);
      }
    });
  }

  // Update line numbers on input
  if (textarea) {
    textarea.addEventListener("input", updateLineNumbers);
    updateLineNumbers(); // Initial update
  }
}

/**
 * Update line numbers in code editor
 */
function updateLineNumbers() {
  const textarea = document.querySelector(".code-textarea");
  const lineNumbers = document.querySelector(".line-numbers");

  if (!textarea || !lineNumbers) return;

  const lines = textarea.value.split("\n").length;
  const numbersHtml = Array.from(
    { length: lines },
    (_, i) => `<div>${i + 1}</div>`,
  ).join("");

  lineNumbers.innerHTML = numbersHtml;
}

/**
 * Format JSON in request body
 */
function formatJSON() {
  const textarea = document.querySelector(".code-textarea");
  if (!textarea) return;

  try {
    const json = JSON.parse(textarea.value);
    textarea.value = JSON.stringify(json, null, 2);
    updateLineNumbers();
    ToastSystem.success("JSON formatted successfully");
  } catch (error) {
    ToastSystem.error("Invalid JSON: " + error.message);
  }
}

/**
 * Validate JSON in request body
 */
function validateJSON() {
  const textarea = document.querySelector(".code-textarea");
  if (!textarea) return;

  try {
    JSON.parse(textarea.value);
    ToastSystem.success("Valid JSON");
  } catch (error) {
    ToastSystem.error("Invalid JSON: " + error.message);
  }
}

// ===== SEND REQUEST =====
/**
 * Initialize send request button
 */
function initSendButton() {
  const sendBtn = document.querySelector(".send-request-btn");

  if (sendBtn) {
    sendBtn.addEventListener("click", sendRequest);
  }
}

/**
 * Send API request
 */
async function sendRequest() {
  if (appState.isLoading) return;

  // Get URL
  const urlInput = document.querySelector(
    '.url-input-group .input[type="text"]',
  );
  const url = urlInput?.value.trim();

  if (!url) {
    ToastSystem.error("Please enter a URL");
    return;
  }

  // Validate URL
  try {
    new URL(url);
  } catch (error) {
    ToastSystem.error("Invalid URL format");
    return;
  }

  // Start loading
  setLoadingState(true);

  // Collect headers
  const headers = collectHeaders();

  // Collect query params and build final URL
  const queryParams = collectQueryParams();
  const finalUrl = buildUrlWithParams(url, queryParams);

  // Get request body
  const body = getRequestBody();

  // Build request options
  const options = {
    method: appState.currentMethod,
    headers: headers,
  };

  // Add body for POST, PUT, PATCH
  if (["POST", "PUT", "PATCH"].includes(appState.currentMethod) && body) {
    options.body = body;
  }

  // Send request with timeout
  const startTime = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      API_CONFIG.requestTimeout,
    );

    const response = await fetch(finalUrl, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    // Get response data
    const contentType = response.headers.get("content-type");
    let responseData;

    if (contentType?.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // Get response size
    const responseSize = new Blob([
      typeof responseData === "string"
        ? responseData
        : JSON.stringify(responseData),
    ]).size;

    // Build response object
    const responseObj = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      time: responseTime,
      size: responseSize,
      date: new Date().toISOString(),
    };

    // Display response
    displayResponse(responseObj, finalUrl);

    // Save to history
    saveToHistory({
      method: appState.currentMethod,
      url: finalUrl,
      originalUrl: url,
      headers: headers,
      queryParams: queryParams,
      body: body,
      response: responseObj,
      timestamp: Date.now(),
    });

    // Save as last request
    saveLastRequest();

    console.log("✅ Request successful:", response.status);
  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    // Handle errors
    const errorResponse = {
      status: 0,
      statusText: error.name === "AbortError" ? "Timeout" : "Network Error",
      ok: false,
      headers: {},
      data: {
        error: error.message,
        type: error.name,
      },
      time: responseTime,
      size: 0,
      date: new Date().toISOString(),
    };

    displayResponse(errorResponse, finalUrl, true);

    console.error("❌ Request failed:", error);
  } finally {
    setLoadingState(false);
  }
}

/**
 * Set loading state
 * @param {boolean} loading - Loading state
 */
function setLoadingState(loading) {
  appState.isLoading = loading;

  const sendBtn = document.querySelector(".send-request-btn");
  if (!sendBtn) return;

  if (loading) {
    sendBtn.disabled = true;
    sendBtn.innerHTML = `
      <i data-lucide="loader" style="width: 20px; height: 20px; animation: spin 1s linear infinite;"></i>
      Sending Request...
    `;
  } else {
    sendBtn.disabled = false;
    sendBtn.innerHTML = `
      <i data-lucide="send" style="width: 20px; height: 20px;"></i>
      Send Request
    `;
  }

  // Reinit icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Collect headers from form
 * @returns {Object}
 */
function collectHeaders() {
  const headers = {};
  const headersSection = Array.from(
    document.querySelectorAll(".params-section"),
  ).find((section) =>
    section
      .querySelector(".params-section-title")
      ?.textContent.includes("Headers"),
  );

  if (!headersSection) return headers;

  const rows = headersSection.querySelectorAll(".param-row");
  rows.forEach((row) => {
    const inputs = row.querySelectorAll(".input");
    const key = inputs[0]?.value.trim();
    const value = inputs[1]?.value.trim();

    if (key && value) {
      headers[key] = value;
    }
  });

  return headers;
}

/**
 * Collect query parameters from form
 * @returns {Object}
 */
function collectQueryParams() {
  const params = {};
  const querySection = Array.from(
    document.querySelectorAll(".params-section"),
  ).find((section) =>
    section
      .querySelector(".params-section-title")
      ?.textContent.includes("Query Parameters"),
  );

  if (!querySection) return params;

  const rows = querySection.querySelectorAll(".param-row");
  rows.forEach((row) => {
    const inputs = row.querySelectorAll(".input");
    const key = inputs[0]?.value.trim();
    const value = inputs[1]?.value.trim();

    if (key && value) {
      params[key] = value;
    }
  });

  return params;
}

/**
 * Build URL with query parameters
 * @param {string} baseUrl - Base URL
 * @param {Object} params - Query parameters
 * @returns {string}
 */
function buildUrlWithParams(baseUrl, params) {
  if (Object.keys(params).length === 0) return baseUrl;

  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  return url.toString();
}

/**
 * Get request body
 * @returns {string|null}
 */
function getRequestBody() {
  const textarea = document.querySelector(".code-textarea");
  if (!textarea) return null;

  const body = textarea.value.trim();
  return body || null;
}

// ===== RESPONSE DISPLAY =====
/**
 * Display API response
 * @param {Object} response - Response object
 * @param {string} url - Request URL
 * @param {boolean} isError - Is error response
 */
function displayResponse(response, url, isError = false) {
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
      <div style="display: grid; grid-template-columns: auto 1fr;">
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
          overflow-x: auto;
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

// ===== QUICK FILL =====
/**
 * Initialize quick fill dropdown
 */
function initQuickFill() {
  const quickFillBtn = document.querySelector(".quick-fill-btn");

  if (quickFillBtn) {
    quickFillBtn.addEventListener("click", showQuickFillMenu);
  }
}

/**
 * Show quick fill menu
 */
function showQuickFillMenu() {
  // JSONPlaceholder endpoints
  const endpoints = [
    {
      name: "Get User",
      url: "https://jsonplaceholder.typicode.com/users/1",
      method: "GET",
    },
    {
      name: "Get Posts",
      url: "https://jsonplaceholder.typicode.com/posts",
      method: "GET",
    },
    {
      name: "Create Post",
      url: "https://jsonplaceholder.typicode.com/posts",
      method: "POST",
      body: { title: "foo", body: "bar", userId: 1 },
    },
    {
      name: "Update User",
      url: "https://jsonplaceholder.typicode.com/users/1",
      method: "PUT",
      body: { name: "John Doe", email: "john@example.com" },
    },
  ];

  // Use modal system if available
  if (window.ModalSystem) {
    console.log("✅ Using Modal System");
    window.ModalSystem.showQuickFill(endpoints, fillEndpoint);
  } else {
    console.warn("⚠️ Modal System not found, using fallback prompt");
    // Fallback to prompt
    const choice = prompt(
      "Quick Fill Options:\n\n" +
        endpoints
          .map((ep, i) => `${i + 1}. ${ep.name} (${ep.method})`)
          .join("\n") +
        "\n\nEnter number (1-4):",
    );

    const index = parseInt(choice) - 1;
    if (index >= 0 && index < endpoints.length) {
      fillEndpoint(endpoints[index]);
    }
  }
}

/**
 * Fill endpoint data
 * @param {Object} endpoint - Endpoint configuration
 */
function fillEndpoint(endpoint) {
  // Set URL
  const urlInput = document.querySelector(
    '.url-input-group .input[type="text"]',
  );
  if (urlInput) {
    urlInput.value = endpoint.url;
  }

  // Set method
  const methodBtn = document.querySelector(
    `.method-btn[data-method="${endpoint.method}"]`,
  );
  if (methodBtn) {
    methodBtn.click();
  }

  // Set body if exists
  if (endpoint.body) {
    const textarea = document.querySelector(".code-textarea");
    if (textarea) {
      textarea.value = JSON.stringify(endpoint.body, null, 2);
      updateLineNumbers();
    }
  }

  ToastSystem.success(`Filled with ${endpoint.name}`);
}

// ===== HISTORY MANAGEMENT =====
/**
 * Save request to history
 * @param {Object} request - Request data
 */
function saveToHistory(request) {
  let history = getHistory();

  // Add to beginning
  history.unshift(request);

  // Limit size
  if (history.length > API_CONFIG.maxHistoryItems) {
    history = history.slice(0, API_CONFIG.maxHistoryItems);
  }

  // Save to localStorage
  try {
    localStorage.setItem(API_CONFIG.storageKey, JSON.stringify(history));
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
    const data = localStorage.getItem(API_CONFIG.storageKey);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load history:", error);
    return [];
  }
}

/**
 * Render request history
 */
function renderHistory() {
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
        ${requests.map((req, index) => createHistoryItem(req, index)).join("")}
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
 * Rerun request from history
 * @param {Object} request - Request data
 */
function rerunRequest(request) {
  // Load request data
  editRequest(request);

  // Send immediately
  setTimeout(() => {
    sendRequest();
  }, 500);
}

/**
 * Edit request from history
 * @param {Object} request - Request data
 */
function editRequest(request) {
  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Set method
  const methodBtn = document.querySelector(
    `.method-btn[data-method="${request.method}"]`,
  );
  if (methodBtn) {
    methodBtn.click();
  }

  // Set URL
  const urlInput = document.querySelector(
    '.url-input-group .input[type="text"]',
  );
  if (urlInput) {
    urlInput.value = request.originalUrl || request.url;
  }

  // Set body
  if (request.body) {
    const textarea = document.querySelector(".code-textarea");
    if (textarea) {
      textarea.value = request.body;
      updateLineNumbers();
    }
  }

  ToastSystem.success("Request loaded");
}

/**
 * Delete history item
 * @param {number} index - Item index in today's history
 */
function deleteHistoryItem(index) {
  let history = getHistory();
  history.splice(index, 1);

  try {
    localStorage.setItem(API_CONFIG.storageKey, JSON.stringify(history));
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
          localStorage.removeItem(API_CONFIG.storageKey);
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
        localStorage.removeItem(API_CONFIG.storageKey);
        renderHistory();
        ToastSystem.success("History cleared");
      } catch (error) {
        ToastSystem.error("Failed to clear history");
      }
    }
  }
}

// ===== LAST REQUEST PERSISTENCE =====
/**
 * Save last request state
 */
function saveLastRequest() {
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
      API_CONFIG.lastRequestKey,
      JSON.stringify(lastRequest),
    );
  } catch (error) {
    console.error("Failed to save last request:", error);
  }
}

/**
 * Load last request state
 */
function loadLastRequest() {
  try {
    const data = localStorage.getItem(API_CONFIG.lastRequestKey);
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

// ===== UTILITY FUNCTIONS =====
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

/**
 * Format bytes to human readable
 * @param {number} bytes - Bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Escape HTML
 * @param {string} text - Text to escape
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function refreshLucideIcons() {
  if (window.lucide) {
    setTimeout(() => {
      window.lucide.createIcons();
    }, 0);
  }
}

// ===== GLOBAL FUNCTIONS =====
window.copyResponse = copyResponse;
window.exportResponse = exportResponse;
window.rerunRequest = rerunRequest;
window.editRequest = editRequest;
window.deleteHistoryItem = deleteHistoryItem;
window.clearHistory = clearHistory;

// ===== AUTO-INIT =====
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApiTester);
} else {
  initApiTester();
}

// ===== ANIMATIONS =====
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
document.head.appendChild(style);
