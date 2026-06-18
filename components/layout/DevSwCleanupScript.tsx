/** Unregister service workers before React loads (dev only). Prevents stale SW from breaking `next dev`. */
export default function DevSwCleanupScript() {
  if (process.env.NODE_ENV !== "development") return null;

  const script = `
(function() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.getRegistrations().then(function(regs) {
    regs.forEach(function(r) { r.unregister(); });
  }).catch(function() {});
  if ('caches' in window) {
    caches.keys().then(function(keys) {
      keys.forEach(function(k) { caches.delete(k); });
    }).catch(function() {});
  }
})();
`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
