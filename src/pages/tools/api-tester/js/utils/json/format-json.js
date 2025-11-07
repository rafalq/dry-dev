import { updateLineNumbers } from "../dom.js";

/**
 * Format JSON
 */
export function formatJSON() {
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