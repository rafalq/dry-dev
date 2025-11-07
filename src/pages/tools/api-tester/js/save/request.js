/**
 * ========================================
 * SAVE REQUEST FUNCTIONALITY
 * Save and manage API request collections
 * ========================================
 */

/**
 * Storage keys for localStorage
 */
const STORAGE_KEYS = {
  SAVED_REQUESTS: "api_tester_saved_requests",
  COLLECTIONS: "api_tester_collections",
};

/**
 * Initialize save request functionality
 */
function initSaveRequest() {
  const saveBtn = document.querySelector(".save-request-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", showSaveRequestModal);
  }
}

/**
 * Show save request modal with form
 */
function showSaveRequestModal() {
  const collections = getCollections();
  const collectionsOptions = collections.length
    ? collections
        .map(
          (col, index) =>
            `<option value="${index}">${escapeHtml(col.name)}</option>`
        )
        .join("")
    : "";

  const modalHtml = `
    <div class="modal-backdrop" id="saveRequestModal">
      <div class="modal-container modal-large">
        <div class="modal-header">
          <h3 class="modal-title">
            <i data-lucide="save" style="width: 24px; height: 24px; color: var(--color-primary);"></i>
            SAVE API REQUEST
          </h3>
          <button class="modal-close" aria-label="Close modal">
            <i data-lucide="x" style="width: 20px; height: 20px;"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="saveRequestForm" class="save-request-form">
            <div class="row">
              <div class="col-12 mb-3">
                <label for="requestName" class="form-label">
                  Name your request:
                </label>
                <input 
                  type="text" 
                  id="requestName" 
                  class="input" 
                  placeholder="Get User by ID"
                  required
                />
              </div>
            </div>

            <div class="row">
              <div class="col-12 mb-3">
                <label for="requestDescription" class="form-label">
                  Description (optional):
                </label>
                <textarea 
                  id="requestDescription" 
                  class="input" 
                  rows="3"
                  placeholder="Fetches user details from JSONPlaceholder &#10;API for testing purposes"
                ></textarea>
              </div>
            </div>

            <div class="row">
              <div class="col-12 mb-3">
                <label class="form-label">Collection:</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" name="collectionType" value="none" checked />
                    <span>None</span>
                  </label>
                  <label class="radio-label">
                    <input type="radio" name="collectionType" value="new" />
                    <span>Create new</span>
                  </label>
                  ${
                    collections.length
                      ? `
                  <label class="radio-label">
                    <input type="radio" name="collectionType" value="existing" />
                    <span>Add to existing: Select ▼</span>
                  </label>
                  `
                      : ""
                  }
                </div>
              </div>
            </div>

            <div class="row" id="newCollectionRow" style="display: none;">
              <div class="col-12 mb-3">
                <input 
                  type="text" 
                  id="newCollectionName" 
                  class="input" 
                  placeholder="Collection name"
                />
              </div>
            </div>

            ${
              collections.length
                ? `
            <div class="row" id="existingCollectionRow" style="display: none;">
              <div class="col-12 mb-3">
                <select id="existingCollectionSelect" class="input">
                  <option value="">Select collection</option>
                  ${collectionsOptions}
                </select>
              </div>
            </div>
            `
                : ""
            }

            <div class="row">
              <div class="col-12 mb-3">
                <label for="requestTags" class="form-label">
                  Tags:
                </label>
                <input 
                  type="text" 
                  id="requestTags" 
                  class="input" 
                  placeholder="api, test, jsonplaceholder"
                />
                <small class="form-text">Separate tags with commas</small>
              </div>
            </div>

            <div class="row">
              <div class="col-12">
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary modal-cancel">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary">
                    Save Request
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  ModalSystem.show(modalHtml, (modal) => {
    setupSaveRequestForm();
    refreshLucideIcons();

    // Handle cancel button
    const cancelBtn = modal.querySelector(".modal-cancel");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => ModalSystem.close());
    }
  });
}
/**
 * Setup save request form event listeners
 */
function setupSaveRequestForm() {
  const form = document.getElementById("saveRequestForm");
  const collectionRadios = document.querySelectorAll(
    'input[name="collectionType"]'
  );
  const newCollectionRow = document.getElementById("newCollectionRow");
  const existingCollectionRow = document.getElementById(
    "existingCollectionRow"
  );

  // Handle collection type change
  collectionRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (newCollectionRow) newCollectionRow.style.display = "none";
      if (existingCollectionRow) existingCollectionRow.style.display = "none";

      if (e.target.value === "new" && newCollectionRow) {
        newCollectionRow.style.display = "block";
      } else if (e.target.value === "existing" && existingCollectionRow) {
        existingCollectionRow.style.display = "block";
      }
    });
  });

  // Handle form submission
  form.addEventListener("submit", handleSaveRequest);
}

/**
 * Handle save request form submission
 * @param {Event} e - Submit event
 */
function handleSaveRequest(e) {
  e.preventDefault();

  const formData = getFormData();

  if (!validateFormData(formData)) {
    return;
  }

  const request = getCurrentRequest();
  const savedRequest = {
    id: Date.now(),
    name: formData.name,
    description: formData.description,
    tags: formData.tags,
    request: request,
    createdAt: new Date().toISOString(),
    collection: formData.collection,
  };

  // Handle collection
  if (formData.collectionType === "new" && formData.newCollectionName) {
    const newCollection = {
      id: Date.now(),
      name: formData.newCollectionName,
      createdAt: new Date().toISOString(),
    };
    saveCollection(newCollection);
    savedRequest.collectionId = newCollection.id;
  } else if (
    formData.collectionType === "existing" &&
    formData.existingCollectionId !== null
  ) {
    const collections = getCollections();
    savedRequest.collectionId = collections[formData.existingCollectionId].id;
  }

  // Save request
  saveRequest(savedRequest);

  // Show success toast
  if (window.ToastSystem) {
    ToastSystem.success("Request saved successfully!");
  }

  // Close modal
  window.ModalSystem.close();
}

/**
 * Get form data from save request form
 * @returns {Object} Form data
 */
function getFormData() {
  const name = document.getElementById("requestName").value.trim();
  const description = document
    .getElementById("requestDescription")
    .value.trim();
  const tags = document
    .getElementById("requestTags")
    .value.split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag);

  const collectionType = document.querySelector(
    'input[name="collectionType"]:checked'
  ).value;

  let newCollectionName = "";
  let existingCollectionId = null;

  if (collectionType === "new") {
    const newCollectionInput = document.getElementById("newCollectionName");
    newCollectionName = newCollectionInput
      ? newCollectionInput.value.trim()
      : "";
  } else if (collectionType === "existing") {
    const existingCollectionSelect = document.getElementById(
      "existingCollectionSelect"
    );
    existingCollectionId = existingCollectionSelect
      ? parseInt(existingCollectionSelect.value)
      : null;
  }

  return {
    name,
    description,
    tags,
    collectionType,
    newCollectionName,
    existingCollectionId,
  };
}

/**
 * Validate form data
 * @param {Object} formData - Form data to validate
 * @returns {boolean} True if valid
 */
function validateFormData(formData) {
  if (!formData.name) {
    if (window.ToastSystem) {
      ToastSystem.error("Please enter a request name");
    }
    return false;
  }

  if (
    formData.collectionType === "new" &&
    !formData.newCollectionName
  ) {
    if (window.ToastSystem) {
      ToastSystem.error("Please enter a collection name");
    }
    return false;
  }

  if (
    formData.collectionType === "existing" &&
    formData.existingCollectionId === null
  ) {
    if (window.ToastSystem) {
      ToastSystem.error("Please select a collection");
    }
    return false;
  }

  return true;
}

/**
 * Get current request configuration
 * @returns {Object} Current request data
 */
function getCurrentRequest() {
  const method =
    document.querySelector(".method-btn.active")?.dataset.method || "GET";
  const url = document.querySelector(".url-input-group .input").value.trim();

  // Get headers
  const headers = {};
  const headersSections = Array.from(
    document.querySelectorAll(".params-section")
  );
  const headersSection = headersSections.find((section) =>
    section.querySelector(".params-section-title")?.textContent.includes("Headers")
  );
  if (headersSection) {
    const headerRows = headersSection.querySelectorAll(".param-row");
    headerRows.forEach((row) => {
      const inputs = row.querySelectorAll(".input");
      const keyInput = inputs[0];
      const valueInput = inputs[1];
      if (keyInput && valueInput && keyInput.value.trim()) {
        headers[keyInput.value.trim()] = valueInput.value.trim();
      }
    });
  }

  // Get query parameters
  const queryParams = {};
  const querySection = headersSections.find((section) =>
    section
      .querySelector(".params-section-title")
      ?.textContent.includes("Query Parameters")
  );
  if (querySection) {
    const queryRows = querySection.querySelectorAll(".param-row");
    queryRows.forEach((row) => {
      const inputs = row.querySelectorAll(".input");
      const keyInput = inputs[0];
      const valueInput = inputs[1];
      if (keyInput && valueInput && keyInput.value.trim()) {
        queryParams[keyInput.value.trim()] = valueInput.value.trim();
      }
    });
  }

  // Get request body
  const bodyTextarea = document.querySelector(".code-textarea");
  let body = null;
  if (bodyTextarea && bodyTextarea.value.trim()) {
    try {
      body = JSON.parse(bodyTextarea.value);
    } catch (e) {
      body = bodyTextarea.value;
    }
  }

  return {
    method,
    url,
    headers,
    queryParams,
    body,
  };
}

/**
 * Save request to localStorage
 * @param {Object} request - Request to save
 */
function saveRequest(request) {
  const requests = getSavedRequests();
  requests.push(request);
  localStorage.setItem(STORAGE_KEYS.SAVED_REQUESTS, JSON.stringify(requests));
}

/**
 * Get all saved requests from localStorage
 * @returns {Array} Array of saved requests
 */
function getSavedRequests() {
  const data = localStorage.getItem(STORAGE_KEYS.SAVED_REQUESTS);
  return data ? JSON.parse(data) : [];
}

/**
 * Save collection to localStorage
 * @param {Object} collection - Collection to save
 */
function saveCollection(collection) {
  const collections = getCollections();
  collections.push(collection);
  localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
}

/**
 * Get all collections from localStorage
 * @returns {Array} Array of collections
 */
function getCollections() {
  const data = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
  return data ? JSON.parse(data) : [];
}

/**
 * Delete saved request
 * @param {number} requestId - Request ID to delete
 */
function deleteSavedRequest(requestId) {
  const requests = getSavedRequests();
  const filtered = requests.filter((req) => req.id !== requestId);
  localStorage.setItem(STORAGE_KEYS.SAVED_REQUESTS, JSON.stringify(filtered));
}

/**
 * Load saved request into form
 * @param {number} requestId - Request ID to load
 */
function loadSavedRequest(requestId) {
  const requests = getSavedRequests();
  const request = requests.find((req) => req.id === requestId);

  if (!request) {
    if (window.ToastSystem) {
      ToastSystem.error("Request not found");
    }
    return;
  }

  const { method, url, headers, queryParams, body } = request.request;

  // Set method
  document.querySelectorAll(".method-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.method === method);
  });

  // Set URL
  const urlInput = document.querySelector(".url-input-group .input");
  if (urlInput) urlInput.value = url;

  // Find sections
  const sections = Array.from(document.querySelectorAll(".params-section"));
  const headersSection = sections.find((section) =>
    section.querySelector(".params-section-title")?.textContent.includes("Headers")
  );
  const querySection = sections.find((section) =>
    section
      .querySelector(".params-section-title")
      ?.textContent.includes("Query Parameters")
  );

  // Clear and set headers
  if (headersSection) {
    const headerRows = headersSection.querySelectorAll(".param-row");
    headerRows.forEach((row) => row.remove());

    Object.entries(headers).forEach(([key, value]) => {
      addHeaderRow();
      const rows = headersSection.querySelectorAll(".param-row");
      const lastRow = rows[rows.length - 1];
      if (lastRow) {
        const inputs = lastRow.querySelectorAll(".input");
        if (inputs[0]) inputs[0].value = key;
        if (inputs[1]) inputs[1].value = value;
      }
    });
  }

  // Clear and set query params
  if (querySection) {
    const queryRows = querySection.querySelectorAll(".param-row");
    queryRows.forEach((row) => row.remove());

    Object.entries(queryParams).forEach(([key, value]) => {
      addQueryParamRow();
      const rows = querySection.querySelectorAll(".param-row");
      const lastRow = rows[rows.length - 1];
      if (lastRow) {
        const inputs = lastRow.querySelectorAll(".input");
        if (inputs[0]) inputs[0].value = key;
        if (inputs[1]) inputs[1].value = value;
      }
    });
  }

  // Set body
  const bodyTextarea = document.querySelector(".code-textarea");
  if (bodyTextarea && body) {
    bodyTextarea.value =
      typeof body === "object" ? JSON.stringify(body, null, 2) : body;
    if (typeof updateLineNumbers === "function") {
      updateLineNumbers();
    }
  }

  if (window.ToastSystem) {
    ToastSystem.success("Request loaded successfully");
  }
}

/**
 * Clear all headers
 */
function clearHeaders() {
  const sections = Array.from(document.querySelectorAll(".params-section"));
  const headersSection = sections.find((section) =>
    section.querySelector(".params-section-title")?.textContent.includes("Headers")
  );
  if (headersSection) {
    const headerRows = headersSection.querySelectorAll(".param-row");
    headerRows.forEach((row) => row.remove());
  }
}

/**
 * Clear all query parameters
 */
function clearQueryParams() {
  const sections = Array.from(document.querySelectorAll(".params-section"));
  const querySection = sections.find((section) =>
    section
      .querySelector(".params-section-title")
      ?.textContent.includes("Query Parameters")
  );
  if (querySection) {
    const queryRows = querySection.querySelectorAll(".param-row");
    queryRows.forEach((row) => row.remove());
  }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Refresh Lucide icons
 */
function refreshLucideIcons() {
  if (window.lucide) {
    setTimeout(() => {
      window.lucide.createIcons();
    }, 0);
  }
}

// Initialize on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSaveRequest);
} else {
  initSaveRequest();
}

console.log("✅ Save Request System loaded");