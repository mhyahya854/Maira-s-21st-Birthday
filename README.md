# Maira's 21st Birthday Website

A small static website for Maira's birthday. It uses the existing canvas flower animation, birthday code typewriter, and live counter, followed by a personal letter and a video surprise.

## Pages

- `/` — three-second welcome, animated birthday code, flower cake, and Pakistan-time birthday counter.
- `/note/` — the complete birthday letter.
- `/surprise/` — the video introduction and 10-second countdown.
- `/video/` — the video player, closing message, replay control, and return link.

All pages are plain HTML, CSS, and JavaScript. There is no build step or external dependency. The original flower geometry and rendering remain in `js/garden.js`.

## Run locally

Serve this directory with any static HTTP server. For example, with Python 3:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000/` in a browser. Direct route refreshes work from the same server.

## Video file

The finished edit was not present when this project was prepared. The page shows a clear missing-media message and keeps the player and replay control unavailable. When the MP4 is supplied at `assets/maira-edit.mp4`, set `mediaAvailable` to `true` in `js/video.js` to enable the player.

## Existing assets

- `digital-7_mono.ttf` — counter font.
- `bday.png` — original project preview image.
