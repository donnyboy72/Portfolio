/* Toy neuroevolution: angular sensors -> tanh hidden layer -> steering.
   Fitness is food eaten. Elite retention + tournament selection + Gaussian mutation. */
(() => {
    'use strict';
    const canvas = document.getElementById('evolution-canvas');
    const ctx = canvas.getContext('2d');
    const toggle = document.getElementById('evolution-toggle');
    const status = document.getElementById('evolution-status');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const fields = ['animal', 'food', 'neuron', 'receptor'];
    const inputs = fields.map(name => document.getElementById(`${name}-count`));
    let W = innerWidth, H = innerHeight;
    const duration = 20, step = 1 / 30;
    let config, birds, food, generation, elapsed, eaten, best, accumulator = 0, last = 0;
    let paused = motion.matches, visible = true, frameId = null, lastPaint = 0;
    const metricNodes = ["generation", "food-eaten", "best-fitness"].map(id => document.getElementById(id));
    const randomWeight = () => Math.random() * 2 - 1;
    const position = () => ({ x: Math.random() * W, y: Math.random() * H });
    const weightCount = () => (config.receptor + 1) * config.neuron + config.neuron + 1;
    const spawn = weights => ({ ...position(), angle: Math.random() * Math.PI * 2, fitness: 0,
        weights: weights || Array.from({ length: weightCount() }, randomWeight) });
    function metrics() {
        [generation, eaten, best].forEach((value, i) => {
            if (metricNodes[i].textContent !== String(value)) metricNodes[i].textContent = value;
        });
    }
    function state(message) {
        toggle.textContent = paused ? 'Resume' : 'Pause';
        status.textContent = message || (paused ? 'Simulation paused.' : 'Simulation running.');
    }
    function reset() {
        config = Object.fromEntries(fields.map((name, i) => [name, Number(inputs[i].value)]));
        birds = Array.from({ length: config.animal }, () => spawn());
        food = Array.from({ length: config.food }, position);
        generation = 1; elapsed = 0; eaten = 0; best = 0; accumulator = 0; last = 0;
        metrics(); draw(); state(`Fresh population. ${paused ? 'Paused.' : 'Running.'}`);
    }
    function evolve() {
        birds.sort((a, b) => b.fitness - a.fitness);
        const elite = birds[0].weights.slice();
        const select = () => {
            const candidates = Array.from({ length: 3 }, () => birds[Math.floor(Math.random() * birds.length)]);
            return candidates.sort((a, b) => b.fitness - a.fitness)[0];
        };
        const genomes = Array.from({ length: config.animal - 1 }, () => select().weights.map(w => {
            if (Math.random() > .15) return w;
            const noise = Math.sqrt(-2 * Math.log(Math.max(Math.random(), 1e-10))) * Math.cos(2 * Math.PI * Math.random());
            return Math.max(-5, Math.min(5, w + noise * .25));
        }));
        birds = [spawn(elite), ...genomes.map(spawn)];
        food = Array.from({ length: config.food }, position);
        generation++; elapsed = 0; eaten = 0;
    }
    function update() {
        for (const bird of birds) {
            const sensors = Array(config.receptor).fill(0);
            for (const item of food) {
                let dx = item.x - bird.x, dy = item.y - bird.y;
                dx -= Math.round(dx / W) * W; dy -= Math.round(dy / H) * H;
                const distance = Math.hypot(dx, dy);
                if (distance < 10) { bird.fitness++; eaten++; best = Math.max(best, bird.fitness); Object.assign(item, position()); continue; }
                if (distance > 180) continue;
                const angle = Math.atan2(Math.sin(Math.atan2(dy, dx) - bird.angle), Math.cos(Math.atan2(dy, dx) - bird.angle));
                if (Math.abs(angle) > Math.PI / 2) continue;
                const bin = Math.min(config.receptor - 1, Math.floor((angle + Math.PI / 2) / Math.PI * config.receptor));
                sensors[bin] = Math.max(sensors[bin], 1 - distance / 180);
            }
            let wi = 0;
            const hidden = Array.from({ length: config.neuron }, () => {
                let sum = bird.weights[wi++];
                for (const sensor of sensors) sum += sensor * bird.weights[wi++];
                return Math.tanh(sum);
            });
            let output = bird.weights[wi++];
            for (const neuron of hidden) output += neuron * bird.weights[wi++];
            bird.angle += Math.tanh(output) * 3 * step;
            bird.x = (bird.x + Math.cos(bird.angle) * 65 * step + W) % W;
            bird.y = (bird.y + Math.sin(bird.angle) * 65 * step + H) % H;
        }
        elapsed += step;
        if (elapsed >= duration) evolve();
    }
    function draw() {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(127,245,233,.65)';
        for (const item of food) { ctx.fillRect(item.x - 1.5, item.y - 1.5, 3, 3); }
        for (const bird of birds) {
            ctx.save(); ctx.translate(bird.x, bird.y); ctx.rotate(bird.angle);
            ctx.fillStyle = '#7ff5e9'; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-5, -4); ctx.lineTo(-2, 0); ctx.lineTo(-5, 4); ctx.closePath(); ctx.fill(); ctx.restore();
        }
    }
    function schedule() {
        if (!paused && visible && !document.hidden && frameId === null) frameId = requestAnimationFrame(frame);
    }
    function frame(now) {
        frameId = null;
        if (!paused && visible && !document.hidden) {
            accumulator += Math.min((now - (last || now)) / 1000, .1);
            while (accumulator >= step) { update(); accumulator -= step; }
            if (now - lastPaint >= 1000 / 30) { draw(); metrics(); lastPaint = now; }
        }
        last = now;
        schedule();
    }
    inputs.forEach((input, i) => input.addEventListener('input', () => {
        document.getElementById(`${fields[i]}-value`).value = input.value;
        reset();
    }));
    document.getElementById('evolution-controls').addEventListener('submit', event => event.preventDefault());
    toggle.addEventListener('click', () => { paused = !paused; last = 0; accumulator = 0; state(); schedule(); });
    document.getElementById('evolution-reset').addEventListener('click', reset);
    motion.addEventListener('change', event => { if (event.matches) { paused = true; state(); } });
    const drawer = document.getElementById('flight-drawer');
    const drawerToggle = document.getElementById('flight-drawer-toggle');
    const panel = document.getElementById('flight-panel');
    function setDrawer(open) {
        drawer.classList.toggle('is-open', open);
        panel.inert = !open;
        drawerToggle.setAttribute('aria-expanded', String(open));
        drawerToggle.setAttribute('aria-label', `${open ? 'Close' : 'Open'} background simulation controls`);
        drawerToggle.querySelector('span').textContent = open ? '‹' : '›';
    }
    drawerToggle.addEventListener('click', () => setDrawer(drawerToggle.getAttribute('aria-expanded') !== 'true'));
    drawer.addEventListener('keydown', event => {
        if (event.key === 'Escape') { setDrawer(false); drawerToggle.focus(); }
    });
    function resize() {
        const oldW = W, oldH = H;
        W = innerWidth; H = innerHeight;
        const ratio = Math.min(devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(W * ratio); canvas.height = Math.round(H * ratio);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        if (birds) for (const bird of birds) { bird.x *= W / oldW; bird.y *= H / oldH; }
        if (food) for (const item of food) { item.x *= W / oldW; item.y *= H / oldH; }
        if (birds) draw();
    }
    let resizeTimer;
    addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 120); });
    resize();
    document.addEventListener("visibilitychange", () => { last = 0; schedule(); });
    reset(); schedule();
})();
