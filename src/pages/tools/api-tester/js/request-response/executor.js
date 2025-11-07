import { CONFIG } from "../config.js";
import { state as appState } from "../state.js";
import { collectHeaders, collectQueryParams, buildUrlWithParams } from "./builder.js";
import { displayResponse } from "./response.js";
import { saveToHistory, saveLastRequest } from "../history/storage.js";
/**
 * Send API request
 */

export async function sendRequest() {
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
      CONFIG.requestTimeout,
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
 * Get request body
 * @returns {string|null}
 */
function getRequestBody() {
  const textarea = document.querySelector(".code-textarea");
  if (!textarea) return null;

  const body = textarea.value.trim();
  return body || null;
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


window.rerunRequest = rerunRequest;
window.editRequest = editRequest;