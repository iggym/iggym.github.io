const Portfolio = {
    async init() {
        const [manifest, lessons] = await Promise.all([
            fetch('manifest.json').then(r => r.json()),
            fetch('ai-lessons.json').then(r => r.json())
        ]);
        this.renderModules(manifest);
        this.renderLesson(lessons);
    },
    
    renderModules(data) {
        const tools = data.filter(i => i.type === 'tool').slice(0, 3);
        const articles = data.filter(i => i.type === 'article').slice(0, 3);
        // DOM injection logic here...
    },
    
    renderLesson(lessons) {
        const random = lessons[Math.floor(Math.random() * lessons.length)];
        document.getElementById('lesson-card').innerHTML = `<h3>${random.title}</h3><p>${random.description}</p>`;
    }
};

document.addEventListener('DOMContentLoaded', () => Portfolio.init());
