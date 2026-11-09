/**
 * The scripted PortfolioBot grew into the live assistant in
 * ./assistant/Assistant.jsx (same launcher, same panel, grounded answers from
 * the API with the script as the offline fallback). This module keeps the
 * import path App.jsx already lazy-loads.
 */
export { default } from "./assistant/Assistant"
