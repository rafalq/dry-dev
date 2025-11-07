 /* Central mutable state for API Tester
 * @module state
 */

/** @type {Object} */
export let state = {
  currentMethod: "GET",
  currentUrl: "",
  headers: [],
  queryParams: [],
  requestBody: "",
  isLoading: false,
  lastResponse: null,
  activeTab: "body",
};

/**
 * Reset state to defaults
 */
export function initState() {
  Object.assign(state, {
    httpMethod: "GET",
    url: "",
    requestHeaders: [],
    queryParameters: [],
    requestBody: "",
    loading: false,
    lastResponse: null,
  });
}