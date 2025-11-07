import { initRemoveButtons } from "../utils/dom.js";
import { refreshLucideIcons } from "../../../../../js/shared/helpers/refresh-lucide-icons.js";
import { escapeHtml } from "../../../../../js/shared/helpers/escape-html.js";

/**
 * Initialize headers and query parameters
 */
export function initHeadersAndParams() {
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