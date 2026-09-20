(() => {
  const TAKEN = new Set(["taken", "admin", "root"]);

  const mockBody = {
    taken: Array.from(TAKEN),
    note: "exists=true means the name is already taken",
  };

  // Keep guidance in sync with the visible mock list (JSON blob for clarity).
  const guideNote = document.createElement("pre");
  guideNote.className = "mock-json";
  guideNote.textContent = JSON.stringify(mockBody, null, 2);
  document.querySelector(".guide")?.append(guideNote);

  const style = document.createElement("style");
  style.textContent = `
    .mock-json {
      margin: 0.75rem 0 0;
      padding: 0.65rem 0.75rem;
      overflow: auto;
      border-radius: 0.3rem;
      background: #123028;
      color: #d7f0e4;
      font-size: 0.8rem;
    }
  `;
  document.head.append(style);

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = new URL(String(input), location.href);
    if (url.pathname === "/api/users/exists") {
      await new Promise((r) => setTimeout(r, 350));
      const value = (url.searchParams.get("value") ?? "").trim().toLowerCase();
      const exists = TAKEN.has(value);
      return new Response(JSON.stringify({ exists, value }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return originalFetch(input, init);
  };

  if (!window.Existian || typeof window.Existian.init !== "function") {
    console.error("Existian IIFE not loaded. Run npm run build:doc-site first.");
    return;
  }

  window.Existian.init();
})();
