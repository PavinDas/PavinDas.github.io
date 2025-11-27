// Mobile nav toggle
const navToggle = document.getElementById("nav-toggle");
const nav = document.getElementById("nav");
const navLinks = document.querySelectorAll(".nav-link");

if (navToggle) {
    navToggle.addEventListener("click", () => {
        navToggle.classList.toggle("open");
        nav.classList.toggle("open");
    });
}

// Close nav on link click (mobile)
navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        navToggle.classList.remove("open");
        nav.classList.remove("open");
    });
});

// Highlight active nav on scroll
const sections = document.querySelectorAll("section[id]");
const setActiveNav = () => {
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const offsetTop = rect.top + window.scrollY - 140;
        const height = section.offsetHeight;
        const id = section.getAttribute("id");

        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (!link) return;

        if (scrollY >= offsetTop && scrollY < offsetTop + height) {
            navLinks.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
        }
    });
};

window.addEventListener("scroll", setActiveNav);
window.addEventListener("load", setActiveNav);

// Set current year in footer
const yearSpan = document.getElementById("year");
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}

const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!statusEl) return;

        statusEl.textContent = "Sending...";

        const endpoint =
            "https://script.google.com/macros/s/AKfycbyGa1nqAkSnZd9fAsNSS0zKtlz9poTIgHftJsgr0kwb2eakwm7kY8khU0hiEEQp_s83/exec";

        const formData = new FormData(form);

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Network error");

            statusEl.textContent = "Form submitted successfully!";
            form.reset();
        } catch (err) {
            statusEl.textContent = "Something went wrong. Please try again.";
            console.error(err);
        }
    });
}
