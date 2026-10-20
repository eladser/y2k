# Halcyon Airways, 1996 to 2026

**[y2k.eladser.dev](https://y2k.eladser.dev)**

One made-up airline's homepage, rebuilt the way it would have been built in each era of the web. Same airline, same job, the tools and taste of that year. Every version works, and an X-ray panel shows how it was built, with the real code from that year.

You pick a year on a split-flap departures board. The whole computer changes with it: the desktop, the browser, and the site inside.

| Year | What you get |
| --- | --- |
| 1996 | Netscape Navigator 3 on Windows 95: HTML 3.2 tables, an image-map menu, a status-bar ticker, a mailto form and a hit counter that counts real visits. |
| 1999 | IE5 on Windows 98. You dial in first, with a synthesized 56K handshake, then get a frameset with rollovers, DHTML fly-out menus, a Y2K notice and images that load at modem speed. |
| 2001 | A full Flash 5 site on Windows XP and IE6: "enter site" splash, a preloader at real 56K speed, a skippable intro with a synthesized techno loop, rollover blips, a wireframe globe, and a flight search that shows the `loadVariables` reply arriving as URL-encoded text. |
| 2004 | Firefox 1.0 on Windows XP: a CSS layout with no tables, built from the A List Apart techniques of the day (faux columns, sliding-door tabs, image replacement, the box model hack) and a style switcher. |
| 2007 | Firefox 2 on Vista: Web 2.0 gloss, jQuery 1.2.1, AJAX search with autocomplete, a lightbox and a beta badge. |
| 2012 | Chrome 23 on Windows 7: Bootstrap 2.2.1 and jQuery 1.8.3, a carousel, typeahead, HTML5 inputs and glyphicon sprites. Drag the window narrower and it collapses into the phone layout. |
| 2020 | Chrome 87 on Windows 10: a React 17 single-page app with a COVID-19 banner, cookie consent, dark mode, skeleton screens, lazy WebP images and a chat bubble. |
| 2026 | An AI-generated film and photos, liquid glass, kinetic variable type driven by scroll, and an "Ask Halcyon" box that runs Gemini Nano on your own machine through Chrome's Prompt API when it's available. |

Flash, Dial-Up Networking and the old browsers don't run anymore, so they're recreated. The Flash site is HTML, SVG and the Web Animations API on the same 760 by 440 stage, and its music is synthesized live with Web Audio.

The board's numbers are sourced: typical page weight per year from websiteoptimization.com, Nielsen Norman Group, Byte Level Research and HTTP Archive, connection speeds from the GVU surveys, comScore, Akamai and Ookla. The full list is on the board under "Where the numbers come from".

The old eras ship the real libraries of their year: jQuery 1.2.1, Bootstrap 2.2.1, jQuery 1.8.3 and React 17. The board itself has no framework and no build step. Static files on GitHub Pages, no server.

## Run it

```
npm run dev     # http://localhost:8199
npm test        # checks the synthesized modem tones and the FFT
```

`scripts/generate.mjs` regenerates the 2026 film and photos through kie.ai from the prompts in `site/eras/2026/prompts.js` (needs `KIE_API_KEY` in the environment or `~/.secrets/kie.env`). `scripts/stock.mjs` makes the one-off stills for the older eras, and `scripts/cut.mjs` cuts the period GIFs and JPEGs from the art boards in `scripts/art/`.
