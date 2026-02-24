/**
 * ============================================
 *  YOLO Property Page Interactive Engine
 * ============================================
 *  Vanilla JS — no dependencies
 *  Uses IntersectionObserver for scroll-triggered interactions
 *  Safe to include on any page (checks element existence)
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ─── 1. Scroll Reveal System ───────────────────────────────
    // Adds 'revealed' class to .pp-reveal elements when they enter viewport.
    // Children with .pp-reveal-stagger get incremental transition-delay.

    function initScrollReveal() {
        const items = document.querySelectorAll('.pp-reveal');
        if (!items.length) return;

        // Pre-set stagger delays on children
        items.forEach((el) => {
            el.querySelectorAll('.pp-reveal-stagger').forEach((child, i) => {
                child.style.transitionDelay = `${i * 0.1}s`;
            });
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        items.forEach((el) => observer.observe(el));
    }

    // ─── 2. Timeline Activator ─────────────────────────────────
    // Activates .pp-timeline__item and its .pp-timeline__node on scroll.

    function initTimeline() {
        const items = document.querySelectorAll('.pp-timeline__item');
        if (!items.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    const node = entry.target.querySelector('.pp-timeline__node');
                    if (node) node.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        items.forEach((el) => observer.observe(el));
    }

    // ─── 3. Sticky Booking Bar ─────────────────────────────────
    // Shows .pp-booking-bar after user scrolls past 80% of .pp-hero.

    function initBookingBar() {
        const hero = document.querySelector('.pp-hero');
        const bar = document.querySelector('.pp-booking-bar');
        if (!hero || !bar) return;

        // Observer fires when the bottom 20% of the hero leaves the viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                // Hero is intersecting = user is near top, hide bar
                // Hero is NOT intersecting = user scrolled past, show bar
                bar.classList.toggle('visible', !entry.isIntersecting);
            });
        }, { threshold: 0.2 });

        observer.observe(hero);
    }

    // ─── 4. Animated Number Counter ────────────────────────────
    // Animates numbers from 0 to data-target with easeOutExpo easing.

    function initCounters() {
        const counters = document.querySelectorAll('.pp-counter__item');
        if (!counters.length) return;

        // easeOutExpo: fast start, smooth deceleration
        function easeOutExpo(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function animateCounter(el) {
            if (el.dataset.counted) return;
            el.dataset.counted = 'true';

            const target = parseFloat(el.dataset.target) || 0;
            const suffix = el.dataset.suffix || '';
            const isFloat = String(target).includes('.');
            const decimals = isFloat ? (String(target).split('.')[1] || '').length : 0;
            const duration = 2000; // ms
            const start = performance.now();

            function tick(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const value = target * easeOutExpo(progress);

                el.textContent = (isFloat ? value.toFixed(decimals) : Math.round(value)) + suffix;

                if (progress < 1) {
                    requestAnimationFrame(tick);
                } else {
                    el.textContent = (isFloat ? target.toFixed(decimals) : target) + suffix;
                    el.classList.add('counted');
                }
            }

            requestAnimationFrame(tick);
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach((el) => observer.observe(el));
    }

    // ─── 5. Bento Gallery Lightbox Connector ───────────────────
    // Hooks bento grid clicks into the existing gallery-lightbox system.

    function initBentoLightbox() {
        const lightbox = document.querySelector('.gallery-lightbox');
        if (!lightbox) return;

        const triggers = document.querySelectorAll('.pp-bento__item, .pp-bento__count');
        if (!triggers.length) return;

        triggers.forEach((trigger) => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });
    }

    // ─── 6. Room Cards Drag-to-Scroll ──────────────────────────
    // Mouse-drag horizontal scrolling on .pp-rooms__scroll (desktop).

    function initDragScroll() {
        const scroller = document.querySelector('.pp-rooms__scroll');
        if (!scroller) return;

        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;
        let hasDragged = false;

        scroller.addEventListener('mousedown', (e) => {
            isDown = true;
            hasDragged = false;
            startX = e.pageX - scroller.offsetLeft;
            scrollLeft = scroller.scrollLeft;
            scroller.classList.add('grabbing');
        });

        scroller.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - scroller.offsetLeft;
            const walk = (x - startX) * 1.5; // scroll speed multiplier
            scroller.scrollLeft = scrollLeft - walk;
            if (Math.abs(x - startX) > 5) hasDragged = true;
        });

        function endDrag() {
            isDown = false;
            scroller.classList.remove('grabbing');
        }

        scroller.addEventListener('mouseup', endDrag);
        scroller.addEventListener('mouseleave', endDrag);

        // Prevent click events on children if the user was dragging
        scroller.addEventListener('click', (e) => {
            if (hasDragged) {
                e.preventDefault();
                e.stopPropagation();
                hasDragged = false;
            }
        }, true); // capture phase
    }

    // ─── 7. Parallax Scroll for Story Images ───────────────────
    // Subtle vertical parallax on .pp-story__visual img (desktop only).

    function initStoryParallax() {
        if (window.innerWidth <= 768) return;

        const visuals = document.querySelectorAll('.pp-story__visual img');
        if (!visuals.length) return;

        let ticking = false;

        function updateParallax() {
            const scrollY = window.scrollY;
            visuals.forEach((img) => {
                const rect = img.getBoundingClientRect();
                const center = rect.top + rect.height / 2;
                const viewH = window.innerHeight;
                // Normalized position: 0 = element at bottom of viewport, 1 = at top
                const ratio = (viewH - center) / (viewH + rect.height);
                // Map to -40px .. +40px range
                const translate = (ratio - 0.5) * 80;
                const clamped = Math.max(-40, Math.min(40, translate));
                img.style.transform = `translateY(${clamped}px)`;
            });
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }

    // ─── 8. Glance Bar Scroll Parallax ─────────────────────────
    // Subtle opacity fade on .pp-glance as user scrolls far below it.

    function initGlanceParallax() {
        const glance = document.querySelector('.pp-glance');
        if (!glance) return;

        let ticking = false;

        function updateGlance() {
            const rect = glance.getBoundingClientRect();
            // When element is in view, full opacity; as it scrolls above, fade slightly
            if (rect.bottom < 0) {
                // Already fully scrolled past — no work needed
            } else if (rect.top < 0) {
                // Partially above viewport — fade based on how far gone
                const gone = Math.abs(rect.top) / rect.height;
                glance.style.opacity = Math.max(0.6, 1 - gone * 0.4);
            } else {
                glance.style.opacity = 1;
            }
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateGlance);
                ticking = true;
            }
        }, { passive: true });
    }

    // ─── 9. Smooth Scroll for Internal Links ───────────────────
    // Hash links scroll smoothly with offset for fixed navigation.

    function initSmoothScroll() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            const id = link.getAttribute('href');
            if (id.length <= 1) return; // bare "#" — ignore

            const target = document.querySelector(id);
            if (!target) return;

            e.preventDefault();

            // Account for fixed nav height (fallback 80px)
            const nav = document.querySelector('.navbar, .nav, header');
            const offset = nav ? nav.offsetHeight + 16 : 80;

            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    }

    // ─── 10. Initialize All Modules ────────────────────────────
    // Each function checks for required elements before running.

    initScrollReveal();
    initTimeline();
    initBookingBar();
    initCounters();
    initBentoLightbox();
    initDragScroll();
    initStoryParallax();
    initGlanceParallax();
    initSmoothScroll();
});
