(function () {
    const button = document.getElementById('editFinally');
    const status = document.getElementById('countdownStatus');
    if (!button || !status) return;

    let secondsRemaining = 10;
    let navigating = false;
    let countdownTimer = null;

    function openVideo() {
        if (navigating) return;
        navigating = true;
        if (countdownTimer !== null) window.clearInterval(countdownTimer);
        window.location.assign(button.href);
    }

    button.addEventListener('click', function (event) {
        event.preventDefault();
        openVideo();
    });

    countdownTimer = window.setInterval(function () {
        if (navigating) return;
        secondsRemaining -= 1;
        if (secondsRemaining <= 0) {
            openVideo();
            return;
        }
        status.textContent = 'Redirecting in ' + secondsRemaining + ' seconds';
    }, 1000);

    window.addEventListener('pagehide', function () {
        if (countdownTimer !== null) window.clearInterval(countdownTimer);
    }, { once: true });
})();
