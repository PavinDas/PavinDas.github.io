//? Particle Background
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null };
const chars = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽゃゅょぁぃぅぇぉっャュョァィゥェォッヴファフィフェフォティディトゥドゥチェシェジェ02ガギグゲゴザジズゼゾ03ダヂヅデドバビブベボ04パピプペポ';

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createParticle() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        speed: 0.5 + Math.random() * 2,
        size: 10 + Math.random() * 8,
        char: chars[Math.floor(Math.random() * chars.length)],
        opacity: 0.1 + Math.random() * 0.8
    };
}

function init() {
    resize();
    particles = [];
    const count = Math.floor((canvas.width * canvas.height) / 15000);
    for (let i = 0; i < count; i++) {
        const p = createParticle();
        p.y = Math.random() * canvas.height;
        particles.push(p);
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        //? Mouse interaction
        if (mouse.x && mouse.y) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                p.x -= dx * 0.05;
                p.y -= dy * 0.05;
            }
        }

        p.y += p.speed;

        if (p.y > canvas.height) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
            p.char = chars[Math.floor(Math.random() * chars.length)];
        }

        ctx.font = `${p.size}px "JetBrains Mono", monospace`;
        ctx.fillStyle = `rgba(0, 255, 136, ${p.opacity})`;
        ctx.fillText(p.char, p.x, p.y);
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', init);
window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

init();
animate();

//? Typing Animation
const typedEl = document.getElementById('typedText');
const fullText = 'Security Engineer';
let charIndex = 0;

function typeText() {
    if (!typedEl) return;

    if (charIndex < fullText.length) {
        typedEl.textContent = fullText.substring(0, charIndex + 1);
        charIndex++;
        setTimeout(typeText, 100);
    }
}
typeText();

//? Mobile Nav Toggle
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-link');

if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('open');
        nav.classList.toggle('open');
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle?.classList.remove('open');
        nav?.classList.remove('open');
    });
});

//? Active Nav on Scroll
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
    const scrollY = window.scrollY + 150;

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-link[href="#${id}"]`);

        if (link) {
            if (scrollY >= top && scrollY < top + height) {
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

//? Skill Bar Animation
const skillBars = document.querySelectorAll('.skill-bar-fill');
let skillsAnimated = false;

function animateSkills() {
    const skillsSection = document.getElementById('skills');
    if (!skillsSection) return;

    const rect = skillsSection.getBoundingClientRect();

    if (rect.top < window.innerHeight * 0.7 && !skillsAnimated) {
        skillsAnimated = true;
        skillBars.forEach((bar, i) => {
            setTimeout(() => {
                bar.style.width = bar.dataset.width + '%';
            }, i * 100);
        });
    }
}

window.addEventListener('scroll', animateSkills);

// Footer Year
const yearEl = document.getElementById('year');
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

// Contact Form
const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (form && formStatus) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        formStatus.textContent = 'Sending...';

        const endpoint = 'https://script.google.com/macros/s/AKfycbyGa1nqAkSnZd9fAsNSS0zKtlz9poTIgHftJsgr0kwb2eakwm7kY8khU0hiEEQp_s83/exec';
        const formData = new FormData(form);

        try {
            const res = await fetch(endpoint, { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Network error');
            formStatus.textContent = 'Form submitted successfully!';
            formStatus.style.color = '#00ff88';
            form.reset();
        } catch (err) {
            formStatus.textContent = 'Something went wrong. Please try again.';
            formStatus.style.color = '#ff4444';
        }
    });
}

// Fade-in animation on scroll
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-fade-in-up').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
});

(function() {
    const initBlogCounters = () => {
        const BLOG_NAMESPACE = 'pavindas.github.io';
        const API_BASE = 'https://abacus.jasoncameron.dev';
        const FETCH_OPTS = { method: 'GET', mode: 'cors', cache: 'no-store' };

        const formatCount = (num) => {
            const count = Number(num) || 0;
            if (count >= 1_000_000) return (count / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
            if (count >= 1_000) return (count / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
            return String(count);
        };

        const fetchJSON = (url) => fetch(url, FETCH_OPTS).then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        });

        const getCount = (blogId) => {
            return fetchJSON(`${API_BASE}/get/${BLOG_NAMESPACE}/${blogId}`)
                .then(data => Number(data.value) || 0);
        };

        const hitCount = (blogId) => {
            return fetchJSON(`${API_BASE}/hit/${BLOG_NAMESPACE}/${blogId}`)
                .then(data => Number(data.value) || 1);
        };

        const setCount = (element, value) => {
            if (element) element.textContent = formatCount(value);
        };

        const updateBlogCards = () => {
            document.querySelectorAll('.blog-card[data-blog]').forEach(card => {
                const blogId = card.dataset.blog;
                const countEl = card.querySelector('.view-count');
                if (!blogId || !countEl) return;

                getCount(blogId)
                    .then(count => setCount(countEl, count))
                    .catch(error => {
                        console.error(`Error fetching view count for ${blogId}:`, error);
                        setCount(countEl, 0);
                    });
            });
        };

        const initArticleCounter = () => {
            const blogMatch = window.location.pathname.match(/\/blogs\/([^/]+)\.html$/);
            if (!blogMatch) return;

            const blogId = blogMatch[1];
            const countEl = document.getElementById('blog-page-views');
            const countedKey = `blog_view_counted_${blogId}`;
            let countRecorded = sessionStorage.getItem(countedKey) === 'true';

            getCount(blogId)
                .then(count => setCount(countEl, count))
                .catch(error => {
                    console.error(`Error fetching view count for ${blogId}:`, error);
                    setCount(countEl, 0);
                });

            if (countRecorded) return;

            const hasReachedBottom = () => {
                const scrollPosition = window.scrollY + window.innerHeight;
                const pageHeight = Math.max(
                    document.body.scrollHeight,
                    document.documentElement.scrollHeight
                );

                return scrollPosition >= pageHeight - 80;
            };

            const recordViewAfterFullRead = () => {
                if (countRecorded || !hasReachedBottom()) return;

                countRecorded = true;
                sessionStorage.setItem(countedKey, 'true');

                hitCount(blogId)
                    .then(count => setCount(countEl, count))
                    .catch(error => {
                        countRecorded = false;
                        sessionStorage.removeItem(countedKey);
                        console.error(`Error recording view for ${blogId}:`, error);
                    });

                window.removeEventListener('scroll', recordViewAfterFullRead);
                window.removeEventListener('resize', recordViewAfterFullRead);
            };

            window.addEventListener('scroll', recordViewAfterFullRead, { passive: true });
            window.addEventListener('resize', recordViewAfterFullRead);
            recordViewAfterFullRead();
        };

        updateBlogCards();
        initArticleCounter();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBlogCounters);
    } else {
        initBlogCounters();
    }
})();
