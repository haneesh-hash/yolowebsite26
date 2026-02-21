/* 
  The YOLO Collective — Tesla-Inspired Interactions
  GSAP ScrollTrigger + 3D Tilt + Booking Overlay
*/

document.addEventListener('DOMContentLoaded', () => {
    if (window.YOLO_INITIALIZED) return;
    window.YOLO_INITIALIZED = true;

    // ═══════════════════════════════════════════
    // 0. CONSTANTS
    // ═══════════════════════════════════════════
    const HERO_PLAYBACK_RATE = 0.5;
    const SCROLL_THRESHOLD = 60;
    const MOBILE_BREAKPOINT = 768;
    const TABLET_BREAKPOINT = 900;
    const TILT_MAX_ROTATION = 8;
    const TILT_SCALE = 1.02;
    const TILT_PERSPECTIVE = 800;
    const PARALLAX_SHIFT = 15;
    const PARALLAX_SCALE = 1.05;
    const LOGO_STAGGER_MS = 150;


    // ═══════════════════════════════════════════
    // 1. HERO VIDEO — Cinematic Slow-Mo
    // ═══════════════════════════════════════════
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        heroVideo.playbackRate = HERO_PLAYBACK_RATE;
    }


    // ═══════════════════════════════════════════
    // 2. GLASSMORPHISM HEADER — Scroll Behavior
    // ═══════════════════════════════════════════
    const header = document.querySelector('.site-header');
    let lastScrollY = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (header) {
                    header.classList.toggle('scrolled', lastScrollY > SCROLL_THRESHOLD);
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });


    // ═══════════════════════════════════════════
    // 3. MOBILE NAVIGATION
    // ═══════════════════════════════════════════
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNavDrawer = document.querySelector('.mobile-nav-drawer');
    const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');

    if (mobileMenuToggle && mobileNavDrawer) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            mobileNavDrawer.classList.toggle('active');
            document.body.style.overflow = mobileNavDrawer.classList.contains('active') ? 'hidden' : '';
        });

        // Close on link click
        mobileNavDrawer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (!link.classList.contains('mobile-dropdown-toggle')) {
                    mobileMenuToggle.classList.remove('active');
                    mobileNavDrawer.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
    }

    // Mobile dropdown sub-menus
    mobileDropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const subMenu = toggle.nextElementSibling;
            if (subMenu) subMenu.classList.toggle('active');
        });
    });

    // Close mobile menu on resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > TABLET_BREAKPOINT && mobileNavDrawer && mobileNavDrawer.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            mobileNavDrawer.classList.remove('active');
            document.body.style.overflow = '';
        }
    }, { passive: true });


    // ═══════════════════════════════════════════
    // 4. BOOKING OVERLAY — Slide-Over Panel
    // ═══════════════════════════════════════════
    const bookingOverlay = document.getElementById('booking-overlay');
    const bookingBackdrop = document.getElementById('booking-backdrop');
    const bookingClose = document.getElementById('booking-close');
    const bookingTriggers = document.querySelectorAll('#booking-trigger, #booking-trigger-mobile, #booking-trigger-bottom, #final-booking-trigger');

    let bookingTriggerElement = null; // Track which element opened the overlay

    function openBooking(e) {
        if (e) e.preventDefault();
        if (!bookingOverlay) return;

        bookingTriggerElement = e ? e.currentTarget : null;

        // Lazy-load the iframe
        const iframe = bookingOverlay.querySelector('iframe');
        if (iframe && iframe.dataset.src && !iframe.src.includes('stayflexi')) {
            iframe.src = iframe.dataset.src;
        }

        bookingOverlay.classList.add('active');
        bookingBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus the close button for keyboard users
        if (bookingClose) bookingClose.focus();
    }

    function closeBooking() {
        if (!bookingOverlay) return;
        bookingOverlay.classList.remove('active');
        bookingBackdrop.classList.remove('active');
        document.body.style.overflow = '';

        // Return focus to the element that opened the overlay
        if (bookingTriggerElement) {
            bookingTriggerElement.focus();
            bookingTriggerElement = null;
        }
    }

    bookingTriggers.forEach(trigger => {
        trigger.addEventListener('click', openBooking);
    });

    if (bookingClose) bookingClose.addEventListener('click', closeBooking);
    if (bookingBackdrop) bookingBackdrop.addEventListener('click', closeBooking);

    // Escape key closes booking + focus trap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeBooking();

        // Focus trap: keep Tab within the overlay when open
        if (e.key === 'Tab' && bookingOverlay && bookingOverlay.classList.contains('active')) {
            const focusable = bookingOverlay.querySelectorAll('button, [href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])');
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
    });


    // ═══════════════════════════════════════════
    // 5. 3D TILT CARDS — Cursor-Based Rotation
    // ═══════════════════════════════════════════
    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (window.innerWidth < MOBILE_BREAKPOINT) return;

            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;

            const rotateX = (mouseY / (rect.height / 2)) * -TILT_MAX_ROTATION;
            const rotateY = (mouseX / (rect.width / 2)) * TILT_MAX_ROTATION;

            card.style.transform = `perspective(${TILT_PERSPECTIVE}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${TILT_SCALE})`;
            card.style.transition = 'transform 0.1s ease-out';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(${TILT_PERSPECTIVE}px) rotateX(0) rotateY(0) scale(1)`;
            card.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        });
    });


    // ═══════════════════════════════════════════
    // 6. LAZY LOADING — Images Fade-In
    // ═══════════════════════════════════════════
    const lazyImages = document.querySelectorAll('.gallery-card img[loading="lazy"], .brand-panel-bg img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    imageObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '100px'
        });

        lazyImages.forEach(img => {
            // If already loaded (cached), mark immediately
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', () => img.classList.add('loaded'));
                imageObserver.observe(img);
            }
        });
    } else {
        // Fallback: just show all images
        lazyImages.forEach(img => img.classList.add('loaded'));
    }


    // ═══════════════════════════════════════════
    // 7. TRUST LOGOS — Scroll Reveal
    // ═══════════════════════════════════════════
    const trustLogos = document.querySelectorAll('.trust-logo');
    if (trustLogos.length > 0) {
        const logoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger the reveal
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * LOGO_STAGGER_MS);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -40px 0px'
        });

        trustLogos.forEach(logo => logoObserver.observe(logo));
    }


    // ═══════════════════════════════════════════
    // 8. BRAND PANEL — 3D Parallax Push Effect
    // ═══════════════════════════════════════════
    const brandPanels = document.querySelectorAll('.brand-panel');

    brandPanels.forEach(panel => {
        const bg = panel.querySelector('.brand-panel-bg');

        panel.addEventListener('mousemove', (e) => {
            if (window.innerWidth < TABLET_BREAKPOINT) return;

            const rect = panel.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            if (bg) {
                bg.style.transform = `translate(${x * -PARALLAX_SHIFT}px, ${y * -PARALLAX_SHIFT}px) scale(${PARALLAX_SCALE})`;
                bg.style.transition = 'transform 0.3s ease-out';
            }
        });

        panel.addEventListener('mouseleave', () => {
            if (bg) {
                bg.style.transform = 'translate(0, 0) scale(1)';
                bg.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
            }
        });
    });


    // ═══════════════════════════════════════════
    // 9. GSAP SCROLL ANIMATIONS
    // ═══════════════════════════════════════════
    function initGSAP() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            // Fallback: use simple IntersectionObserver instead
            initFallbackReveal();
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        // Reveal elements
        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach(el => {
            gsap.fromTo(el,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        end: 'top 50%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });

        // Hero content entrance
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            gsap.fromTo(heroContent,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1.5, delay: 0.3, ease: 'power3.out' }
            );
        }

        // Gallery cards stagger
        const galleryCards = document.querySelectorAll('.gallery-card');
        if (galleryCards.length > 0) {
            gsap.fromTo(galleryCards,
                { opacity: 0, y: 60, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.gallery-grid',
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // Concierge cards stagger
        const conciergeCards = document.querySelectorAll('.concierge-card');
        if (conciergeCards.length > 0) {
            gsap.fromTo(conciergeCards,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.12,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.concierge-grid',
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // Testimonial cards stagger
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        if (testimonialCards.length > 0) {
            gsap.fromTo(testimonialCards,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.testimonials-grid',
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // Brand panels entrance
        const brandPanelEls = document.querySelectorAll('.brand-panel');
        if (brandPanelEls.length > 0) {
            gsap.fromTo(brandPanelEls,
                { opacity: 0, scale: 0.98 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    stagger: 0.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.brand-selector',
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }

        // Parallax background on hero
        const heroBg = document.querySelector('.hero-bg-placeholder');
        if (heroBg) {
            gsap.to(heroBg, {
                y: 100,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });
        }

        // Experience blocks (if on experience page)
        const expBlocks = document.querySelectorAll('.experience-block');
        expBlocks.forEach(block => {
            const content = block.querySelector('.experience-block-content');
            if (content) {
                gsap.fromTo(content,
                    { opacity: 0, x: -60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: block,
                            start: 'top 60%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            }
        });

        // Initialize Postcard Stack
        initPostcardStack();
    }

    // ═══════════════════════════════════════════
    // 10. GLASS CARDS — CSS Interaction Only
    // ═══════════════════════════════════════════
    // Initialization removed to rely on pure CSS for visibility
    // and ensuring content is always accessible.

    // ═══════════════════════════════════════════
    // 11. CAIRN STACK — Marking the Path
    // ═══════════════════════════════════════════
    function initCairnStack() {
        if (typeof gsap === 'undefined') return;

        const stack = document.getElementById('cairn-stack');
        if (!stack) return;

        const blocks = stack.querySelectorAll('.cairn-block');

        // A. THE ENTRANCE (HEAVY DROP)
        // Trigger when stack comes into view
        ScrollTrigger.create({
            trigger: stack,
            start: "top 75%",
            onEnter: () => {
                gsap.fromTo(blocks,
                    { y: -300, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        stagger: 0.2,
                        ease: "bounce.out", // A heavy thud
                        onComplete: () => {
                            // Camera Shake on last drop
                            stack.classList.add('camera-shake');
                            setTimeout(() => stack.classList.remove('camera-shake'), 500);
                        }
                    }
                );
            }
        });

        // B. INTERACTION (EXPAND / COLLAPSE)
        blocks.forEach(block => {
            const header = block.querySelector('.cairn-header');
            const body = block.querySelector('.cairn-body');

            header.addEventListener('click', () => {
                const isExpanded = block.classList.contains('cairn-expanded');

                // 1. Collapse all others first (Accordion style)
                blocks.forEach(other => {
                    if (other !== block && other.classList.contains('cairn-expanded')) {
                        collapseBlock(other);
                    }
                });

                // 2. Toggle current
                if (isExpanded) {
                    collapseBlock(block);
                } else {
                    expandBlock(block);
                }
            });
        });

        function expandBlock(block) {
            const body = block.querySelector('.cairn-body');

            // Get height of content
            const contentHeight = body.scrollHeight;

            block.classList.add('cairn-expanded');

            // Animate Height with "Heavy" Spring
            gsap.to(body, {
                height: contentHeight,
                duration: 0.6,
                ease: "elastic.out(1, 0.75)"
            });
        }

        function collapseBlock(block) {
            const body = block.querySelector('.cairn-body');

            block.classList.remove('cairn-expanded');

            gsap.to(body, {
                height: 0,
                duration: 0.4,
                ease: "power2.out"
            });
        }
    }

    // Initialize Postcard Stack (Legacy) or Cairn Stack (New)
    // initPostcardStack(); -> Removed
    initCairnStack();


    // ═══════════════════════════════════════════
    // 12. ACCORDION (Policies & FAQ)
    // ═══════════════════════════════════════════
    const accordions = document.querySelectorAll('.accordion-header');
    accordions.forEach(acc => {
        acc.addEventListener('click', function () {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });

    // ═══════════════════════════════════════════
    // 13. PROPERTY SHOWCASE GALLERY
    // ═══════════════════════════════════════════
    function initPropertyGallery() {
        // Open lightbox
        document.querySelectorAll('.gallery-view-all-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const lightbox = document.querySelector('.gallery-lightbox');
                if (lightbox) {
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        // Also open lightbox when clicking gallery items
        document.querySelectorAll('.property-gallery-grid .gallery-item').forEach(item => {
            item.addEventListener('click', () => {
                const lightbox = document.querySelector('.gallery-lightbox');
                if (lightbox) {
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        // Close lightbox
        document.querySelectorAll('.gallery-lightbox-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const lightbox = btn.closest('.gallery-lightbox');
                if (lightbox) {
                    lightbox.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const lightbox = document.querySelector('.gallery-lightbox.active');
                if (lightbox) {
                    lightbox.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    }

    initPropertyGallery();

});
