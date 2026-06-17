/**
 * Core Application Engine for AI Systems Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize global canvas orchestration
    initNeuralBackground();

    // Determine target ecosystem execution path
    const path = window.location.pathname;
    if (path.includes('portfolio.html')) {
        initPortfolioView();
    } else {
        initHomeHubView();
    }
});

/**
 * Visual Signature: Reactive Neural Field (Mouse Tracker/Scroll Matrix)
 */
function initNeuralBackground() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let points = [];
    const maxPoints = 45;
    let mouse = { x: null, y: null, radius: 160 };

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Track mouse locations securely
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Populate matrix coordinate systems
    for (let i = 0; i < maxPoints; i++) {
        points.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 2 + 1
        });
    }

    if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(0, 242, 254, 0.4)';
            
            // Render and process nodes
            points.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();

                // Mouse spatial interaction loop
                if (mouse.x !== null) {
                    let dx = p.x - mouse.x;
                    let dy = p.y - mouse.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        ctx.strokeStyle = `rgba(0, 255, 102, ${1 - dist / mouse.radius})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(animate);
        }
        animate();
    }
}

/**
 * Async Module Pipeline: Home Hub Rendering
 */
async function initHomeHubView() {
    const toolsContainer = document.getElementById('live-tools-stack');
    const articlesContainer = document.getElementById('live-articles-stack');
    const sandboxContainer = document.getElementById('dynamic-sandbox-target');

    try {
        const resManifest = await fetch('manifest.json');
        const manifestData = await resManifest.json();

        // Isolate client tools and architecture deep dives (top 3 chronological elements)
        const tools = manifestData.filter(item => item.type === 'tool').slice(0, 3);
        const articles = manifestData.filter(item => item.type === 'article').slice(0, 3);

        if (toolsContainer) toolsContainer.innerHTML = tools.map(t => generateCardMarkup(t)).join('');
        if (articlesContainer) articlesContainer.innerHTML = articles.map(a => generateCardMarkup(a)).join('');

        // Sandbox execution registry
        const resLessons = await fetch('ai-lessons.json');
        const lessonsData = await resLessons.json();
        if (sandboxContainer && lessonsData.length > 0) {
            const randomLesson = lessonsData[Math.floor(Math.random() * lessonsData.length)];
            sandboxContainer.innerHTML = `
                <div class="card-title">${randomLesson.title}</div>
                <p class="card-desc" style="margin-bottom: 1.5rem;">${randomLesson.description}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                    <div class="card-meta">
                        ${randomLesson.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <a href="${randomLesson.path}" class="btn btn-secondary" style="min-height:44px;">Launch Micro-Explorer</a>
                </div>
            `;
        }
    } catch (err) {
        console.error("System Manifest Pipeline Breakdown:", err);
    }
}

/**
 * Async Module Pipeline: Master Portfolio Filtering View
 */
async function initPortfolioView() {
    const gridTarget = document.getElementById('master-portfolio-grid');
    const tabs = document.querySelectorAll('.tab-btn');
    let masterData = [];

    try {
        const res = await fetch('manifest.json');
        masterData = await res.json();
        
        renderGrid(masterData);

        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                const filter = e.target.getAttribute('data-filter');
                if (filter === 'all') {
                    renderGrid(masterData);
                } else {
                    const filtered = masterData.filter(item => item.type === filter);
                    renderGrid(filtered);
                }
            });
        });
    } catch (err) {
        console.error("Master Asset Inventory Failure:", err);
    }

    function renderGrid(dataset) {
        if (!gridTarget) return;
        if (dataset.length === 0) {
            gridTarget.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted);">No assets matching the filter criteria found.</p>`;
            return;
        }
        gridTarget.innerHTML = dataset.map(item => generateCardMarkup(item)).join('');
    }
}

/**
 * Markup Synthesizer
 */
function generateCardMarkup(asset) {
    return `
        <a href="${asset.path}" class="asset-card" data-id="${asset.id}">
            <div class="card-title">${asset.title}</div>
            <p class="card-desc">${asset.description}</p>
            <div class="card-meta">
                ${asset.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </a>
    `;
}
