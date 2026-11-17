const menuButton = document.getElementById("menu-icon");
const navLinks = document.getElementById("nav-links");
const navItems = document.querySelectorAll(".nav-links a");
const header = document.querySelector(".header");
const contactButton = document.getElementById("contact-btn");
const contactPopup = document.getElementById("contact-popup");

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

// Hash routes keep each view shareable and preserve browser history.
const views = [...document.querySelectorAll('[data-view]')];
const routeMap = { work: 'work', intro: 'work', projects: 'work', experience: 'experience-view', 'experience-view': 'experience-view', education: 'experience-view', certificates: 'experience-view', 'open-source': 'experience-view', about: 'about', 'who-am-i': 'about', 'ai-lab': 'ai-lab' };
let currentView;
function navigate() {
    const hash = decodeURIComponent(location.hash.slice(1));
    const target = routeMap[hash] || 'work';
    const changed = currentView !== target;
    views.forEach(view => { view.hidden = view.id !== target; });
    document.body.classList.toggle('lab-active', target === 'ai-lab');
    navItems.forEach(link => {
        const active = routeMap[link.hash.slice(1)] === target;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
    if (changed) {
        const view = document.getElementById(target);
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) view.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 260, easing: 'ease-out' });
        window.scrollTo({ top: 0, behavior: 'instant' });
        const heading = view.querySelector('h1, h2');
        if (currentView && heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    }
    currentView = target;
    document.title = `Donavan Watley | ${target === 'experience-view' ? 'Experience' : target === 'ai-lab' ? 'AI Lab' : target === 'about' ? 'About' : 'Software Engineering'}`;
    document.dispatchEvent(new CustomEvent('portfolio:view', { detail: { lab: target === 'ai-lab' } }));
    if (hash && !['work', 'about', 'experience', 'experience-view', 'ai-lab'].includes(hash)) requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'instant' }));
}
window.addEventListener('hashchange', navigate);
navigate();
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        navLinks.classList.remove('active');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
        menuButton.querySelector('i').className = 'fa-solid fa-bars';
        contactPopup.classList.remove('active');
        contactButton.setAttribute('aria-expanded', 'false');
        contactPopup.setAttribute('aria-hidden', 'true');
    }
});
window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 24), { passive: true });
