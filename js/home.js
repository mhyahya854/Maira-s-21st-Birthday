(function () {
    const welcome = document.getElementById('welcome');
    const main = document.getElementById('mainDiv');
    const code = document.getElementById('code');
    const moreLink = document.getElementById('thereIsMore');
    const confettiLayer = document.getElementById('confetti');

    if (confettiLayer) {
        const confettiColors = ['#E98E86', '#E6B45C', '#C7829B', '#789D7C', '#8EA9B7'];
        for (let index = 0; index < 26; index++) {
            const piece = document.createElement('span');
            piece.className = 'confetti-piece';
            piece.style.setProperty('--x', ((index * 37 + 11) % 100) + '%');
            piece.style.setProperty('--drift', (((index * 29) % 150) - 75) + 'px');
            piece.style.setProperty('--spin', ((index % 2 ? 1 : -1) * (220 + (index % 5) * 75)) + 'deg');
            piece.style.setProperty('--delay', ((index % 7) * 65) + 'ms');
            piece.style.setProperty('--duration', (2300 + (index % 4) * 120) + 'ms');
            piece.style.setProperty('--color', confettiColors[index % confettiColors.length]);
            confettiLayer.appendChild(piece);
        }
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
