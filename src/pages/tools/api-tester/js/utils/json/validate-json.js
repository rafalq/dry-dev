/**
 * Validate JSON in request body
 */
export function validateJSON() {
  const textarea = document.querySelector(".code-textarea");
  if (!textarea) return;

  try {
    JSON.parse(textarea.value);
    ToastSystem.success("Valid JSON");
  } catch (error) {
    ToastSystem.error("Invalid JSON: " + error.message);
  }
}