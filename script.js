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
    const opacity = 0.1 + Math.random() * 0.9;          // range: 0.1 → 1.0
    const speed = 0.5 + ((opacity - 0.1) / 0.9) * 2; // range: 0.5 → 2.5 (proportional to opacity)
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        speed,
        size: 10 + Math.random() * 8,
        char: chars[Math.floor(Math.random() * chars.length)],
        opacity
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

(function () {
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
            let readerScrolled = false;

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

            const markReaderScrolled = () => {
                readerScrolled = true;
                recordViewAfterFullRead();
            };

            const markReaderScrolledFromControl = (event) => {
                if (event.target.closest('.blog-scrollbar, .blog-auto-scroll')) {
                    markReaderScrolled();
                }
            };

            const recordViewAfterFullRead = () => {
                if (countRecorded || !readerScrolled || !hasReachedBottom()) return;

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
                window.removeEventListener('wheel', markReaderScrolled);
                window.removeEventListener('touchmove', markReaderScrolled);
                window.removeEventListener('keydown', markReaderScrolled);
                document.removeEventListener('pointerdown', markReaderScrolledFromControl);
            };

            window.addEventListener('scroll', recordViewAfterFullRead, { passive: true });
            window.addEventListener('resize', recordViewAfterFullRead);
            window.addEventListener('wheel', markReaderScrolled, { passive: true });
            window.addEventListener('touchmove', markReaderScrolled, { passive: true });
            window.addEventListener('keydown', markReaderScrolled);
            document.addEventListener('pointerdown', markReaderScrolledFromControl);
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

(function () {
    const initBlogScrollbar = () => {
        const isBlogPost = /\/blogs\/[^/]+\.html$/.test(window.location.pathname);
        const article = document.querySelector('.blog-article');
        if (!isBlogPost || !article) return;

        document.body.classList.add('blog-read-page');

        const scrollbar = document.createElement('aside');
        scrollbar.className = 'blog-scrollbar';
        scrollbar.setAttribute('aria-label', 'Blog scroll controls');

        const upButton = document.createElement('button');
        upButton.className = 'blog-scrollbar-button';
        upButton.type = 'button';
        upButton.setAttribute('aria-label', 'Scroll up');
        upButton.textContent = '↑';

        const track = document.createElement('div');
        track.className = 'blog-scrollbar-track';

        const thumb = document.createElement('button');
        thumb.className = 'blog-scrollbar-thumb';
        thumb.type = 'button';
        thumb.setAttribute('aria-label', 'Drag to scroll blog');

        const downButton = document.createElement('button');
        downButton.className = 'blog-scrollbar-button';
        downButton.type = 'button';
        downButton.setAttribute('aria-label', 'Scroll down');
        downButton.textContent = '↓';

        const autoControls = document.createElement('aside');
        autoControls.className = 'blog-auto-scroll';
        autoControls.setAttribute('aria-label', 'Blog auto scroll controls');

        const fasterButton = document.createElement('button');
        fasterButton.className = 'blog-auto-button';
        fasterButton.type = 'button';
        fasterButton.setAttribute('aria-label', 'Increase auto scroll speed');
        fasterButton.textContent = '+';

        const autoButton = document.createElement('button');
        autoButton.className = 'blog-auto-button blog-auto-toggle';
        autoButton.type = 'button';
        autoButton.setAttribute('aria-label', 'Start auto scroll');
        autoButton.setAttribute('aria-pressed', 'false');
        autoButton.textContent = 'AUTO';

        const slowerButton = document.createElement('button');
        slowerButton.className = 'blog-auto-button';
        slowerButton.type = 'button';
        slowerButton.setAttribute('aria-label', 'Decrease auto scroll speed');
        slowerButton.textContent = '-';

        const scrollTopButton = document.createElement('button');
        scrollTopButton.className = 'blog-scroll-top-button';
        scrollTopButton.type = 'button';
        scrollTopButton.setAttribute('aria-label', 'Scroll to top');
        scrollTopButton.textContent = '↑';

        track.appendChild(thumb);
        scrollbar.append(upButton, track, downButton);
        autoControls.append(fasterButton, autoButton, slowerButton);
        document.body.appendChild(scrollbar);
        document.body.appendChild(autoControls);
        document.body.appendChild(scrollTopButton);

        let thumbHeight = 44;
        let animationFrame = null;
        let holdDelay = null;
        let holdFrame = null;
        let autoScrollFrame = null;
        const autoScrollSpeeds = [0.05, 0.08, 0.12, 0.18, 0.27, 0.4, 0.58, 0.82, 1.1];
        let autoScrollSpeedIndex = 0;
        let autoScrollSpeed = autoScrollSpeeds[autoScrollSpeedIndex];
        let autoLastTime = null;
        let autoScrollPosition = 0;

        const getMaxScroll = () => Math.max(
            document.documentElement.scrollHeight - window.innerHeight,
            0
        );

        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

        const positionScrollbar = () => {
            const articleRect = article.getBoundingClientRect();
            const scrollbarWidth = scrollbar.offsetWidth || 42;
            const autoWidth = autoControls.offsetWidth || 50;
            const gap = 22;
            const minRight = 12;
            const desiredRight = window.innerWidth - articleRect.right - gap - scrollbarWidth;
            const right = clamp(desiredRight, minRight, Math.max(minRight, window.innerWidth - scrollbarWidth - minRight));
            const desiredLeft = articleRect.left - gap - autoWidth;
            const left = clamp(desiredLeft, minRight, Math.max(minRight, window.innerWidth - autoWidth - minRight));

            document.documentElement.style.setProperty('--blog-scrollbar-right', `${right}px`);
            document.documentElement.style.setProperty('--blog-auto-scroll-left', `${left}px`);
        };

        const updateThumb = () => {
            const maxScroll = getMaxScroll();
            const trackHeight = track.clientHeight;

            if (!maxScroll || !trackHeight) {
                scrollbar.classList.add('is-disabled');
                thumb.style.height = '100%';
                thumb.style.transform = 'translate(-50%, 0)';
                return;
            }

            scrollbar.classList.remove('is-disabled');
            thumbHeight = clamp((window.innerHeight / document.documentElement.scrollHeight) * trackHeight, 44, trackHeight);

            const progress = window.scrollY / maxScroll;
            const thumbTop = progress * (trackHeight - thumbHeight);

            thumb.style.height = `${thumbHeight}px`;
            thumb.style.transform = `translate(-50%, ${thumbTop}px)`;
        };

        const smoothScrollTo = (target) => {
            if (animationFrame) cancelAnimationFrame(animationFrame);

            const start = window.scrollY;
            const maxScroll = getMaxScroll();
            const end = clamp(target, 0, maxScroll);
            const distance = end - start;

            if (Math.abs(distance) < 1) return;

            const duration = clamp(Math.abs(distance) * 0.45, 380, 780);
            const startTime = performance.now();

            const animateScroll = (now) => {
                const elapsed = now - startTime;
                const progress = clamp(elapsed / duration, 0, 1);
                const eased = 1 - Math.pow(1 - progress, 3);

                window.scrollTo(0, start + distance * eased);

                if (progress < 1) {
                    animationFrame = requestAnimationFrame(animateScroll);
                } else {
                    animationFrame = null;
                }
            };

            animationFrame = requestAnimationFrame(animateScroll);
        };

        const scrollByPage = (direction) => {
            smoothScrollTo(window.scrollY + direction * window.innerHeight * 0.72);
        };

        const smoothScrollTop = () => {
            stopAutoScroll();
            stopButtonHold();
            if (animationFrame) cancelAnimationFrame(animationFrame);

            const start = window.scrollY;
            if (start < 1) return;

            const duration = clamp(start * 0.16, 260, 620);
            const startTime = performance.now();

            const animateTopScroll = (now) => {
                const elapsed = now - startTime;
                const progress = clamp(elapsed / duration, 0, 1);
                const eased = 1 - Math.pow(1 - progress, 4);

                window.scrollTo(0, start * (1 - eased));

                if (progress < 1) {
                    animationFrame = requestAnimationFrame(animateTopScroll);
                } else {
                    window.scrollTo(0, 0);
                    animationFrame = null;
                }
            };

            animationFrame = requestAnimationFrame(animateTopScroll);
        };

        const updateScrollTopButton = () => {
            scrollTopButton.classList.toggle('is-visible', window.scrollY > 280);
        };

        const updateAutoSpeedState = () => {
            slowerButton.disabled = autoScrollSpeedIndex === 0;
            fasterButton.disabled = autoScrollSpeedIndex === autoScrollSpeeds.length - 1;
            autoControls.style.setProperty('--auto-scroll-level', `${(autoScrollSpeedIndex / (autoScrollSpeeds.length - 1)) * 100}%`);
            autoButton.setAttribute('aria-label', `Auto scroll ${autoScrollFrame ? 'on' : 'off'}, speed level ${autoScrollSpeedIndex + 1}`);
        };

        const stopAutoScroll = () => {
            if (autoScrollFrame) {
                cancelAnimationFrame(autoScrollFrame);
                autoScrollFrame = null;
            }

            autoLastTime = null;
            document.documentElement.classList.remove('blog-auto-scrolling');
            autoControls.classList.remove('is-active');
            autoButton.setAttribute('aria-pressed', 'false');
            autoButton.setAttribute('aria-label', 'Start auto scroll');
        };

        const runAutoScroll = (now) => {
            const maxScroll = getMaxScroll();
            if (window.scrollY >= maxScroll - 1) {
                stopAutoScroll();
                return;
            }

            if (autoLastTime === null) autoLastTime = now;
            const elapsed = Math.min(now - autoLastTime, 24);
            autoLastTime = now;
            autoScrollPosition = clamp(autoScrollPosition + autoScrollSpeed * elapsed, 0, maxScroll);

            window.scrollTo(0, autoScrollPosition);
            autoScrollFrame = requestAnimationFrame(runAutoScroll);
        };

        const startAutoScroll = () => {
            if (autoScrollFrame) return;
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }

            autoControls.classList.add('is-active');
            document.documentElement.classList.add('blog-auto-scrolling');
            autoButton.setAttribute('aria-pressed', 'true');
            autoButton.setAttribute('aria-label', 'Stop auto scroll');
            autoLastTime = null;
            autoScrollPosition = window.scrollY;
            window.scrollTo(0, autoScrollPosition + autoScrollSpeed * 10);
            autoScrollPosition = window.scrollY;
            autoScrollFrame = requestAnimationFrame(runAutoScroll);
        };

        const toggleAutoScroll = (event) => {
            event.preventDefault();

            if (autoScrollFrame) {
                stopAutoScroll();
            } else {
                startAutoScroll();
            }
        };

        const changeAutoScrollSpeed = (direction, event) => {
            event.preventDefault();
            autoScrollSpeedIndex = clamp(autoScrollSpeedIndex + direction, 0, autoScrollSpeeds.length - 1);
            autoScrollSpeed = autoScrollSpeeds[autoScrollSpeedIndex];
            autoScrollPosition = window.scrollY;
            autoLastTime = null;
            updateAutoSpeedState();
        };

        const stopButtonHold = () => {
            if (holdDelay) {
                clearTimeout(holdDelay);
                holdDelay = null;
            }

            if (holdFrame) {
                cancelAnimationFrame(holdFrame);
                holdFrame = null;
            }
        };

        const startButtonHold = (button, direction, event) => {
            event.preventDefault();
            button.setPointerCapture(event.pointerId);
            stopAutoScroll();
            stopButtonHold();
            scrollByPage(direction);

            const continuousScroll = () => {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                }

                window.scrollBy(0, direction * 7);
                holdFrame = requestAnimationFrame(continuousScroll);
            };

            holdDelay = setTimeout(() => {
                holdDelay = null;
                continuousScroll();
            }, 240);

            const stop = () => {
                stopButtonHold();
                if (button.hasPointerCapture(event.pointerId)) {
                    button.releasePointerCapture(event.pointerId);
                }
                button.removeEventListener('pointerup', stop);
                button.removeEventListener('pointercancel', stop);
                button.removeEventListener('lostpointercapture', stop);
            };

            button.addEventListener('pointerup', stop);
            button.addEventListener('pointercancel', stop);
            button.addEventListener('lostpointercapture', stop);
        };

        upButton.addEventListener('pointerdown', (event) => startButtonHold(upButton, -1, event));
        downButton.addEventListener('pointerdown', (event) => startButtonHold(downButton, 1, event));
        autoButton.addEventListener('pointerdown', toggleAutoScroll);
        slowerButton.addEventListener('pointerdown', (event) => changeAutoScrollSpeed(-1, event));
        fasterButton.addEventListener('pointerdown', (event) => changeAutoScrollSpeed(1, event));
        scrollTopButton.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            smoothScrollTop();
        });

        track.addEventListener('pointerdown', (event) => {
            if (event.target === thumb) return;
            event.preventDefault();
            stopAutoScroll();

            const maxScroll = getMaxScroll();
            const rect = track.getBoundingClientRect();
            const clickY = event.clientY - rect.top - thumbHeight / 2;
            const progress = clamp(clickY / Math.max(rect.height - thumbHeight, 1), 0, 1);

            smoothScrollTo(maxScroll * progress);
        });

        thumb.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            thumb.setPointerCapture(event.pointerId);
            scrollbar.classList.add('is-dragging');
            stopAutoScroll();

            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }

            const maxScroll = getMaxScroll();
            const trackRect = track.getBoundingClientRect();
            const startY = event.clientY;
            const startScroll = window.scrollY;
            const scrollPerPixel = maxScroll / Math.max(trackRect.height - thumbHeight, 1);

            const onPointerMove = (moveEvent) => {
                const deltaY = moveEvent.clientY - startY;
                window.scrollTo(0, clamp(startScroll + deltaY * scrollPerPixel, 0, maxScroll));
            };

            const onPointerUp = () => {
                scrollbar.classList.remove('is-dragging');
                thumb.releasePointerCapture(event.pointerId);
                thumb.removeEventListener('pointermove', onPointerMove);
                thumb.removeEventListener('pointerup', onPointerUp);
                thumb.removeEventListener('pointercancel', onPointerUp);
            };

            thumb.addEventListener('pointermove', onPointerMove);
            thumb.addEventListener('pointerup', onPointerUp);
            thumb.addEventListener('pointercancel', onPointerUp);
        });

        window.addEventListener('scroll', () => {
            updateThumb();
            updateScrollTopButton();
        }, { passive: true });
        window.addEventListener('resize', () => {
            positionScrollbar();
            updateThumb();
        });

        positionScrollbar();
        updateThumb();
        updateScrollTopButton();
        updateAutoSpeedState();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBlogScrollbar);
    } else {
        initBlogScrollbar();
    }
})();
