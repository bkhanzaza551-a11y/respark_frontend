let lastVersion = null;
let checking = false;

export function initVersionChecker() {
  if (checking) return;
  checking = true;

  fetch(`/?_cb=${Date.now()}`, { cache: "no-store" })
    .then((r) => r.text())
    .then((html) => {
      const match = html.match(/src="\/assets\/index-([^"]+)\.js"/);
      if (match) {
        const currentVersion = match[1];
        lastVersion = currentVersion;

        setInterval(() => {
          fetch(`/?_cb=${Date.now()}`, { cache: "no-store" })
            .then((r) => r.text())
            .then((newHtml) => {
              const newMatch = newHtml.match(/src="\/assets\/index-([^"]+)\.js"/);
              if (newMatch && newMatch[1] !== lastVersion) {
                lastVersion = newMatch[1];
                sessionStorage.setItem("app_version", lastVersion);
                if (sessionStorage.getItem("_reloaded_for_update")) return;
                sessionStorage.setItem("_reloaded_for_update", "1");
                window.location.replace(
                  window.location.pathname + "?_v=" + Date.now()
                );
              }
            })
            .catch(() => {});
        }, 60000);
      }
    })
    .catch(() => {});
}
