import { state as appState } from "../state.js";

/**
 * Collect headers from form
 * @returns {Object}
 */
export function collectHeaders() {
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
export function collectQueryParams() {
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
export function buildUrlWithParams(baseUrl, params) {
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
export function getRequestBody() {
  const textarea = document.querySelector(".code-textarea");
  if (!textarea) return null;

  const body = textarea.value.trim();
  return body || null;
}
