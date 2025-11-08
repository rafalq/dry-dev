/**
 * ========================================
 * SEARCH LOGIC FOR DEVELOPER TOOLS
 * Optimized with debounce for better performance
 * ========================================
 */

// ===== CONFIGURATION =====
const SEARCH_CONFIG = {
  debounceDelay: 300, // ms - waiting time after the last key press
  minSearchLength: 2, // minimum search query length
  highlightResults: true, // highlighting found phrases
  saveHistory: true, // saving search history
  maxHistoryItems: 10, // Max number of saved searches
};

// ===== DEBOUNCE UTILITY =====
/**
 * Debounce function - delays the execution of a function until the user stops calling it for a specified period of time.
 *
 * @param {Function} func - Function to execute
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, delay) {
  let timeoutId;

  return function (...args) {
    // Clear previous timeout
    clearTimeout(timeoutId);

    // Set new timeout
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// ===== SEARCH STATE =====
let searchState = {
  currentQuery: "",
  activeCategory: "all",
  resultsCount: 0,
  searchHistory: [],
};

// ===== MAIN SEARCH FUNCTION =====
/**
 * Main search function
 * @param {string} query - Search query
 */
function performSearch(query) {
  const searchQuery = query.toLowerCase().trim();
  searchState.currentQuery = searchQuery;

  // Get all tool cards (exclude filter chips)
  const toolCards = document.querySelectorAll(
    "[data-category]:not(.filter-chip)",
  );
  const emptyState = document.querySelector(".tools-empty");

  let visibleCount = 0;

  // If search empty, show all by active filter
  if (
    searchQuery === "" ||
    searchQuery.length < SEARCH_CONFIG.minSearchLength
  ) {
    resetSearch();
    return;
  }

  // Save search to history
  if (SEARCH_CONFIG.saveHistory) {
    saveToSearchHistory(searchQuery);
  }

  // Get active category from filter chips
  const activeChip = document.querySelector(".filter-chip.active");
  const activeCategory = activeChip?.dataset.category || "all";

  // Search all cards
  toolCards.forEach((card) => {
    const toolCard = card.querySelector(".tool-card");
    if (!toolCard) return;

    const cardCategory = card.dataset.category;

    // Check if card matches active category filter
    const matchesCategory =
      activeCategory === "all" || cardCategory === activeCategory;

    // If doesn't match category, hide and skip
    if (!matchesCategory) {
      card.style.display = "none";
      removeHighlights(toolCard);
      return;
    }

    // Get data to search
    const title =
      toolCard
        .querySelector(".tool-card-title h4")
        ?.textContent.toLowerCase() || "";
    const description =
      toolCard
        .querySelector(".tool-card-description")
        ?.textContent.toLowerCase() || "";
    const dataTags = toolCard.dataset.tags?.toLowerCase() || "";
    const badges = Array.from(toolCard.querySelectorAll(".badge"))
      .map((badge) => badge.textContent.toLowerCase())
      .join(" ");

    // Check if any field matches the search
    const matches =
      title.includes(searchQuery) ||
      description.includes(searchQuery) ||
      dataTags.includes(searchQuery) ||
      badges.includes(searchQuery);

    // Show/hide card
    if (matches) {
      card.style.display = "";
      visibleCount++;

      // Highlight found phrases (optional)
      if (SEARCH_CONFIG.highlightResults) {
        highlightMatches(toolCard, searchQuery);
      }
    } else {
      card.style.display = "none";
      removeHighlights(toolCard);
    }
  });

  // Update results counter
  searchState.resultsCount = visibleCount;
  updateSearchStats(visibleCount, searchQuery);

  // Show/hide empty state
  if (emptyState) {
    emptyState.style.display = visibleCount === 0 ? "block" : "none";

    // Update message in empty state
    if (visibleCount === 0) {
      updateEmptyStateMessage(searchQuery);
    }
  }

  // Fade-in animation for results
  animateSearchResults();

  // Emit custom event
  document.dispatchEvent(
    new CustomEvent("searchCompleted", {
      detail: { query: searchQuery, resultsCount: visibleCount },
    }),
  );
}

// ===== HIGHLIGHT FUNCTIONS =====
/**
 * Highlight found phrases in text
 * @param {HTMLElement} element - Element to highlight
 * @param {string} query - Search phrase
 */
function highlightMatches(element, query) {
  // Remove previous highlights
  removeHighlights(element);

  const elementsToHighlight = [
    element.querySelector(".tool-card-title h4"),
    element.querySelector(".tool-card-description"),
  ];

  elementsToHighlight.forEach((el) => {
    if (!el) return;

    const text = el.textContent;
    const regex = new RegExp(`(${escapeRegex(query)})`, "gi");

    if (regex.test(text)) {
      el.innerHTML = text.replace(
        regex,
        '<mark class="search-highlight">$1</mark>',
      );
    }
  });
}

/**
 * Remove highlights
 * @param {HTMLElement} element - Element from which to remove highlights
 */
function removeHighlights(element) {
  const highlights = element.querySelectorAll(".search-highlight");
  highlights.forEach((highlight) => {
    const text = highlight.textContent;
    highlight.replaceWith(text);
  });
}

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string}
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ===== SEARCH RESET =====
/**
 * Reset search - show everything according to active filter
 */
function resetSearch() {
  // Get all tool cards (exclude filter chips)
  const toolCards = document.querySelectorAll(
    "[data-category]:not(.filter-chip)",
  );
  const activeChip = document.querySelector(".filter-chip.active");
  const activeCategory = activeChip?.dataset.category || "all";

  searchState.currentQuery = "";
  searchState.activeCategory = activeCategory;

  // Show/hide cards according to active category
  toolCards.forEach((card) => {
    const category = card.dataset.category;
    const toolCard = card.querySelector(".tool-card");

    // Show if "all" or matches active category
    if (activeCategory === "all" || category === activeCategory) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }

    // Remove highlights
    if (toolCard) {
      removeHighlights(toolCard);
    }
  });

  // Hide empty state
  const emptyState = document.querySelector(".tools-empty");
  if (emptyState) {
    emptyState.style.display = "none";
  }

  // Reset search stats
  updateSearchStats(0, "");

  // Animate cards
  animateSearchResults();
}

// ===== SEARCH STATS =====
/**
 * Update search statistics
 * @param {number} count - Number of found results
 * @param {string} query - Query
 */
function updateSearchStats(count, query) {
  // Find or create stats element
  let statsElement = document.getElementById("searchStats");

  if (!statsElement && query !== "") {
    statsElement = document.createElement("div");
    statsElement.id = "searchStats";
    statsElement.className = "search-stats";

    const searchContainer = document.querySelector(".tools-search");
    if (searchContainer) {
      searchContainer.appendChild(statsElement);
    }
  }

  if (statsElement) {
    if (query === "") {
      statsElement.style.display = "none";
    } else {
      statsElement.style.display = "flex";
      statsElement.innerHTML = `
        <span class="search-stats-icon">🔍</span>
        <span class="search-stats-text">
          Found <strong>${count}</strong> ${count === 1 ? "tool" : "tools"} 
          matching "<strong>${escapeHtml(query)}</strong>"
        </span>
        ${count > 0 ? '<button class="search-stats-clear" onclick="clearSearch()">×</button>' : ""}
      `;
    }
  }
}

/**
 * Escape HTML characters
 * @param {string} text - Text to escape
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===== EMPTY STATE =====
/**
 * Update message in empty state
 * @param {string} query - Query
 */
function updateEmptyStateMessage(query) {
  const emptyState = document.querySelector(".tools-empty");
  if (!emptyState) return;

  const emptyTitle = emptyState.querySelector(".empty-title");
  const emptyDescription = emptyState.querySelector(".empty-description");

  if (emptyTitle) {
    emptyTitle.textContent = `No tools found for "${query}"`;
  }

  if (emptyDescription) {
    emptyDescription.innerHTML = `
      Try searching for something else or`;
  }
}

// ===== SEARCH HISTORY =====
/**
 * Save search to history
 * @param {string} query - Query to save
 */
function saveToSearchHistory(query) {
  if (!query || query.length < SEARCH_CONFIG.minSearchLength) return;

  // Get history from localStorage
  let history = JSON.parse(localStorage.getItem("search_history") || "[]");

  // Remove duplicates
  history = history.filter(
    (item) => item.toLowerCase() !== query.toLowerCase(),
  );

  // Add new search to the beginning
  history.unshift(query);

  // Limit to max number
  history = history.slice(0, SEARCH_CONFIG.maxHistoryItems);

  // Save in localStorage
  localStorage.setItem("search_history", JSON.stringify(history));

  searchState.searchHistory = history;
}

/**
 * Get search history
 * @returns {Array<string>}
 */
function getSearchHistory() {
  return JSON.parse(localStorage.getItem("search_history") || "[]");
}

/**
 * Clear search history
 */
function clearSearchHistory() {
  localStorage.removeItem("search_history");
  searchState.searchHistory = [];
}

// ===== ANIMATIONS =====
/**
 * Animate search results
 */
function animateSearchResults() {
  const visibleCards = document.querySelectorAll(
    '[data-category]:not(.filter-chip):not([style*="display: none"])',
  );

  visibleCards.forEach((card, index) => {
    card.style.animation = "none";
    setTimeout(() => {
      card.style.animation = `fadeInUp 0.3s ease-out ${index * 0.05}s forwards`;
    }, 10);
  });
}

// ===== CLEAR SEARCH =====
/**
 * Clear search
 */
function clearSearch() {
  const searchInput = document.getElementById("toolSearch");
  if (searchInput) {
    searchInput.value = "";
    searchInput.focus();
  }
  resetSearch();
}

// ===== FILTER CHIPS FUNCTIONALITY =====
/**
 * Initialize filter chips - handle clicks and filtering
 */
function initFilterChips() {
  const filterChips = document.querySelectorAll(".filter-chip");

  if (filterChips.length === 0) {
    console.warn("No filter chips found");
    return;
  }

  // Add click handlers to all chips
  filterChips.forEach((chip) => {
    chip.addEventListener("click", handleFilterChipClick);
  });

  // Restore last selected filter from localStorage
  const savedCategory = localStorage.getItem("selected_category");
  if (savedCategory && savedCategory !== "all") {
    const savedChip = document.querySelector(
      `.filter-chip[data-category="${savedCategory}"]`,
    );
    if (savedChip) {
      // Trigger click to restore state
      savedChip.click();
    }
  }

  console.log("🎯 Filter chips initialized:", filterChips.length);
}

/**
 * Handle filter chip click event
 * @param {Event} event - Click event
 */
function handleFilterChipClick(event) {
  const clickedChip = event.currentTarget;
  const category = clickedChip.dataset.category;

  // Remove active class from all chips
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.classList.remove("active");
  });

  // Add active class to clicked chip
  clickedChip.classList.add("active");

  // Update search state
  searchState.activeCategory = category;

  // Save to localStorage
  localStorage.setItem("selected_category", category);

  // Apply filter
  filterToolsByCategory(category);

  // If there's active search, reapply it with new category
  if (searchState.currentQuery) {
    performSearch(searchState.currentQuery);
  }

  // Emit custom event for other components
  document.dispatchEvent(
    new CustomEvent("filterChanged", {
      detail: { category },
    }),
  );
}

/**
 * Filter tools by category
 * @param {string} category - Category to filter by (or "all" for everything)
 */
function filterToolsByCategory(category) {
  // Get all tool cards (exclude filter chips)
  const toolCards = document.querySelectorAll(
    "[data-category]:not(.filter-chip)",
  );
  const emptyState = document.querySelector(".tools-empty");
  let visibleCount = 0;

  // Show/hide tool cards based on category
  toolCards.forEach((card) => {
    const cardCategory = card.dataset.category;

    // Show all if "all" category, otherwise show only matching category
    if (category === "all" || cardCategory === category) {
      card.style.display = "";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  // Update empty state
  if (emptyState) {
    if (visibleCount === 0) {
      emptyState.style.display = "block";
      updateEmptyStateForCategory(category);
    } else {
      emptyState.style.display = "none";
    }
  }

  // Animate visible cards
  animateSearchResults();

  console.log(`🎯 Filtered to category: ${category}, visible: ${visibleCount}`);
}

/**
 * Update empty state message for category filter
 * @param {string} category - Current category
 */
function updateEmptyStateForCategory(category) {
  const emptyState = document.querySelector(".tools-empty");
  if (!emptyState) return;

  const emptyTitle = emptyState.querySelector(".empty-title");
  const emptyDescription = emptyState.querySelector(".empty-description");

  if (category === "all") {
    if (emptyTitle) emptyTitle.textContent = "No tools found";
    if (emptyDescription) {
      emptyDescription.innerHTML = `
        There are no tools to display.
      `;
    }
  } else {
    if (emptyTitle) emptyTitle.textContent = `No tools in ${category} category`;
    if (emptyDescription) {
      emptyDescription.innerHTML = `
        Try selecting a different category or 
        <button class="btn-link" onclick="resetFilters()">view all tools</button>
      `;
    }
  }
}

/**
 * Reset filters to show all tools
 */
function resetFilters() {
  const allChip = document.querySelector('.filter-chip[data-category="all"]');
  if (allChip) {
    allChip.click();
  }
}

// ===== INTEGRATION WITH FILTER CHIPS =====
/**
 * Integration with filter chips - search + filters work together
 */
function integrateWithFilters() {
  // Listen for filter changes
  document.addEventListener("filterChanged", (e) => {
    searchState.activeCategory = e.detail.category;

    // If there's active search, execute it again
    if (searchState.currentQuery) {
      performSearch(searchState.currentQuery);
    }
  });
}

// ===== KEYBOARD SHORTCUTS =====
/**
 * Add keyboard shortcuts
 */
function initKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + K - focus on search
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      const searchInput = document.getElementById("toolSearch");
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }

    // ESC - clear search
    if (e.key === "Escape") {
      const searchInput = document.getElementById("toolSearch");
      if (searchInput && document.activeElement === searchInput) {
        clearSearch();
      }
    }
  });
}

// ===== SEARCH SUGGESTIONS (OPTIONAL) =====
/**
 * Show search suggestions from history
 */
function showSearchSuggestions() {
  const searchInput = document.getElementById("toolSearch");
  if (!searchInput) return;

  const history = getSearchHistory();
  if (history.length === 0) return;

  // Create dropdown with suggestions
  let dropdown = document.getElementById("searchSuggestions");

  if (!dropdown) {
    dropdown = document.createElement("div");
    dropdown.id = "searchSuggestions";
    dropdown.className = "search-suggestions";
    searchInput.parentElement.appendChild(dropdown);
  }

  dropdown.innerHTML = history
    .slice(0, 5)
    .map(
      (item) => `
      <button class="search-suggestion-item" onclick="selectSuggestion('${escapeHtml(item)}')">
        <span class="suggestion-icon">🕐</span>
        <span class="suggestion-text">${escapeHtml(item)}</span>
      </button>
    `,
    )
    .join("");

  dropdown.style.display = "block";
}

/**
 * Hide suggestions
 */
function hideSearchSuggestions() {
  const dropdown = document.getElementById("searchSuggestions");
  if (dropdown) {
    dropdown.style.display = "none";
  }
}

/**
 * Select suggestion
 * @param {string} suggestion - Selected suggestion
 */
function selectSuggestion(suggestion) {
  const searchInput = document.getElementById("toolSearch");
  if (searchInput) {
    searchInput.value = suggestion;
    performSearch(suggestion);
  }
  hideSearchSuggestions();
}

// ===== INITIALIZATION =====
/**
 * Initialize search
 */
function initSearch() {
  const searchInput = document.getElementById("toolSearch");

  if (!searchInput) {
    console.warn("Search input #toolSearch not found");
    return;
  }

  // Create debounced version of search
  const debouncedSearch = debounce(performSearch, SEARCH_CONFIG.debounceDelay);

  // Event listener on input
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value;
    debouncedSearch(query);
  });

  // Clear button (if input type="search")
  searchInput.addEventListener("search", (e) => {
    if (e.target.value === "") {
      clearSearch();
    }
  });

  // Focus - show suggestions
  searchInput.addEventListener("focus", () => {
    if (SEARCH_CONFIG.saveHistory && searchInput.value === "") {
      showSearchSuggestions();
    }
  });

  // Blur - hide suggestions (with delay for click)
  searchInput.addEventListener("blur", () => {
    setTimeout(hideSearchSuggestions, 200);
  });

  // Integration with filters
  integrateWithFilters();

  // Keyboard shortcuts
  initKeyboardShortcuts();

  // Initialize filter chips
  initFilterChips();

  console.log(
    "🔍 Search initialized with debounce:",
    SEARCH_CONFIG.debounceDelay + "ms",
  );
}

// ===== AUTO-INIT =====
// Automatic initialization when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSearch);
} else {
  initSearch();
}

// ===== EXPORT (for module usage) =====
// Uncomment if using ES modules
// export {
//   initSearch,
//   performSearch,
//   clearSearch,
//   resetSearch,
//   debounce
// };

// ===== GLOBAL ACCESS =====
// Make functions available globally for onclick handlers
window.clearSearch = clearSearch;
window.resetSearch = resetSearch;
window.selectSuggestion = selectSuggestion;
window.clearSearchHistory = clearSearchHistory;
window.resetFilters = resetFilters;
