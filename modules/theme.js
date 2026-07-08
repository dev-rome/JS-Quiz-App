export function initTheme() {
  const checkBoxTheme = document.querySelector("#theme-checkbox");
  checkBoxTheme.addEventListener("change", () => {
    const theme = checkBoxTheme.checked ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  });
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
    checkBoxTheme.checked = savedTheme === "light";
  }
}