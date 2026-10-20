# y2k.eladser.dev

A homepage from 1999 that still works, and what each piece of it turned into by 2026.

It opens with a 56K dial-up handshake. There's no audio file: the browser builds the sound sample by sample from the frequencies in the ITU V.8, V.21 and V.34 specs, then runs its own FFT to draw the spectrogram while you listen. After that the page "downloads" at 5 KB/s.

The 1999 page is real 1999 HTML: uppercase tags, `BGCOLOR`, a table layout, `<MARQUEE>`. The counter counts, and the guestbook takes entries (with the Y2K bug in its dates). The "Y2K patch" switches to the 2026 version, which puts the code from both years side by side:

| 1999 | 2026 |
| --- | --- |
| a US Robotics modem | Web Audio, built from the specs |
| `counter.cgi` and `count.txt` | a counting API pushing live updates over Server-Sent Events |
| `guestbook.pl` appending raw HTML | comments on [issue #1](https://github.com/eladser/y2k/issues/1), rendered as text |
| WS_FTP and `document.lastModified` | GitHub Actions stamping the commit into the page |
| `LOWSRC` and a 40 KB budget | measured page weight vs the 2,164 KB median |
| File > Work Offline | a service worker |

No framework, no build step, no server. Static files on GitHub Pages.

## Run it

```
npm run dev     # http://localhost:8199
npm test        # checks the synthesized tones and the FFT
```

## Sign the guestbook

[Leave a comment here](https://github.com/eladser/y2k/issues/1). It shows up on the page.
