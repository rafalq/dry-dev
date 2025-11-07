import { refreshLucideIcons } from "../../../../../js/shared/helpers/refresh-lucide-icons.js";
export function initRemoveButtons() {
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

/**
 * Synchronise line-numbers with textarea content
 */
export function updateLineNumbers() {
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