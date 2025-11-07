import { updateLineNumbers } from "../utils/dom.js";

/**
 * Initialize quick fill dropdown
 */
export function initQuickFill() {
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