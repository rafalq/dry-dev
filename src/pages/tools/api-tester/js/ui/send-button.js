import { sendRequest } from "../request-response/executor.js";

/**
 * Initialize send request button
 */
export function initSendButton() {
  const sendBtn = document.querySelector(".send-request-btn");

  if (sendBtn) {
    sendBtn.addEventListener("click", sendRequest);
  }
}