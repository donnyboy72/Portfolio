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
