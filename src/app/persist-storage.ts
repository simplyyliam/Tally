/**
 * Asks the browser to keep Tally's saved data even when the device is low on
 * space. Without this, browsers may clear a site's storage on their own (Safari
 * does so for sites not opened for 7 days). Installed apps are usually granted
 * this silently; if the browser says no, nothing changes and backups remain the
 * safety net.
 */
export function requestPersistentStorage(): void {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return
  navigator.storage
    .persisted()
    .then((already) => (already ? true : navigator.storage.persist()))
    .catch(() => {
      // Not supported or refused: data is still saved, just not protected from eviction.
    })
}
