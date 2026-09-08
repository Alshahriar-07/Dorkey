const $ = (selector, root = document) => root.querySelector(selector);

function initNavigation() {
  const toggle = $(".nav-toggle");
  const links = $(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

function initConsent() {
  let popup = $("#consent");
  if (!popup) {
    popup = document.createElement("aside");
    popup.className = "consent";
    popup.id = "consent";
    popup.hidden = true;
    const privacyPath = location.pathname.includes("/pages/") ? "privacy.html" : "pages/privacy.html";
    popup.innerHTML = `<h3>Your privacy matters</h3><p>Dorkey uses browser storage only to remember consent and your latest local result. No tracking or advertising cookies.</p><div class="consent-actions"><a href="${privacyPath}" class="button ghost">Privacy policy</a><button id="decline-consent" class="button">Decline</button><button id="accept-consent" class="button primary">Accept</button></div>`;
    document.body.appendChild(popup);
  }
  let consent = null;
  try { consent = localStorage.getItem("dorkey_cookie_consent"); } catch (error) { console.warn("Storage unavailable:", error); }
  if (consent) return;
  popup.hidden = false;
  const save = value => {
    try { localStorage.setItem("dorkey_cookie_consent", value); } catch (error) { console.warn("Could not save consent:", error); }
    popup.hidden = true;
  };
  $("#accept-consent", popup)?.addEventListener("click", () => save("accepted"));
  $("#decline-consent", popup)?.addEventListener("click", () => save("declined"));
}

function initPageTransitions() {
  document.querySelectorAll("a[href]").forEach(link => {
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.hash || link.target === "_blank") return;
    link.addEventListener("click", event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      document.body.classList.add("page-exit");
      setTimeout(() => { location.href = url.href; }, 280);
    });
  });
}

document.body.classList.add("page-enter");
window.setTimeout(() => document.body.classList.add("page-enter-active"), 0);
initNavigation();
initConsent();
initPageTransitions();
