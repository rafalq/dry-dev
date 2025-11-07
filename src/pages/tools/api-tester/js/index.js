/**
 * ========================================
 * API TESTER - REQUEST BUILDER & HISTORY
 * Full-featured API testing tool with localStorage persistence
 * ========================================
 */

// ui
import { initMethodButtons } from "./ui/method-buttons.js";
import { initHeadersAndParams } from "./ui/headers-and-params.js";
import { initRequestBody } from "./ui/request-body-editor.js";
import { initSendButton } from "./ui/send-button.js";
import { initQuickFill } from "./ui/quick-fill.js";

// history
import { renderHistory, loadLastRequest } from "./history/storage.js";

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
