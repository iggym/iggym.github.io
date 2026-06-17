/**
 * Unified High-Contrast Light Mode Infrastructure Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    initInteractivePhysicsBackground();

    const isPortfolioPage = window.location.pathname.includes('portfolio.html');
    if (isPortfolioPage) {
        initPortfolioView();
    } else {
        initHomeHubView();
    }
});

/**
 * Visual Signature: Linear Light Matrix Network
 */
function initInteractivePhysicsBackground() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let nodes = [];
    const totalNodes = 30;
    let cursor = { x: null, y: null, reach: 180 };

    function normalizeMatrix() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    normalizeMatrix();
    window.addEventListener('resize', normalizeMatrix);

    window.addEventListener('mousemove', (e) => {
        cursor.x = e.clientX;
        cursor.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
        cursor.x = null;
        cursor.y = null;
    });

    for (let i = 0; i < totalNodes; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            mx: (Math.random() - 0.5) * 0.3,
            my: (Math.random() - 0.5) * 0.3
        });
    }

    if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        function runLoop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            
            nodes.forEach(node => {
                node.x += node.mx;
                node.y += node.my;

                if (node.x < 0 || node.x > canvas.width) node.mx *= -1;
                if (node.y < 0 || node.y > canvas.height) node.my *= -1;

                ctx.beginPath();
                ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
                ctx.fill();

                if (cursor.x !== null) {
                    let distanceX = node.x - cursor.x;
                    let distanceY = node.y - cursor.y;
                    let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
                    
                    if (distance < cursor.reach) {
                        ctx.strokeStyle = `rgba(0, 0, 0, ${(1 - distance / cursor.reach) * 0.05})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(cursor.x, cursor.y);
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(runLoop);
        }
        runLoop();
    }
}

/**
 * Home Hub Core Manifest Data Fetch Layer
 */
async function initHomeHubView() {
    const toolsStack = document.getElementById('live-tools-stack');
    const articlesStack = document.getElementById('live-articles-stack');
    const sandboxStack = document.getElementById('dynamic-sandbox-target');

    try {
        const response = await fetch('manifest.json');
        const data = await response.json();

        const targetedTools = data.filter(item => item.type === 'tool').slice(0, 3);
        const targetedArticles = data.filter(item => item.type === 'article').slice(0, 3);

        if (toolsStack) toolsStack.innerHTML = targetedTools.map(t => generateSystemCardMarkup(t)).join('');
        if (articlesStack) articlesStack.innerHTML = targetedArticles.map(a => generateSystemCardMarkup(a)).join('');

        const lessonResponse = await fetch('ai-lessons.json');
        const lessonData = await lessonResponse.json();
        
        if (sandboxStack && lessonData.length > 0) {
            const currentLesson = lessonData[Math.floor(Math.random() * lessonData.length)];
            sandboxStack.innerHTML = `
                <div class="card-title" style="font-size: var(--size-h3); margin-bottom: var(--space-8); font-weight:600;">${currentLesson.title}</div>
                <p class="card-desc" style="margin-bottom: var(--space-24); color: var(--text-body); max-width: 650px;">${currentLesson.description}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-16);">
                    <div class="card-tags">
                        ${currentLesson.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                    </div>
                    <a href="${currentLesson.path}" class="btn btn-secondary" style="min-height: 40px;">Launch Lab Fragment</a>
                </div>
            `;
        }
    } catch (error) {
        console.error("Home Data Pipeline Disruption:", error);
    }
}

/**
 * Unified Inventory Multi-Tab Matrix Filter Pipeline
 */
async function initPortfolioView() {
    const gridContainer = document.getElementById('master-portfolio-grid');
    const tabButtons = document.querySelectorAll('.tab-btn');
    let dynamicCache = [];

    try {
        const response = await fetch('manifest.json');
        dynamicCache = await response.json();
        
        executeRender(dynamicCache);

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                tabButtons.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                
                e.target.classList.add('active');
                e.target.setAttribute('aria-selected', 'true');
                
                const currentFilter = e.target.getAttribute('data-filter');
                if (currentFilter === 'all') {
                    executeRender(dynamicCache);
                } else {
                    const filteredData = dynamicCache.filter(item => item.type === currentFilter);
                    executeRender(filteredData);
                }
            });
        });
    } catch (error) {
        console.error("Portfolio Data Registry Failure:", error);
    }

    function executeRender(dataset) {
        if (!gridContainer) return;
        if (dataset.length === 0) {
            gridContainer.innerHTML = `<p style="color: var(--text-muted); font-size: var(--size-small);">No infrastructure components recorded in this segment.</p>`;
            return;
        }
        gridContainer.innerHTML = dataset.map(item => generateSystemCardMarkup(item)).join('');
    }
}

function generateSystemCardMarkup(item) {
    return `
        <a href="${item.path}" class="asset-card" data-id="${item.id}">
            <div class="card-title">${item.title}</div>
            <p class="card-desc">${item.description}</p>
            <div class="card-tags">
                ${item.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
        </a>
    `;
}
