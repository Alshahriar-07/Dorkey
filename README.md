# Dorkey

Dorkey is a premium, fast, browser-based typing speed test for measuring typing speed, WPM, CPM, accuracy, errors, and timed performance.

## Features

- Free typing speed test with 15, 30, 60, and 120 second durations
- Live WPM, CPM, accuracy, errors, timer, and timeline feedback
- 35 long, varied English typing passages
- Shuffled passage deck with immediate-repeat protection
- Correct, incorrect, current-character, and backspace states
- Auto-follow typing viewport for long passages
- Private result page with WPM-based ranks
- Responsive neumorphic interface and reduced-motion support
- Browser-only result and consent storage
- Privacy policy, branded 404 page, favicon, sitemap, and robots file
- Canonical metadata, Open Graph, Twitter cards, and JSON-LD

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- Vercel static deployment

## Project structure

```text
Dorkey/
├── index.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── vercel.json
├── README.md
├── assets/
│   ├── dorkey-favicon.png
│   ├── dorkey-icon.png
│   └── dorkey-logo.png
├── css/
│   └── style.css
├── js/
│   ├── data.js
│   ├── main.js
│   ├── result.js
│   └── test.js
└── pages/
    ├── about.html
    ├── privacy.html
    ├── result.html
    └── test.html
```

## Typing engine

The test keeps a shuffled in-memory deck of passages. It consumes one passage at a time and reshuffles only after the deck is empty, swapping the first passage when necessary to prevent an immediate repeat. Each passage is rendered as individual character elements so correct, incorrect, current, and untyped states remain independent.

The first typed character starts one `requestAnimationFrame` timing loop. Elapsed time is the source of truth for the timer, timeline, WPM, and CPM. Restart stops the loop, clears typed state, chooses a new passage, resets the auto-follow translation, and waits for the next input. Completion is protected against duplicate calls and saves the latest result in `sessionStorage`.

The typing viewport clips the long passage inside its rounded container. The content layer is translated using the measured active character position, targeting approximately 40% of the viewport while clamping the translation so the passage edges remain valid. The behavior responds to resize and works with backspace.

## Result system

Results contain WPM, CPM, accuracy, errors, duration, rank, and a timestamp. The result page reads only the latest browser-session result. Users can start a fresh test or return home. Rank thresholds are centralized in `js/data.js`.

## SEO and privacy

Public pages use production canonical URLs, page-specific descriptions, Open Graph and Twitter metadata, favicon references, and honest JSON-LD. `robots.txt` points to the production sitemap; dynamic results are marked `noindex`.

Dorkey does not require an account and does not add analytics, advertising, or tracking. The latest result is stored in `sessionStorage`; consent preference is stored in `localStorage`.

## Local development

Use any local static server from the project root, for example:

```text
python -m http.server 8765
```

Then open `http://127.0.0.1:8765/`.

## Deployment

The project is a static HTML/CSS/JavaScript application prepared for:

https://dorkey.vercel.app/

Import the project into Vercel with the default static settings. No package manager or build step is required.

## Browser support

Dorkey targets current versions of Chrome, Edge, Firefox, and Safari on desktop, laptop, tablet, and mobile browsers.
