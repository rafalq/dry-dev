/**
 * Global configuration constants
 * @module config
 */

/** @type {Object} */

export const CONFIG = {
  maxHistoryItems: 50,
  requestTimeout: 30_000, // 30 seconds
  defaultHeaders: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  storageKey: "api_tester_history",
  lastRequestKey: "api_tester_last_request",
};