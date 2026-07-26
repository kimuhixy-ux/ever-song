// donate.js: renders the Ko-fi support link into the footer
import { KOFI_USERNAME } from "./config.js";

export function renderDonateLink() {
  if (!KOFI_USERNAME) return;
  const footer = document.querySelector(".app-footer");
  if (!footer) return;

  const a = document.createElement("a");
  a.className = "footer-donate";
  a.href = `https://ko-fi.com/${encodeURIComponent(KOFI_USERNAME)}`;
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = "☕ Support on Ko-fi";
  footer.appendChild(a);
}
