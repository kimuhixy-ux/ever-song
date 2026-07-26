// config.js: monetization-related settings
// Ko-fi username. Leave empty to hide the donate link.
export const KOFI_USERNAME = "kimuhixy";

// AdSense should only render on the custom domain (kimuhixy.com), not on the
// GitHub Pages / Cloudflare Pages standalone URLs (avoids duplicate-content issues).
export const ADS_ENABLED = location.hostname === "kimuhixy.com";

// Google AdSense publisher ID
export const ADSENSE_CLIENT_ID = "ca-pub-3562055879455682";
