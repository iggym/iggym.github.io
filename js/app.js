/**
 * Iggy - AI Systems Registry Engine
 * Core Async Lifecycle Loader, Render Chain, & Interactive Sandbox
 */

document.addEventListener('DOMContentLoaded', () => {
    initializeRegistryFetch();
    initializeInteractiveSandbox();
});

let cachedAssetsMatrix = [];

/**
 * Asynchronously fetches and parses the centralized manifest registry matrix
 */
async function initializeRegistryFetch() {
    const toolsStack = document.getElementById('live-tools-stack');
    const articlesStack = document.getElementById('live-articles-stack');
    const masterGrid = document.getElementById('master-portfolio-grid');

    try {
        const response = await fetch('manifest.json');
        if (!response.ok) throw new Error(`HTTP network error: status code ${response.status}`);
        
        cachedAssetsMatrix = await response.json();

        // Render Split-Feeds if present on landing viewport
        if (toolsStack || articlesStack) {
            if (toolsStack) toolsStack.innerHTML = '';
            if (articlesStack) articlesStack.innerHTML = '';

            cachedAssetsMatrix.forEach(asset => {
                const cardMarkup = createSemanticCard(asset);
                if (asset.type === 'tool' && toolsStack) {
                    toolsStack.appendChild(cardMarkup);
                } else if (asset.type === 'article' && articlesStack) {
                    articlesStack.appendChild(cardMarkup);
                }
            });
        }

        // Render Multi-Filter Matrix Viewport on portfolio.html layout
        if (masterGrid) {
            renderMasterPortfolioGrid('all');
            initializeFilterTabActions();
            
            // Core Change: Evaluate location hash rules immediately following asset mount lifecycle
            executeHashRoutingJump();
        }

    } catch (error) {
        console.error('Registry lifecycle initialization fault:', error);
        fallbackErrorLayout(toolsStack, articlesStack, masterGrid);
    }
}

/**
 * Renders data components into the master portfolio workspace container matching filter configurations
 */
function renderMasterPortfolioGrid(filterValue) {
    const masterGrid = document.getElementById('master-portfolio-grid');
    if (!masterGrid) return;
    
    masterGrid.innerHTML = '';
    
    cachedAssetsMatrix.forEach(asset => {
        if (filterValue === 'all' || asset.type === filterValue) {
            const cardMarkup = createSemanticCard(asset);
            masterGrid.appendChild(cardMarkup);
        }
    });

    if (masterGrid.children.length === 0) {
        masterGrid.innerHTML = `<p style="font-family: var(--font-mono); font-size: var(--size-small); color: var(--text-muted);">No asset modules match your selection filters.</p>`;
    }
}

/**
 * Compiles plain manifest object parameters into functional, high-leverage UI cards
 */
function createSemanticCard(asset) {
    const anchor = document.createElement('a');
    anchor.href = asset.path;
    anchor.className = 'card-interactive-wrapper';
    // Core Change: Bind the unique database ID token to the element wrapper string
    anchor.id = asset.id; 
    
    const tagsHTML = asset.tags 
        ? asset.tags.map(tag => `<span class="tag-pill">${tag}</span>`).join('') 
        : '';

    anchor.innerHTML = `
        <div class="domain-card" data-id="${asset.id}">
            <div>
                <div class="card-tag-row" style="margin-bottom: var(--space-12); display: flex; gap: var(--space-8); flex-wrap: wrap;">
                    ${tagsHTML}
                </div>
                <h3 class="domain-title" style="margin-top: 0;">${asset.title}</h3>
                <p class="domain-desc">${asset.description}</p>
            </div>
            <div class="card-action-link">
                Open Asset Module <span style="margin-left: var(--space-4); transition: transform var(--duration-micro); display: inline-block;">&rarr;</span>
            </div>
        </div>
    `;

    return anchor;
}

/**
 * Parses current window parameters and intercepts scroll behaviors to locate targeted assets smoothly
 */
function executeHashRoutingJump() {
    if (window.location.hash) {
        const targetElementId = window.location.hash.substring(1);
        const targetCard = document.getElementById(targetElementId);
        
        if (targetCard) {
            setTimeout(() => {
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Visual Indicator: Provide a temporary distinct high-contrast border state transition
                const internalCardNode = targetCard.querySelector('.domain-card');
                if (internalCardNode) {
                    internalCardNode.style.borderColor = 'var(--text-title)';
                    internalCardNode.style.boxShadow = '0 0 0 2px var(--border-subtle)';
                }
            }, 250); // Small execution step buffer ensures layout stability on mobile rendering views
        }
    }
}

/**
 * Binds browser user interaction vectors directly to dataset filtering buttons
 */
function initializeFilterTabActions() {
    const tabs = document.querySelectorAll('.filter-tabs .tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            
            const currentTab = e.currentTarget;
            currentTab.classList.add('active');
            currentTab.setAttribute('aria-selected', 'true');
            
            const selectedFilter = currentTab.getAttribute('data-filter');
            renderMasterPortfolioGrid(selectedFilter);
        });
    });
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

window.simulateLayerProbing = function(layerNumber) {
    const outputFrame = document.getElementById('sandbox-telemetry');
    if (!outputFrame) return;

    outputFrame.style.color = 'var(--text-title)';
    outputFrame.innerHTML = `
        <span style="color: var(--accent-primary); font-weight:700;">[LAYER_${layerNumber}_ACTIVE]</span><br>
        Probing Vector Matrix Alignment... OK...<br>
        Cosine Similarity Metric: <span style="font-weight: 600;">${(Math.random() * 0.3 + 0.65).toFixed(4)}</span><br>
        Concepts Tracked: [Syntax Tree Validation, Schema Constraints Node]
    `;
};

function fallbackErrorLayout(containerA, containerB, containerC) {
    const alertMsg = `<p style="font-family: var(--font-mono); font-size: var(--size-small); color: var(--text-muted);">Error loading assets from manifest database.</p>`;
    if (containerA) containerA.innerHTML = alertMsg;
    if (containerB) containerB.innerHTML = alertMsg;
    if (containerC) containerC.innerHTML = alertMsg;
}
