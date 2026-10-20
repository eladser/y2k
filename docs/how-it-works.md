# How it works

## The shell

`site/index.html` holds three things: the departures board, the desktop, and the X-ray panel. `shell.js` draws everything around each era's page. The wallpaper, taskbar and browser window come from the `CHROME` and `TASK` templates, chosen by the era's `chrome` and `os` fields. The page itself loads in an iframe inside the browser window.

The iframe is on the same origin, so the shell can read the page's DOM. It does that twice:

- The X-ray spotlight finds the element named by an item's `sel` and follows it every animation frame, because half these pages are animating. If React unmounts the element, it looks again.
- The X-ray footer adds up `performance` resource entries from the page and every frame inside it (1999 is a frameset) to show what this copy weighs.

## Messages from the era pages

Era pages can `postMessage` the shell. Only messages from the same origin are used.

| Message | What the shell does |
| --- | --- |
| `{ status: 'Done' }` | sets the text in the browser's status bar |
| `{ progress: 0.4 }` | fills the status bar's progress meter |
| `{ popup: { src, title, w, h } }` | opens a pop-up window on the desktop. Only URLs under `eras/` are allowed |
| `{ closePopup: true }` | closes it |

After each page loads, the shell sends it `{ sound: true | false }` so the page can follow the mute button.

## eras.js

One entry per year, in board order.

| Field | |
| --- | --- |
| `year`, `browser`, `os`, `conn` | what the board shows |
| `kbps`, `page` | connection speed and typical page size in KB. Download time on the board is `page / kbps` |
| `built` | whether the year can be opened |
| `chrome`, `os` | which browser template and desktop to draw |
| `url`, `title`, `tab` | what the address bar, title bar and tab show |
| `dialup` | show the Dial-Up Networking dialog before loading (1999) |
| `stack` | one line under the X-ray title |
| `xray` | the techniques, in order |

Each X-ray item has a `name`, a `sel` for the spotlight, `then` and `now` text, and a `code` sample. An optional `check` function returns true when your browser supports the "now" feature, and the panel then says so. These are functions, not strings, because the page's Content-Security-Policy doesn't allow `eval`. `wrap: true` soft-wraps long code, which is used for the AI prompts.

`SOURCES` and `NOTE` at the bottom are the citations shown on the board.

## Modem speed

`site/eras/dialup.js` hides a page's images and brings them back in document order at the speed in its `DATA-RATE` attribute, in bytes per second. Until an image "arrives", its ALT text shows in an empty box. When everything has loaded it sets `window.replayDone` and fires a `replaydone` event. 1996 uses 2400, 1999 uses 3000.

## Period images

Logos, buttons, rollover states and counter digits are drawn as HTML on art boards in `scripts/art/<year>.html`. Each element marked `data-out="name.gif"` becomes one file.

```
npx http-server scripts/art -p 8200
node scripts/cut.mjs 1999
```

`cut.mjs` screenshots each element with [agent-browser](https://github.com/vercel-labs/agent-browser) and converts it with ffmpeg. GIFs get a small dithered palette, JPEGs get a low quality setting (per element with `data-q`), and a few files are animated GIFs built from several frames. Output goes to `site/eras/<year>/img/`.

## Generated media

`scripts/generate.mjs` makes the 2026 film and photos from the prompts in `site/eras/2026/prompts.js`, then encodes them (AVIF stills, an H.264 film). `scripts/stock.mjs` makes single stills for the older eras. Both call kie.ai and read `KIE_API_KEY` from the environment or `~/.secrets/kie.env`.

## Adding a year

1. Add the entry to `eras.js` with the board numbers, and add their sources to `SOURCES`.
2. Build the page in `site/eras/<year>/` with that year's tools.
3. For a new browser or OS, add a `CHROME` and a `TASK` template in `shell.js`, its window class in `desk()`, and styles in `shell.css`. Phone overrides go in the last `@media` block of `shell.css`, after the era sections, or the era rules win.
4. Write the X-ray items, and check every `sel` matches something on the page.

## Deploy

`.github/workflows/pages.yml` runs `npm test` on pull requests. On a push to `main` it runs the tests again and publishes `site/` to GitHub Pages.
