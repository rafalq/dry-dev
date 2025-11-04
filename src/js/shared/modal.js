/**
 * ========================================
 * MODAL SYSTEM
 * Universal modal handler for API Tester
 * ========================================
 */

const ModalSystem = {
  currentModal: null,

  /**
   * Show Quick Fill modal
   * @param {Array} options - Array of endpoint options
   * @param {Function} onSelect - Callback when option is selected
   */
  showQuickFill(options, onSelect) {
    const modalHtml = `
      <div class="modal-backdrop" id="quickFillModal">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title">
              <i data-lucide="zap" style="width: 24px; height: 24px; color: var(--color-primary);"></i>
              Quick Fill Options
            </h3>
            <button class="modal-close" aria-label="Close modal">
              <i data-lucide="x" style="width: 20px; height: 20px;"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="quick-fill-options">
              ${options
                .map(
                  (option, index) => `
                <div class="quick-fill-option" data-index="${index}">
                  <div class="quick-fill-option-icon">${index + 1}</div>
                  <div class="quick-fill-option-content">
                    <h4 class="quick-fill-option-title">${option.name}</h4>
                    <div>
                      <span class="quick-fill-option-method">${option.method}</span>
                      <span class="quick-fill-option-url">${option.url}</span>
                    </div>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm modal-cancel">Cancel</button>
          </div>
        </div>
      </div>
    `;

    this.show(modalHtml, (modal) => {
      // Handle option clicks
      modal.querySelectorAll(".quick-fill-option").forEach((option) => {
        option.addEventListener("click", () => {
          const index = parseInt(option.dataset.index);
          this.close();
          onSelect(options[index]);
        });
      });

      // Handle cancel
      const cancelBtn = modal.querySelector(".modal-cancel");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => this.close());
      }
    });
  },

  /**
   * Show confirmation modal
   * @param {string} title - Modal title
   * @param {string} message - Modal message
   * @param {Function} onConfirm - Callback when confirmed
   */
  showConfirm(title, message, onConfirm) {
    const modalHtml = `
      <div class="modal-backdrop" id="confirmModal">
        <div class="modal-container" style="max-width: 400px;">
          <div class="modal-header">
            <h3 class="modal-title">
              <i data-lucide="alert-circle" style="width: 24px; height: 24px; color: var(--color-warning);"></i>
              ${title}
            </h3>
            <button class="modal-close" aria-label="Close modal">
              <i data-lucide="x" style="width: 20px; height: 20px;"></i>
            </button>
          </div>
          <div class="modal-body">
            <p style="color: var(--text-secondary); margin: 0;">${message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm modal-cancel">Cancel</button>
            <button class="btn btn-primary btn-sm modal-confirm">Confirm</button>
          </div>
        </div>
      </div>
    `;

    this.show(modalHtml, (modal) => {
      const confirmBtn = modal.querySelector(".modal-confirm");
      const cancelBtn = modal.querySelector(".modal-cancel");

      if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
          this.close();
          onConfirm();
        });
      }

      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => this.close());
      }
    });
  },

  /**
   * Show generic modal
   * @param {string} html - Modal HTML
   * @param {Function} onInit - Callback after modal is initialized
   */
  show(html, onInit) {
    // Close existing modal if any
    if (this.currentModal) {
      this.close();
    }

    // Create modal element
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    const modal = wrapper.firstElementChild;

    // Append to body
    document.body.appendChild(modal);
    this.currentModal = modal;

    // Initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Setup close handlers
    const closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    // Close on backdrop click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.close();
      }
    });

    // Close on ESC key
    const escHandler = (e) => {
      if (e.key === "Escape") {
        this.close();
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);

    // Run initialization callback
    if (onInit) {
      onInit(modal);
    }

    // Prevent body scroll
    document.body.style.overflow = "hidden";
  },

  /**
   * Close current modal
   */
  close() {
    if (!this.currentModal) return;

    // Add closing animation
    this.currentModal.classList.add("closing");

    // Remove after animation
    setTimeout(() => {
      if (this.currentModal && this.currentModal.parentNode) {
        this.currentModal.parentNode.removeChild(this.currentModal);
      }
      this.currentModal = null;

      // Restore body scroll
      document.body.style.overflow = "";
    }, 200);
  },
};

// Export to window for use in other scripts
window.ModalSystem = ModalSystem;

// export { ModalSystem };
