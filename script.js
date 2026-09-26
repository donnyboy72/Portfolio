const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
const menuButton = document.getElementById("menu-icon");
const navLinks = document.getElementById("nav-links");
const navItems = document.querySelectorAll(".nav-links a");
const header = document.querySelector(".header");
const contactButton = document.getElementById("contact-btn");
const contactPopup = document.getElementById("contact-popup");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.getElementById("current-year").textContent = new Date().getFullYear();

menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("active");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    menuButton.querySelector("i").className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
});

navItems.forEach((link) => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
        menuButton.querySelector("i").className = "fa-solid fa-bars";
    });
});

contactButton.addEventListener("click", () => {
    const isOpen = contactPopup.classList.toggle("active");
    contactButton.setAttribute("aria-expanded", String(isOpen));
    contactPopup.setAttribute("aria-hidden", String(!isOpen));
});

document.addEventListener("click", (event) => {
    if (!contactPopup.contains(event.target) && !contactButton.contains(event.target)) {
        contactPopup.classList.remove("active");
        contactButton.setAttribute("aria-expanded", "false");
        contactPopup.setAttribute("aria-hidden", "true");
    }
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 3, 2) * 80}ms`;
    revealObserver.observe(element);
});

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navItems.forEach((link) => {
            const target = link.getAttribute("href").slice(1);
            link.classList.toggle("active", target === entry.target.id);
        });
    });
}, { rootMargin: "-35% 0px -55%", threshold: 0 });

document.querySelectorAll("section[data-section]").forEach((section) => sectionObserver.observe(section));
window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 24), { passive: true });

let particles = [];
let animationFrame;
let lastCanvasHeight = 0;
const mouse = { x: -1000, y: -1000, radius: 115 };

class Signal {
    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * Math.max(document.documentElement.scrollHeight, window.innerHeight);
        this.radius = Math.random() * 1.5 + 0.55;
        this.vx = (Math.random() - 0.5) * 0.12;
        this.vy = (Math.random() - 0.5) * 0.12;
        this.alpha = Math.random() * 0.35 + 0.12;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
        if (this.y < 0 || this.y > lastCanvasHeight) this.vy *= -1;
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.hypot(dx, dy);
        if (distance < mouse.radius && distance > 0) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= (dx / distance) * force * 1.6;
            this.y -= (dy / distance) * force * 1.6;
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(127, 245, 233, ${this.alpha})`;
        ctx.fill();
    }
}

function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const pageHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    canvas.style.height = `${pageHeight}px`;
    canvas.width = Math.floor(window.innerWidth * pixelRatio);
    canvas.height = Math.floor(pageHeight * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    lastCanvasHeight = pageHeight;
    const count = Math.min(160, Math.max(55, Math.floor((window.innerWidth * pageHeight) / 65000)));
    particles = Array.from({ length: count }, () => new Signal());
}

function drawConnections() {
    const nearby = particles.slice(0, 75);
    for (let i = 0; i < nearby.length; i += 1) {
        for (let j = i + 1; j < nearby.length; j += 1) {
            const dx = nearby[i].x - nearby[j].x;
            const dy = nearby[i].y - nearby[j].y;
            const distance = Math.hypot(dx, dy);
            if (distance < 105) {
                ctx.beginPath();
                ctx.moveTo(nearby[i].x, nearby[i].y);
                ctx.lineTo(nearby[j].x, nearby[j].y);
                ctx.strokeStyle = `rgba(73, 214, 200, ${(1 - distance / 105) * 0.08})`;
                ctx.lineWidth = 0.55;
                ctx.stroke();
            }
        }
    }
}

function animateSignals() {
    const pageHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    if (Math.abs(pageHeight - lastCanvasHeight) > 4) resizeCanvas();
    ctx.clearRect(0, 0, window.innerWidth, pageHeight);
    particles.forEach((particle) => { particle.update(); particle.draw(); });
    drawConnections();
    animationFrame = requestAnimationFrame(animateSignals);
}

window.addEventListener("pointermove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY + window.scrollY;
}, { passive: true });
window.addEventListener("pointerleave", () => { mouse.x = -1000; mouse.y = -1000; });

let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 150);
});

function setAnimationPreference() {
    cancelAnimationFrame(animationFrame);
    resizeCanvas();
    if (!reduceMotion.matches) animateSignals();
    else {
        particles.forEach((particle) => particle.draw());
        document.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"));
    }
}

reduceMotion.addEventListener("change", setAnimationPreference);
window.addEventListener("load", setAnimationPreference);
