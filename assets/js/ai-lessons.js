document.addEventListener("DOMContentLoaded", () => {
  // Navigation Tabs Engine Integration
  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".lesson-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
      panels.forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      document.getElementById(tab.getAttribute("data-tab")).classList.add("active");
    });
  });

  // --- Lesson 1 Logic: Heuristic Token Parsing ---
  const anatomyInput = document.getElementById("anatomy-input");
  const anatomyOutput = document.getElementById("anatomy-output");

  function dissectPrompt() {
    if(!anatomyInput || !anatomyOutput) return;
    const val = anatomyInput.value;
    let HTMLOut = val
      .replace(/(Act as an? [^.]+)/gi, '<span class="anatomy-block persona" title="Persona Definition">$1</span>')
      .replace(/(Analyze[^.]+snippet|Dissect[^.]+logic)/gi, '<span class="anatomy-block context" title="Context Parameters">$1</span>')
      .replace(/(Output your findings[^.]+table|Format as[^.]+)/gi, '<span class="anatomy-block structural-format" title="Format Execution Instructions">$1</span>');
    anatomyOutput.innerHTML = HTMLOut || "Awaiting execution structural parsing analytics...";
  }
  anatomyInput?.addEventListener("input", dissectPrompt);
  dissectPrompt();

  // --- Lesson 2 Logic: Context Slider Simulator ---
  const slider = document.getElementById("context-slider");
  const sliderVal = document.getElementById("slider-val");
  const segments = {
    history: document.querySelector(".bar-segment.segment-history"),
    empty: document.querySelector(".bar-segment.segment-empty")
  };

  slider?.addEventListener("input", (e) => {
    const val = parseInt(e.target.value);
    sliderVal.textContent = `${val.toLocaleString()} / 128,000 tokens`;
    const totalMax = 128000;
    const historyPct = (val / totalMax) * 100;
    const systemPct = 5; 
    const currentPct = 15;
    const emptyPct = Math.max(0, 100 - (historyPct + systemPct + currentPct));

    if(segments.history && segments.empty) {
      segments.history.style.width = `${historyPct}%`;
      segments.history.textContent = `History (${Math.round(val/1000)}k)`;
      segments.empty.style.width = `${emptyPct}%`;
      segments.empty.textContent = emptyPct > 10 ? `Headroom (${Math.round((emptyPct*totalMax)/100000)}k)` : '';
    }
  });

  // --- Lesson 3 Logic: Interactivity Node Analytics ---
  const nodes = {
    perception: "Perception Model Engine: ingests raw log state changes, unstructured context, and environmental API schemas.",
    reasoning: "Reasoning Node Architecture: processes feature weights, structures multi-path logical code options using Monte Carlo configurations.",
    action: "Action Pipeline Hooks: executes targeted refactoring mutations directly via systemic sandboxed platform interfaces.",
    memory: "State Memory Arrays: serializes prompt state updates into high-dimensional geometric vector structures."
  };

  document.querySelectorAll(".loop-node").forEach(node => {
    node.addEventListener("click", () => {
      document.querySelectorAll(".loop-node circle").forEach(c => c.style.stroke = "none");
      node.querySelector("circle").style.stroke = "var(--accent)";
      node.querySelector("circle").style.strokeWidth = "2px";
      const id = node.getAttribute("data-node");
      const tooltip = document.getElementById("node-tooltip");
      if(tooltip) tooltip.textContent = nodes[id];
    });
  });

  // --- Lesson 4 Logic: Production Lane Toggles ---
  const toggleBtn = document.getElementById("toggle-workflow");
  const leftLane = document.getElementById("workflow-panel-left");
  const rightLane = document.getElementById("workflow-panel-right");

  toggleBtn?.addEventListener("click", () => {
    leftLane?.classList.toggle("active-lane");
    rightLane?.classList.toggle("active-lane");
  });

  // --- Lesson 5 Logic: Interactive API Simulator Engine ---
  const tmplButtons = document.querySelectorAll(".tmpl-btn");
  const apiInput = document.getElementById("api-prompt-input");
  const runBtn = document.getElementById("run-api-test");
  const apiOutput = document.getElementById("api-output");

  tmplButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if(apiInput) apiInput.value = btn.getAttribute("data-prompt");
    });
  });

  runBtn?.addEventListener("click", () => {
    if(!apiOutput || !apiInput) return;
    const text = apiInput.value;
    if(!text) return;
    apiOutput.textContent = "";
    let mockResponse = `[EXECUTION LOG] Initializing dynamic structural model response path analysis arrays...\n\nProcessing targeted system architecture telemetry metrics for prompt request payload parameter structure:\n\n"${text.substring(0,40)}..."\n\n[SUCCESS] Structural operational configurations validation verification loops computed successfully without code regressions. Execution terminated safely.`;
    let i = 0;
    function stream() {
      if (i < mockResponse.length) {
        apiOutput.textContent += mockResponse.charAt(i);
        i++;
        setTimeout(stream, 12);
      }
    }
    stream();
  });
});
