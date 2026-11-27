(function () {
    const welcome = document.getElementById('welcome');
    const main = document.getElementById('mainDiv');
    const code = document.getElementById('code');
    const moreLink = document.getElementById('thereIsMore');
    const confettiLayer = document.getElementById('confetti');

    let confettiCanvas = null;
    let confettiContext = null;
    let confettiWidth = 0;
    let confettiHeight = 0;
    let confettiScale = 1;
    let confettiParticles = [];
    let confettiFrame = null;

    function cubicBezierY(progress) {
        let low = 0;
        let high = 1;
        let parameter = progress;

        for (let step = 0; step < 10; step++) {
            const inverse = 1 - parameter;
            const x = 3 * inverse * inverse * parameter * 0.34 +
                3 * inverse * parameter * parameter * 0.63 +
                parameter * parameter * parameter;
            if (x < progress) low = parameter;
            else high = parameter;
            parameter = (low + high) / 2;
        }

        const inverse = 1 - parameter;
        return 3 * inverse * inverse * parameter * 0.07 +
            3 * inverse * parameter * parameter * 0.95 +
            parameter * parameter * parameter;
    }

    const confettiEase = Array.from({ length: 101 }, function (_, index) {
        return cubicBezierY(index / 100);
    });

    function easeConfetti(progress) {
        const position = Math.max(0, Math.min(100, progress * 100));
        const index = Math.floor(position);
        const next = Math.min(index + 1, 100);
        const fraction = position - index;
        return confettiEase[index] + (confettiEase[next] - confettiEase[index]) * fraction;
    }

    function confettiOpacity(progress) {
        if (progress < 0.12) return 0.78 * easeConfetti(progress / 0.12);
        if (progress < 0.83) return 0.78 - 0.04 * easeConfetti((progress - 0.12) / 0.71);
        return 0.74 * (1 - easeConfetti((progress - 0.83) / 0.17));
    }

    function resizeConfettiCanvas() {
        if (!confettiCanvas || !confettiContext) return;

        confettiWidth = Math.max(1, window.innerWidth);
        confettiHeight = Math.max(1, window.innerHeight);
        confettiScale = Math.min(window.devicePixelRatio || 1, 2);
        const pixelWidth = Math.round(confettiWidth * confettiScale);
        const pixelHeight = Math.round(confettiHeight * confettiScale);

        if (confettiCanvas.width !== pixelWidth || confettiCanvas.height !== pixelHeight) {
            confettiCanvas.width = pixelWidth;
            confettiCanvas.height = pixelHeight;
        }
        confettiContext.setTransform(confettiScale, 0, 0, confettiScale, 0, 0);
    }

    function renderConfetti(now) {
        confettiFrame = null;
        confettiContext.clearRect(0, 0, confettiWidth, confettiHeight);
        let activeCount = 0;

        for (let index = 0; index < confettiParticles.length; index++) {
            const piece = confettiParticles[index];
            const elapsed = now - piece.start - piece.delay;
            if (elapsed >= piece.duration) continue;

            confettiParticles[activeCount++] = piece;
            if (elapsed < 0) continue;

            const progress = Math.min(elapsed / piece.duration, 1);
            const eased = easeConfetti(progress);
            const x = (piece.fromLeft ? -5 : confettiWidth - 2) + piece.drift * eased;
            const y = confettiHeight * piece.startY + confettiHeight * piece.fallRatio * eased;
            if (y > confettiHeight + 20 || x < -20 || x > confettiWidth + 20) continue;

            confettiContext.save();
            confettiContext.globalAlpha = confettiOpacity(progress);
            confettiContext.fillStyle = piece.color;
            confettiContext.translate(x, y);
            confettiContext.rotate(piece.spin * eased * Math.PI / 180);

            if (piece.shape === 'circle') {
                confettiContext.beginPath();
                confettiContext.arc(piece.width / 2, piece.height / 2, piece.width / 2, 0, Math.PI * 2);
                confettiContext.fill();
            } else if (typeof confettiContext.roundRect === 'function') {
                confettiContext.beginPath();
                confettiContext.roundRect(0, 0, piece.width, piece.height, piece.shape === 'long' ? 5 : [2, 5, 2, 5]);
                confettiContext.fill();
            } else {
                confettiContext.fillRect(0, 0, piece.width, piece.height);
            }

            confettiContext.restore();
        }

        confettiParticles.length = activeCount;
        if (activeCount > 0) {
            confettiFrame = window.requestAnimationFrame(renderConfetti);
        } else {
            confettiContext.clearRect(0, 0, confettiWidth, confettiHeight);
        }
    }

    function burstConfetti(durationScale = 1, delayScale = 1) {
        if (!confettiContext) return;

        const confettiColors = ['#E98E86', '#E6B45C', '#C7829B', '#789D7C', '#8EA9B7'];
        const start = performance.now();
        for (let index = 0; index < 26; index++) {
            const pair = Math.floor(index / 2);
            const fromLeft = index % 2 === 0;
            const sequence = index + 1;
            confettiParticles.push({
                fromLeft,
                start,
                startY: ((index * 23) % 38) / 100,
                fallRatio: 0.95 + (index % 4) * 0.05,
                drift: (fromLeft ? 1 : -1) * (24 + (index * 17) % 32),
                spin: (index % 2 ? 1 : -1) * (220 + (index % 5) * 75),
                delay: (pair % 7) * 65 * delayScale,
                duration: (2300 + (pair % 4) * 120) * durationScale,
                width: sequence % 4 === 0 ? 5 : sequence % 3 === 0 ? 6 : 7,
                height: sequence % 4 === 0 ? 15 : sequence % 3 === 0 ? 6 : 12,
                shape: sequence % 4 === 0 ? 'long' : sequence % 3 === 0 ? 'circle' : 'piece',
                color: confettiColors[index % confettiColors.length]
            });
        }

        if (confettiFrame === null) confettiFrame = window.requestAnimationFrame(renderConfetti);
    }

    function clearConfetti() {
        if (confettiFrame !== null) window.cancelAnimationFrame(confettiFrame);
        confettiFrame = null;
        confettiParticles.length = 0;
        if (confettiContext) confettiContext.clearRect(0, 0, confettiWidth, confettiHeight);
    }

    if (confettiLayer) {
        if (welcome) welcome.before(confettiLayer);
        confettiCanvas = document.createElement('canvas');
        confettiCanvas.className = 'confetti-canvas';
        confettiCanvas.setAttribute('aria-hidden', 'true');
        confettiLayer.appendChild(confettiCanvas);
        confettiContext = confettiCanvas.getContext('2d', { alpha: true });
        resizeConfettiCanvas();
        window.addEventListener('resize', resizeConfettiCanvas, { passive: true });
        if (window.visualViewport) window.visualViewport.addEventListener('resize', resizeConfettiCanvas, { passive: true });
        window.addEventListener('pagehide', clearConfetti, { once: true });
        window.birthdayConfettiBurst = function () { burstConfetti(); };
        burstConfetti(5 / 3, 5 / 3);
    }

    if (!welcome || !main || !code || !moreLink) return;

    const birthdayStart = new Date('2005-11-29T00:00:00+05:00');
    const app = window.birthdayApp;
    let started = false;
    let cakeAnimationComplete = false;
    let flowerStartTimer = null;

    function revealMoreLinkWhenReady() {
        if (!cakeAnimationComplete || moreLink.classList.contains('is-ready')) return;
        moreLink.classList.add('is-ready');
        moreLink.removeAttribute('aria-disabled');
        moreLink.removeAttribute('tabindex');
    }

    function beginBirthday() {
        if (started) return;
        started = true;

        if (app) {
            app.startCounter(birthdayStart);
            app.typewriter(code);

            flowerStartTimer = window.setTimeout(function () {
                app.startHeartAnimation(function () {
                    cakeAnimationComplete = true;
                    revealMoreLinkWhenReady();
                });
            }, 2000);
        }

        welcome.remove();
        main.classList.add('is-visible');
    }

    welcome.addEventListener('animationend', function (event) {
        if (event.target === welcome && event.animationName === 'welcome-sequence') beginBirthday();
    });

    window.addEventListener('pagehide', function () {
        if (flowerStartTimer !== null) window.clearTimeout(flowerStartTimer);
    }, { once: true });
})();
