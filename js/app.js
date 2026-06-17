/**
 * Iggy - AI Systems Registry Engine
 * Core Async Lifecycle Loader, Render Chain, & Interactive Sandbox
 */

document.addEventListener('DOMContentLoaded', () => {
    initializeRegistryFetch();
    initializeInteractiveSandbox();
});

/**
 * Asynchronously fetches and parses the centralized manifest registry matrix
 */
async function initializeRegistryFetch() {
    const toolsStack = document.getElementById('live-tools-stack');
    const articlesStack = document.getElementById('live-articles-stack');

    try {
        // Fetch centralized resource matrix array database
        const response = await fetch('manifest.json');
        if (!response.ok) throw new Error(`HTTP network error: status code ${response.status}`);
        
        const assets = await response.json();

        // Flush layout target containers before execution loop
        if (toolsStack) toolsStack.innerHTML = '';
        if (articlesStack) articlesStack.innerHTML = '';

        // Iterate flat matrix properties and inject structured markup nodes
        assets.forEach(asset => {
            const cardMarkup = createSemanticCard(asset);

            if (asset.type === 'tool' && toolsStack) {
                toolsStack.appendChild(cardMarkup);
            } else if (asset.type === 'article' && articlesStack) {
                articlesStack.appendChild(cardMarkup);
            }
        });

    } catch (error) {
        console.error('Registry lifecycle initialization fault:', error);
        fallbackErrorLayout(toolsStack, articlesStack);
    }
}

/**
 * Compiles plain manifest object primitive tokens into clickable anchor link layouts
 */
function createSemanticCard(asset) {
    const anchor = document.createElement('a');
    anchor.href = asset.path;
    anchor.className = 'card-interactive-wrapper';
    
    // Process string tags array into distinct markup elements
    const tagsHTML = asset.tags 
        ? asset.tags.map(tag => `<span class="tag-pill">${tag}</span>`).join('') 
        : '';

    anchor.innerHTML = `
        <div class="domain-card" data-id="${asset.id}">
            <div class="card-tag-row" style="margin-bottom: var(--space-12); display: flex; gap: var(--space-8); flex-wrap: wrap;">
                ${tagsHTML}
            </div>
            <h3 class="domain-title" style="margin-top: 0;">${asset.title}</h3>
            <p class="domain-desc">${asset.description}</p>
        </div>
    `;

    return anchor;
}

/**
 * Renders a fallback interface for the Interactive Sandbox container element
 */
function initializeInteractiveSandbox() {
    const sandboxTarget = document.getElementById('dynamic-sandbox-target');
    if (!sandboxTarget) return;

    sandboxTarget.innerHTML = `
        <div class="domain-card" style="background: var(--bg-surface-1); margin-top: var(--space-16);">
            <p class="domain-desc" style="margin-bottom: var(--space-16);">
                Select a network layer dimension below to test linear projection vectors across localized weight spaces.
            </p>
            <div style="display: flex; gap: var(--space-12); flex-wrap: wrap; margin-bottom: var(--space-24);">
                <button class="btn btn-secondary" onclick="simulateLayerProbing(12)">Layer 12 (Residual Stream)</button>
                <button class="btn btn-secondary" onclick="simulateLayerProbing(24)">Layer 24 (Attention Output)</button>
                <button class="btn btn-secondary" onclick="simulateLayerProbing(32)">Layer 32 (MLP Layer)</button>
            </div>
            <div id="sandbox-telemetry" style="font-family: var(--font-mono); font-size: var(--size-small); padding: var(--space-16); background: var(--bg-core); border: 1px dashed var(--border-subtle); border-radius: 6px; color: var(--text-muted);">
                // System idle. Select a target matrix layer block to parse telemetry.
            </div>
        </div>
    `;
}

/**
 * Global click scope tracker for interactive structural metrics simulation
 */
window.simulateLayerProbing = function(layerNumber) {
    const outputFrame = document.getElementById('sandbox-telemetry');
    if (!outputFrame) return;

    outputFrame.style.color = 'var(--text-title)';
    outputFrame.innerHTML = `
        <span style="color: var(--accent-primary); font-weight:700;">[LAYER_${layerNumber}_ACTIVE]</span><br>
        Probing Vector Matrix Alignment... OK<br>
        Cosine Similarity Metric: <span style="font-weight: 600;">${(Math.random() * 0.3 + 0.65).toFixed(4)}</span><br>
        Concepts Tracked: [Syntax Tree Validation, Schema Constraints Node]
    `;
};

/**
 * Generates clear error alerts if the app experiences file-load faults
 */
function fallbackErrorLayout(containerA, containerB) {
    const alertMsg = `<p style="font-family: var(--font-mono); font-size: var(--size-small); color: var(--text-muted);">Error loading assets from manifest database.</p>`;
    if (containerA) containerA.innerHTML = alertMsg;
    if (containerB) containerB.innerHTML = alertMsg;
}
