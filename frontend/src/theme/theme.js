export const THEME_STORAGE_KEY = "envmonitor_theme";

export function getSavedTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function getNextTheme(theme) {
  return theme === "dark" ? "light" : "dark";
}
