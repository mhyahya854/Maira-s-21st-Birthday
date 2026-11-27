# Maira's 21st Birthday Website

A small static website for Maira's birthday. It uses the existing canvas flower animation, birthday code typewriter, and live counter, followed by a personal letter and a video surprise.

## Pages

- `/` — five-second welcome, animated birthday code, flower cake, and Pakistan-time birthday counter.
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

The finished edit is present at `assets/maira-edit.mp4`. The video page loads it automatically, with manual playback, fullscreen where supported, an ending message, and a replay control after playback.

## Private deployment

Production uses Cloudflare Pages with server-side secret-link protection. Opening the private link establishes a signed browser session; protected pages and assets require that session. Never commit the private link or its secret values to this repository.

## Existing assets

- `digital-7_mono.ttf` — counter font.
- `bday.png` — original project preview image.
