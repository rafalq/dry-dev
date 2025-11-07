import { state as appState} from "../state.js";

export function initMethodButtons() {
  const methodButtons = document.querySelectorAll(".method-btn");

  methodButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active from all
      methodButtons.forEach((b) => b.classList.remove("active"));

      // Add active to clicked
      this.classList.add("active");

      // Update state
      appState.currentMethod = this.dataset.method;

      // TODO  for debugging purposes
      console.log(`🔧 Method changed: ${appState.currentMethod}`);
    });
  });
}
