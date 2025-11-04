/**
 * ========================================
 * TOAST NOTIFICATION SYSTEM
 * Generic, reusable toast notifications
 * ========================================
 */

const ToastSystem = {
  container: null,
  toasts: [],
  config: {
    duration: 3000, // Default duration in ms
    position: "bottom-right", // bottom-right, bottom-left, top-right, top-left, top-center, bottom-center
    maxToasts: 5, // Maximum number of visible toasts
    offset: "1.5rem", // Offset from screen edge
  },

  /**
   * Initialize toast container
   */
  init() {
    if (this.container) return;

    this.container = document.createElement("div");
    this.container.className = "toast-container";
    this.container.setAttribute("data-position", this.config.position);

    document.body.appendChild(this.container);

    console.log("🍞 Toast System initialized");
  },

  /**
   * Show toast notification
   * @param {string} message - Toast message
   * @param {Object} options - Toast options
   * @returns {Object} Toast instance
   */
  show(message, options = {}) {
    this.init();

    const toast = {
      id: Date.now() + Math.random(),
      message: message,
      type: options.type || "info", // success, error, warning, info
      duration:
        options.duration !== undefined
          ? options.duration
          : this.config.duration,
      icon: options.icon || this.getDefaultIcon(options.type || "info"),
      dismissible: options.dismissible !== false,
      onClick: options.onClick || null,
      element: null,
    };

    // Remove oldest toast if max reached
    if (this.toasts.length >= this.config.maxToasts) {
      const oldestToast = this.toasts[0];
      this.remove(oldestToast.id);
    }

    // Create toast element
    toast.element = this.createToastElement(toast);

    // Add to container
    this.container.appendChild(toast.element);

    // Add to array
    this.toasts.push(toast);

    // Trigger slide in animation
    requestAnimationFrame(() => {
      toast.element.classList.add("toast-visible");
    });

    // Auto remove if duration is set
    if (toast.duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, toast.duration);
    }

    return toast;
  },

  /**
   * Show success toast
   * @param {string} message - Toast message
   * @param {Object} options - Additional options
   * @returns {Object} Toast instance
   */
  success(message, options = {}) {
    return this.show(message, { ...options, type: "success" });
  },

  /**
   * Show error toast
   * @param {string} message - Toast message
   * @param {Object} options - Additional options
   * @returns {Object} Toast instance
   */
  error(message, options = {}) {
    return this.show(message, { ...options, type: "error" });
  },

  /**
   * Show warning toast
   * @param {string} message - Toast message
   * @param {Object} options - Additional options
   * @returns {Object} Toast instance
   */
  warning(message, options = {}) {
    return this.show(message, { ...options, type: "warning" });
  },

  /**
   * Show info toast
   * @param {string} message - Toast message
   * @param {Object} options - Additional options
   * @returns {Object} Toast instance
   */
  info(message, options = {}) {
    return this.show(message, { ...options, type: "info" });
  },

  /**
   * Show loading toast (persistent until manually closed)
   * @param {string} message - Toast message
   * @param {Object} options - Additional options
   * @returns {Object} Toast instance
   */
  loading(message, options = {}) {
    return this.show(message, {
      ...options,
      type: "loading",
      duration: 0, // Don't auto-dismiss
      dismissible: false,
      icon: "loader",
    });
  },

  /**
   * Create toast element
   * @param {Object} toast - Toast object
   * @returns {HTMLElement}
   */
  createToastElement(toast) {
    const element = document.createElement("div");
    element.className = `toast toast-${toast.type}`;
    element.setAttribute("data-toast-id", toast.id);

    const iconHtml =
      toast.type === "loading"
        ? `<i data-lucide="${toast.icon}" class="toast-icon toast-icon-spin"></i>`
        : `<i data-lucide="${toast.icon}" class="toast-icon"></i>`;

    element.innerHTML = `
      ${iconHtml}
      <span class="toast-message">${this.escapeHtml(toast.message)}</span>
      ${
        toast.dismissible
          ? '<button class="toast-close" aria-label="Close"><i data-lucide="x"></i></button>'
          : ""
      }
    `;

    // Initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Add click handler for dismissible toasts
    if (toast.dismissible) {
      const closeBtn = element.querySelector(".toast-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.remove(toast.id);
        });
      }
    }

    // Add click handler for toast
    if (toast.onClick) {
      element.style.cursor = "pointer";
      element.addEventListener("click", () => {
        toast.onClick(toast);
        this.remove(toast.id);
      });
    }

    return element;
  },

  /**
   * Remove toast by ID
   * @param {number} id - Toast ID
   */
  remove(id) {
    const toastIndex = this.toasts.findIndex((t) => t.id === id);
    if (toastIndex === -1) return;

    const toast = this.toasts[toastIndex];

    if (toast.element) {
      // Trigger slide out animation
      toast.element.classList.remove("toast-visible");
      toast.element.classList.add("toast-hiding");

      // Remove from DOM after animation
      setTimeout(() => {
        if (toast.element && toast.element.parentNode) {
          toast.element.remove();
        }
      }, 300);
    }

    // Remove from array
    this.toasts.splice(toastIndex, 1);
  },

  /**
   * Remove all toasts
   */
  clear() {
    this.toasts.forEach((toast) => {
      if (toast.element) {
        toast.element.remove();
      }
    });
    this.toasts = [];
  },

  /**
   * Update toast message
   * @param {number} id - Toast ID
   * @param {string} message - New message
   */
  update(id, message) {
    const toast = this.toasts.find((t) => t.id === id);
    if (!toast || !toast.element) return;

    const messageEl = toast.element.querySelector(".toast-message");
    if (messageEl) {
      messageEl.textContent = message;
    }
    toast.message = message;
  },

  /**
   * Change toast type
   * @param {number} id - Toast ID
   * @param {string} type - New type
   */
  changeType(id, type) {
    const toast = this.toasts.find((t) => t.id === id);
    if (!toast || !toast.element) return;

    // Remove old type class
    toast.element.classList.remove(`toast-${toast.type}`);

    // Add new type class
    toast.element.classList.add(`toast-${type}`);
    toast.type = type;

    // Update icon
    const iconEl = toast.element.querySelector(".toast-icon");
    if (iconEl) {
      const newIcon = this.getDefaultIcon(type);
      iconEl.setAttribute("data-lucide", newIcon);

      // Re-init icons
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  },

  /**
   * Get default icon for toast type
   * @param {string} type - Toast type
   * @returns {string} Icon name
   */
  getDefaultIcon(type) {
    const icons = {
      success: "check-circle",
      error: "x-circle",
      warning: "alert-triangle",
      info: "info",
      loading: "loader",
    };
    return icons[type] || "info";
  },

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Set toast position
   * @param {string} position - Position (bottom-right, bottom-left, etc.)
   */
  setPosition(position) {
    this.config.position = position;
    if (this.container) {
      this.container.setAttribute("data-position", position);
    }
  },

  /**
   * Set default duration
   * @param {number} duration - Duration in milliseconds
   */
  setDuration(duration) {
    this.config.duration = duration;
  },
};

// Export to window for global access
window.ToastSystem = ToastSystem;

// Backward compatibility: create showToast function
window.showToast = function (message, type = "info", duration = 3000) {
  return ToastSystem.show(message, { type, duration });
};

console.log("✅ Toast System loaded and available at window.ToastSystem");
