(function () {
    const video = document.getElementById('birthdayVideo');
    const notice = document.getElementById('mediaUnavailable');
    const closing = document.getElementById('videoClosing');
    const replay = document.getElementById('watchAgain');
    if (!video || !notice || !closing || !replay) return;

    const mediaUrl = '../assets/maira-edit.mp4';

    function showMissingMedia() {
        video.pause();
        video.removeAttribute('src');
        video.load();
        video.hidden = true;
        notice.textContent = 'The finished birthday edit is not available yet. Add the approved file at assets/maira-edit.mp4 to enable playback.';
        notice.hidden = false;
        closing.hidden = true;
        replay.hidden = true;
    }

    video.addEventListener('loadedmetadata', function () {
        video.hidden = false;
        notice.hidden = true;
    }, { once: true });

    video.addEventListener('error', showMissingMedia, { once: true });

    window.addEventListener('pagehide', function () {
        video.pause();
    }, { once: true });

    video.addEventListener('play', function () {
        if (document.fullscreenElement || typeof video.requestFullscreen !== 'function') return;
        try {
            const fullscreenRequest = video.requestFullscreen();
            if (fullscreenRequest && typeof fullscreenRequest.catch === 'function') {
                fullscreenRequest.catch(function () {});
            }
        } catch (error) {
            // Embedded playback remains available when fullscreen is restricted.
        }
    });

    video.addEventListener('ended', async function () {
        if (document.fullscreenElement === video && typeof document.exitFullscreen === 'function') {
            try {
                await document.exitFullscreen();
            } catch (error) {
                // Keep the ending controls available if fullscreen cannot be exited.
            }
        }
        closing.hidden = false;
        replay.hidden = false;
    });

    replay.addEventListener('click', function () {
        closing.hidden = true;
        replay.hidden = true;
        video.currentTime = 0;
        video.play().catch(function () {
            replay.hidden = false;
        });
    });

    video.src = mediaUrl;
})();
