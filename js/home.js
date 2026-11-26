(function () {
    const welcome = document.getElementById('welcome');
    const main = document.getElementById('mainDiv');
    const code = document.getElementById('code');
    const moreLink = document.getElementById('thereIsMore');
    const confettiLayer = document.getElementById('confetti');

    function burstConfetti(durationScale = 1, delayScale = 1) {
        if (!confettiLayer) return;

        const confettiColors = ['#E98E86', '#E6B45C', '#C7829B', '#789D7C', '#8EA9B7'];
        for (let index = 0; index < 26; index++) {
            const pair = Math.floor(index / 2);
            const fromLeft = index % 2 === 0;
            const duration = (2300 + (pair % 4) * 120) * durationScale;
            const delay = (pair % 7) * 65 * delayScale;
            const piece = document.createElement('span');
            piece.className = 'confetti-piece';
            piece.style.setProperty('--start-x', fromLeft ? '-5px' : 'calc(100% - 2px)');
            piece.style.setProperty('--start-y', ((index * 23) % 38) + '%');
            piece.style.setProperty('--drift', ((fromLeft ? 1 : -1) * (24 + (index * 17) % 32)) + 'px');
            piece.style.setProperty('--fall', (95 + (index % 4) * 5) + 'vh');
            piece.style.setProperty('--spin', ((index % 2 ? 1 : -1) * (220 + (index % 5) * 75)) + 'deg');
            piece.style.setProperty('--delay', delay + 'ms');
            piece.style.setProperty('--duration', duration + 'ms');
            piece.style.setProperty('--color', confettiColors[index % confettiColors.length]);

            let cleanupTimer = null;
            const removePiece = function () {
                if (cleanupTimer !== null) window.clearTimeout(cleanupTimer);
                piece.remove();
            };
            piece.addEventListener('animationend', removePiece, { once: true });
            cleanupTimer = window.setTimeout(removePiece, duration + delay + 150);
            confettiLayer.appendChild(piece);
        }
    }

    if (confettiLayer) {
        if (welcome) welcome.before(confettiLayer);
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
