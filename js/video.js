(function () {
    const video = document.getElementById('birthdayVideo');
    const notice = document.getElementById('mediaUnavailable');
    const closing = document.getElementById('videoClosing');
    const replay = document.getElementById('watchAgain');
    if (!video || !notice || !closing || !replay) return;

    const mediaUrl = '../assets/maira-edit.mp4';
    const mediaAvailable = false;

    function showMissingMedia() {
        video.pause();
        video.removeAttribute('src');
        video.load();
        video.hidden = true;
        notice.hidden = false;
        closing.hidden = true;
        replay.hidden = true;
    }

    if (!mediaAvailable) return;

    video.src = mediaUrl;
    video.hidden = false;
    notice.hidden = true;
    video.load();

    video.addEventListener('play', function () {
        if (document.fullscreenElement || typeof video.requestFullscreen !== 'function') return;
        video.requestFullscreen().catch(function () {});
    });

    video.addEventListener('ended', function () {
        closing.hidden = false;
        replay.hidden = false;
    });

    video.addEventListener('error', showMissingMedia);

    replay.addEventListener('click', function () {
        closing.hidden = true;
        replay.hidden = true;
        video.currentTime = 0;
        video.play().catch(function () {
            replay.hidden = false;
        });
    });
})();
