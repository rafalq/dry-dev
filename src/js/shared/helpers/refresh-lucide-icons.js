export function refreshLucideIcons() {
  if (window.lucide) {
    setTimeout(() => {
      window.lucide.createIcons();
    }, 0);
  }
}
