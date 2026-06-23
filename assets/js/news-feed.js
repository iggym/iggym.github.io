document.addEventListener("DOMContentLoaded", () => {
  const endpoint = "https://ai-news-feed.iggy-mw.workers.dev/";
  const grid = document.getElementById("news-grid");
  const filterTabsContainer = document.getElementById("dynamic-filter-tabs");
  let globalNewsCache = [];

  function calculateTimeAgo(dateString) {
    try {
      const parsed = new Date(dateString);
      if(isNaN(parsed)) return 'Recents';
      const diffMs = new Date() - parsed;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHr / 24);

      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHr < 24) return `${diffHr}h ago`;
      return `${diffDays}d ago`;
    } catch(e) { return 'Recents'; }
  }

  function renderNews(items) {
    if(!grid) return;
    grid.innerHTML = "";
    if (items.length === 0) {
      grid.innerHTML = `<div class="error-slate" style="grid-column: 1/-1; text-align: center; color: var(--muted); padding: 3rem 0;">No recent signals found mapping this core domain target.</div>`;
      return;
    }
    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "card news-card reveal reveal-visible";
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <span class="mono-tag" style="color:var(--headline); background:var(--void); padding:2px 6px; border-radius:3px; font-size:0.7rem;">${item.source_tag.toUpperCase()} — ${item.source_name}</span>
          <span style="font-family:'DM Mono'; font-size:0.75rem; color:var(--muted);">${calculateTimeAgo(item.pubDate)}</span>
        </div>
        <h3 style="font-size:1.2rem; margin:0 0 0.75rem 0; line-height:1.3;">${item.title.substring(0,80)}${item.title.length > 80 ? '...' : ''}</h3>
        <p style="font-size:0.85rem; color:var(--muted); margin-bottom:1rem;">${item.description || 'View full coverage via the resource channel signal.'}</p>
        <a href="${item.link}" target="_blank" rel="noopener" style="color:var(--accent); text-decoration:none; font-family:'DM Mono'; font-size:0.8rem; display:inline-flex; align-items:center; gap:4px;">Analyze Signal ↗</a>
      `;
      grid.appendChild(card);
    });
  }

  function renderFilterButtons() {
    if (!filterTabsContainer) return;
    
    // Extract unique tags, filtering out empty or falsy values
    let uniqueTags = [...new Set(globalNewsCache.map(item => item.source_tag).filter(Boolean))];
    
    // Fallback: If your deployed worker hasn't been updated yet, derive categories from source names
    if (uniqueTags.length === 0 && globalNewsCache.length > 0) {
      uniqueTags = [...new Set(globalNewsCache.map(item => {
        const name = (item.source_name || "").toLowerCase();
        if (name.includes("arxiv") || name.includes("post") || name.includes("hugging")) return "Research";
        if (name.includes("verge")) return "Digest";
        if (name.includes("google")) return "Google";
        if (name.includes("openai")) return "OpenAI";
        return "Signals";
      }))];
      
      // Retroactively fix the cache items so filtering works seamlessly on legacy payloads
      globalNewsCache.forEach(item => {
        const name = (item.source_name || "").toLowerCase();
        if (name.includes("arxiv") || name.includes("post") || name.includes("hugging")) item.source_tag = "Research";
        else if (name.includes("verge")) item.source_tag = "Digest";
        else if (name.includes("google")) item.source_tag = "Google";
        else if (name.includes("openai")) item.source_tag = "OpenAI";
        else item.source_tag = "Signals";
      });
    }
    
    // Clear and build the button set starting with the global filter
    filterTabsContainer.innerHTML = `<button class="filter-btn active" data-filter="all">All</button>`;
    
    uniqueTags.forEach(tag => {
      const btn = document.createElement("button");
      btn.className = "filter-btn";
      btn.setAttribute("data-filter", tag);
      btn.textContent = tag;
      filterTabsContainer.appendChild(btn);
    });

    // Unified Event Delegation
    filterTabsContainer.onclick = (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      
      filterTabsContainer.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const filter = btn.getAttribute("data-filter");
      if (filter === "all") {
        renderNews(globalNewsCache);
      } else {
        const filtered = globalNewsCache.filter(item => (item.source_tag || "").toLowerCase() === filter.toLowerCase());
        renderNews(filtered);
      }
    };
  }

  async function loadNews() {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error();
      const data = await res.json();
      globalNewsCache = data.items || [];
      
      renderFilterButtons();
      renderNews(globalNewsCache);
    } catch (err) {
      if(grid) {
        grid.innerHTML = `
          <div style="grid-column: 1/-1; text-align:center; padding: 3rem 0;">
            <p style="color:var(--muted); margin-bottom:1rem;">Feed infrastructure processing window offline.</p>
            <button id="retry-feed" class="btn btn-secondary" style="padding:0.4rem 1rem; font-size:0.8rem;">Retry Pipeline Connections</button>
          </div>`;
        document.getElementById("retry-feed")?.addEventListener("click", () => {
          grid.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>';
          loadNews();
        });
      }
    }
  }

  loadNews();
});
