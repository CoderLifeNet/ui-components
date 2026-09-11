document.documentElement.classList.add(
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "theme-dark"
    : "theme-light",
);
