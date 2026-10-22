# Credits

Everything in this repo that I didn't write or draw.

## Libraries

These are the original files from the time, unmodified.

| File | Version | Author | License |
| --- | --- | --- | --- |
| `site/eras/2007/jquery-1.2.1.min.js` | jQuery 1.2.1 (2007) | John Resig | MIT or GPL, dual licensed |
| `site/eras/2012/lib/jquery-1.8.3.min.js` | jQuery 1.8.3 (2012) | jQuery Foundation | MIT |
| `site/eras/2012/lib/bootstrap*.css`, `bootstrap.min.js` | Bootstrap 2.2.1 (2012) | Twitter, Inc. | Apache 2.0 |
| `site/eras/2012/img/glyphicons-halflings*.png` | Glyphicons Halflings, as shipped with Bootstrap 2 | Jan Kovařík | Apache 2.0, under the Bootstrap arrangement |
| `site/eras/2020/lib/react*.production.min.js` | React and ReactDOM 17.0.1 (2020) | Facebook, Inc. | MIT |

## Fonts

All under the SIL Open Font License 1.1.

| Font | Designer | Used for |
| --- | --- | --- |
| Barlow, Barlow Condensed | Jeremy Tribby | the departures board |
| Silkscreen | Jason Kottke | the 2001 Flash site |
| Michroma | Vernon Adams | the 2001 Flash site |
| Open Sans | Steve Matteson | 2012 |
| Poppins | Indian Type Foundry | 2020 |
| Mona Sans | GitHub | 2026 |

## Generated media

Made through [kie.ai](https://kie.ai). The prompts are in the repo, so you can see exactly what was asked for.

| What | Model | Prompt |
| --- | --- | --- |
| The 2026 hero film | Google Veo 3 | `site/eras/2026/prompts.js` |
| City photos used across 2004, 2007, 2012, 2020 and 2026, and the 2026 window view | GPT Image 2 | `site/eras/2026/prompts.js` |
| The 1999 banner, the 2007 hero, the 2020 illustration | GPT Image 2 | `scripts/stock.mjs` |

The period GIFs and JPEGs (logos, buttons, rollovers, counter digits, tabs) are drawn as HTML in `scripts/art/` and converted by `scripts/cut.mjs`. The sounds are synthesized in the browser. No audio files are used.

## Services

- The 1996 visitor counter uses [Abacus](https://abacus.jasoncameron.dev) by Jason Cameron.
- Site visits are counted with [Umami](https://umami.is), without cookies.

## Sources

The page sizes and connection speeds on the board come from websiteoptimization.com, Nielsen Norman Group, Byte Level Research, Gomez, HTTP Archive, the GVU WWW surveys, comScore, Akamai and Ookla. Links are on the board under "Where the numbers come from".

## Names

Netscape, Internet Explorer, Firefox, Chrome and Windows belong to their owners. The browser windows and desktops here are redrawn in CSS and SVG to show what each year looked like. Halcyon Airways is made up.
