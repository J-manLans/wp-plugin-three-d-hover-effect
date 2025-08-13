function init3DMotionAnimation() {
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return; // no hover on touch devices
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // user prefers reduced motion

    // Select only containers with data-three-d
    const cards = document.querySelectorAll('.card-3d');

    if (!cards.length) return;

    cards.forEach(card => {
        // Apply 3D transform to the card
        card.style.transformStyle = 'preserve-3d';

        // Create a wrapper element
        const wrapper = document.createElement('div');
        wrapper.classList.add('card-3d-wrapper');
        wrapper.style.width = 'max-content';
        wrapper.style.margin = '0 auto';

        // Insert wrapper before the card and move the card inside it
        card.parentNode.insertBefore(wrapper, card);
        wrapper.appendChild(card);

        // Move all data-three-d attributes from card to wrapper
        Array.from(card.attributes).forEach(attr => {
            if (attr.name.startsWith('data-three-d')) {
                wrapper.setAttribute(attr.name, attr.value);
                card.removeAttribute(attr.name); // remove from card
            }
        });

        // Read data-attributes with fallbacks
        const perspective = wrapper.dataset.threeDPerspective || '1000';
        const maxRotate = wrapper.dataset.threeDMaxRotate || 2;

        /* ========================= Old Code ========================= */

        wrapper.style.perspective = `${perspective}px`;

        // State for lerp loop
        let rafId = null;
        let running = false;
        let currentX = 0, currentY = 0;
        let targetX = 0, targetY = 0;
        const LERP = 0.25; // lerp factor: higher = snappier, lower = smoother/slower
        let leaveTimeout = null;

        wrapper.addEventListener('pointerenter', () => {
            if (leaveTimeout) {
                clearTimeout(leaveTimeout);
                leaveTimeout = null;
            }

            // Prepare GPU for transform and set perspective on the wrapper
            card.style.willChange = 'transform';
            startLoop();
        });

        wrapper.addEventListener('pointermove', (e) => {
            const rect = wrapper.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Compute target rotation
            targetX = ((y - centerY) / centerY) * maxRotate;
            targetY = ((x - centerX) / centerX) * maxRotate;

            startLoop();
        });

        wrapper.addEventListener('pointerleave', () => {
            // Smoothly return to zero
            targetX = 0;
            targetY = 0;

            if (leaveTimeout) clearTimeout(leaveTimeout);
            leaveTimeout = setTimeout(() => {
                if (!running) {  // only cleanup if animation really stopped
                    card.style.willChange = '';
                    leaveTimeout = null;
                }
            }, 300);
        });

        // start the RAF loop when needed
        function startLoop() {
            if (running) return;
            running = true;
            loop();
        }

        function loop() {
            rafId = requestAnimationFrame(() => {
                currentX += (targetX - currentX) * LERP;
                currentY += (targetY - currentY) * LERP;

                // Apply rotation only on card; perspective held by wrapper
                card.style.transform = `rotateX(${-currentX}deg) rotateY(${currentY}deg)`;

                // continue or stop
                if (running) stopLoopIfIdle();
            });
        }

        function stopLoopIfIdle() {
            const EPS = 0.01;

            // stop when very close to target
            if (Math.abs(currentX - targetX) < EPS && Math.abs(currentY - targetY) < EPS) {
                currentX = targetX;
                currentY = targetY;
                card.style.transform = `rotateX(${-currentX}deg) rotateY(${currentY}deg)`;

                running = false;
                if (rafId) cancelAnimationFrame(rafId);
                rafId = null;
                return;
            }
            loop();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    init3DMotionAnimation();
});
