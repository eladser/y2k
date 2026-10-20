# Halcyon Airways, 1996 to 2026

**[y2k.eladser.dev](https://y2k.eladser.dev)**

One made-up airline's homepage, rebuilt the way it would have been built in each era of the web. Same airline, same job, the tools and taste of that year. Every version works, and an X-ray panel shows how it was built, with the real code from that year.

You pick a year on a split-flap departures board. The whole computer changes with it: the desktop, the browser, and the site inside.

| Year | What you get |
| --- | --- |
| 2001 | A full Flash 5 site on Windows XP and IE6: "enter site" splash, a preloader at real 56K speed, a skippable intro with a synthesized techno loop, rollover blips, a wireframe globe, and a flight search that shows the `loadVariables` reply arriving as URL-encoded text. |
| 2026 | An AI-generated film and photos, liquid glass, kinetic variable type driven by scroll, and an "Ask Halcyon" box that runs Gemini Nano on your own machine through Chrome's Prompt API when it's available. |
| 1996, 1999, 2004, 2007, 2012, 2020 | On the board, not built yet. |

None of the old tech runs anymore, so none of it is used here. The Flash site is HTML, SVG and the Web Animations API on the same 760 by 440 stage, and its music is synthesized live with Web Audio.

The board's numbers are sourced: typical page weight per year from websiteoptimization.com, Nielsen Norman Group, Byte Level Research and HTTP Archive, connection speeds from the GVU surveys, comScore, Akamai and Ookla. The full list is on the board under "Where the numbers come from".

No framework, no build step, no server. Static files on GitHub Pages.

## Run it

```
npm run dev     # http://localhost:8199
npm test        # checks the synthesized modem tones and the FFT
```

`scripts/generate.mjs` regenerates the 2026 film and photos through kie.ai from the prompts in `site/eras/2026/prompts.js` (needs `KIE_API_KEY` in the environment or `~/.secrets/kie.env`).
