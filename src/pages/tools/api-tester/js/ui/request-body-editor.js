import { formatJSON } from "../utils/json/format-json.js";
import { validateJSON } from "../utils/json/validate-json.js";
import { updateLineNumbers } from "../utils/dom.js";

/**
 * Initialize request body editor
 */
export function initRequestBody() {
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

