/**
 * Iggy - AI Systems Registry Engine
 * Core Async Lifecycle Loader & Render Chain
 */

document.addEventListener('DOMContentLoaded', () => {
    initializeRegistryFetch();
});

async function initializeRegistryFetch() {
    const toolsStack = document.getElementById('live-tools-stack');
    const articlesStack = document.getElementById('live-articles-stack');

    try {
        // Fetch centralized resource matrix
        const response = await fetch('manifest.json');
        if (!response.ok) throw new Error(`HTTP network error: status code ${response.status}`);
        
        const assets = await response.json();

        // Flush layout containers before population loop
        if (toolsStack) toolsStack.innerHTML = '';
        if (articlesStack) articlesStack.innerHTML = '';

        // Iterate flat matrix array properties asynchronously
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
 * Compiles plain primitive elements into standard click-navigable anchor nodes
 */
function createSemanticCard(asset) {
    // Wrap container inside a semantic block anchor pointing straight to your destination
    const anchor = document.createElement('a');
    anchor.href = asset.path;
    anchor.className = 'card-interactive-wrapper';
    anchor.style.textDecoration = 'none';
    anchor.style.display = 'block';
    anchor.style.color = 'inherit';

    // Map content tags array out to a clean markup string layout
    const tagsHTML = asset.tags ? asset.tags.map(tag => `<span class="tag-pill">${tag}</span>`).join('') : '';

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

function fallbackErrorLayout(containerA, containerB) {
    const alertMsg = `<p style="font-family: var(--font-mono); font-size: var(--size-small); color: var(--text-muted);">Error resolving asset matrix nodes.</p>`;
    if (containerA) containerA.innerHTML = alertMsg;
    if (containerB) containerB.innerHTML = alertMsg;
}
