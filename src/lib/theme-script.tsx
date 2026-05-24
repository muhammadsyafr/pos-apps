export function ThemeScript() {
  const script = `
    (function() {
      var key = "theme";
      var query = "(prefers-color-scheme: dark)";
      var stored;
      try { stored = localStorage.getItem(key); } catch(e) {}
      var theme = stored || "system";
      if (theme === "system") {
        theme = window.matchMedia(query).matches ? "dark" : "light";
      }
      document.documentElement.classList.add(theme);
      document.documentElement.style.colorScheme = theme;
    })();
  `
  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
    />
  )
}
