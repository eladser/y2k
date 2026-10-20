// One row per departure on the board. `kbps` is effective throughput in KB/s, `page` the
// typical page weight that year in KB. Both get filled from sourced numbers only.
export const ERAS = [
  { year: 1996, browser: 'NETSCAPE NAVIGATOR 3', short: 'NETSCAPE 3', os: 'win95', conn: '28.8K MODEM', kbps: 3.6, page: 14.1, built: false },
  { year: 1999, browser: 'INTERNET EXPLORER 5', short: 'IE 5', os: 'win98', conn: '56K MODEM', kbps: 4.25, page: 44, built: false },
  {
    year: 2001, browser: 'INTERNET EXPLORER 6', short: 'IE 6', os: 'xp', chrome: 'ie6', conn: '56K MODEM', kbps: 4.25, page: 91, built: true,
    url: 'http://www.halcyonair.com/flash/index.html',
    title: 'HALCYON AIRWAYS :: The Sky. Redefined. - Microsoft Internet Explorer',
    stack: 'Macromedia Flash 5 · ActionScript 1.0 · OBJECT/EMBED',
    xray: [
      {
        name: 'Preloader',
        sel: '#loader',
        then: 'The whole site was one .swf file, and nothing played until enough of it had arrived. A loop on frame 1 asked the player how many bytes were in and moved a bar. At 56K, every 100 KB of movie was about 20 more seconds of watching it.',
        now: 'There is nothing to preload. The browser streams HTML and paints as bytes arrive, and anything heavy loads lazily, after the page is usable.',
        code: `// on the loader clip, frame 1
onClipEvent (enterFrame) {
    loaded = _root.getBytesLoaded();
    total = _root.getBytesTotal();
    pct = Math.round(loaded / total * 100);
    _root.bar._xscale = pct;
    _root.txt = "LOADING " + pct + "%";
    if (loaded >= total) {
        _root.gotoAndPlay("intro");
    }
}`,
      },
      {
        name: 'Skip intro',
        sel: '#skip',
        then: 'Every agency site opened with a 20 second animated intro, so every agency site also needed a button to get out of it. "Skip intro" turned into a running joke about the whole era.',
        now: 'The first thing on screen is the thing you came for. Motion is a short reveal, and it stops for anyone who set prefers-reduced-motion.',
        code: `// the SKIP INTRO button
on (release) {
    _root.gotoAndPlay("main");
}`,
      },
      {
        name: 'Rollover buttons',
        sel: '.nav',
        then: 'A Flash button was a symbol with four keyframes: Up, Over, Down and Hit. Designers dropped a "blip" sound on the Over frame. Screen readers saw nothing at all.',
        now: 'A real <a> or <button>, styled with :hover and :focus-visible. It works with a keyboard, a screen reader and a search engine for free.',
        code: `// button symbol timeline:
//   Up | Over | Down | Hit
// a "blip" sound sits on the Over frame
on (rollOver) {
    _root.status = "VIEW SCHEDULES";
}
on (release) {
    _root.content.gotoAndPlay("flights");
}`,
      },
      {
        name: 'Background music',
        sel: '#eq',
        then: 'The loop was an 8-bit WAV inside the .swf, which is a big part of why the file was so heavy. The tiny equalizer bars were the mute button, and you had to find it fast.',
        now: 'Autoplaying sound is blocked unless you clicked first. The loop you hear here is synthesized live with Web Audio, so it costs zero bytes to download.',
        code: `loop = new Sound();
loop.attachSound("techno_loop"); // linkage ID in the library
loop.start(0, 999);              // 999 loops is forever, close enough

// the equalizer bars
on (release) {
    loop.setVolume(muted ? 100 : 0);
    muted = !muted;
}`,
      },
      {
        name: 'Flight search',
        sel: '#search',
        then: 'Flash 5 could talk to the server without reloading the page, years before AJAX had a name. loadVariables posted the form to an ASP script, which answered with URL-encoded text that the player turned into variables.',
        now: 'fetch() sends JSON and gets JSON back, and the response is typed, cached and cancellable. The difference is mostly that it is plain HTML underneath, so it still works with JavaScript off.',
        code: `on (release) {
    from = fromBox.text;
    to = toBox.text;
    loadVariables("search.asp", this, "POST");
}
// search.asp answered with plain text:
// &count=3&f1=HA214 TLV LHR 08:40&f2=...&done=1&
onClipEvent (data) {
    gotoAndStop("results");
}`,
      },
      {
        name: 'Embedding the movie',
        sel: '#stage',
        then: 'Two tags for one movie: OBJECT with a classid for Internet Explorer\'s ActiveX control, EMBED inside it for Netscape. If the plugin was missing you got a grey box and a link to download it.',
        now: 'There is no plugin. Flash Player stopped running on January 12, 2021. Everything on this page is HTML, SVG and the Web Animations API.',
        code: `<OBJECT classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
  codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=5,0,0,0"
  WIDTH="760" HEIGHT="440">
  <PARAM NAME="movie" VALUE="halcyon.swf">
  <PARAM NAME="quality" VALUE="high">
  <PARAM NAME="scale" VALUE="showall">
  <EMBED src="halcyon.swf" quality="high" scale="showall"
    WIDTH="760" HEIGHT="440" TYPE="application/x-shockwave-flash"
    PLUGINSPAGE="http://www.macromedia.com/go/getflashplayer">
  </EMBED>
</OBJECT>`,
      },
      {
        name: 'Scale mode',
        sel: '#stage',
        then: 'The movie was drawn at 760 by 440 and scale="showall" stretched it to fit, letterboxing the rest in black. A small window got small text, and a big one got blurry bitmaps.',
        now: 'Layout reflows to the space it has. Text stays the size you chose, and images pick a resolution with srcset.',
        code: `Stage.scaleMode = "showAll";
// "noScale" kept pixels sharp but cropped the movie,
// "exactFit" filled the window and squashed everything`,
      },
    ],
  },
  { year: 2004, browser: 'FIREFOX 1.0', os: 'xp', conn: 'DSL 861K', kbps: 108, page: 93.7, built: false },
  { year: 2007, browser: 'FIREFOX 2', os: 'vista', conn: '2 MBPS', kbps: 246, page: 312, built: false },
  { year: 2012, browser: 'CHROME 23', os: 'win7', conn: '7.4 MBPS', kbps: 925, page: 738, built: false },
  {
    year: 2026, browser: 'CHROME 141', os: 'now', chrome: 'now', conn: '314 MBPS', kbps: 39294, page: 2987, built: true,
    url: 'halcyon.example',
    title: 'Halcyon · Where to next?',
    stack: 'HTML · CSS · a little JavaScript · no framework, no build step',
    xray: [
      {
        name: 'Round trip, without JavaScript',
        sel: '.trip',
        check: () => CSS.supports('selector(:has(a))'),
        then: 'Hiding the return date when you picked one-way took an onclick handler that toggled style.display, and it broke if the page loaded with the radio already checked.',
        now: 'One selector. The form looks at its own state with :has() and hides the return field.',
        code: `.search:has(#oneway:checked) .return {
  display: none;
}`,
      },
      {
        name: 'Passenger picker',
        sel: '.pax-btn, #pax:popover-open',
        check: () => 'popover' in HTMLElement.prototype,
        then: 'A hand-written dropdown: absolutely positioned div, a document click listener to close it, z-index fights with every other widget, and a bug report about it opening off screen.',
        now: 'The popover attribute handles opening, closing, Escape and focus. Anchor positioning keeps it attached to its button.',
        code: `<button class="pax-btn" popovertarget="pax">1 adult</button>
<div id="pax" popover>...</div>

.pax-btn { anchor-name: --pax; }
#pax {
  position-anchor: --pax;
  position-area: bottom span-right;
}`,
      },
      {
        name: 'Dates and airports',
        sel: '.when, .where',
        check: () => CSS.supports('appearance: base-select'),
        then: 'A jQuery UI datepicker and a select replacement plugin, with jQuery underneath both. They existed because native controls could not be styled.',
        now: 'Native <input type="date"> and a real <select> you can style down to the options, with appearance: base-select.',
        code: `<input type="date" name="depart">

select,
::picker(select) {
  appearance: base-select;
}`,
      },
      {
        name: 'Cards that fit their box',
        sel: '.grid',
        check: () => CSS.supports('container-type: inline-size'),
        then: 'Media queries could only ask how wide the window was, so the same card needed different classes depending on where it was placed.',
        now: 'Container queries. Each card looks at the width of its own container, so it works in a sidebar and in a full row without changes.',
        code: `.card { container-type: inline-size; }

/* the wide card and the narrow ones are the same markup */
@container (width > 520px) {
  .card-in { grid-template-columns: 1.2fr 1fr; }
}`,
      },
      {
        name: 'Reveal on scroll',
        sel: '.card',
        check: () => CSS.supports('animation-timeline: view()'),
        then: 'A scroll listener firing hundreds of times a second, getBoundingClientRect on every card, and a jQuery plugin to throttle it.',
        now: 'The animation is tied to scroll position in CSS and runs off the main thread. No JavaScript.',
        code: `.card {
  animation: rise linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 30%;
}`,
      },
      {
        name: 'Switching tabs',
        sel: '.tabs',
        check: () => 'startViewTransition' in document,
        then: 'Fading between two panels meant cloning nodes, absolute positioning, and a setTimeout that had to match the CSS duration.',
        now: 'One call. The browser snapshots the before and after states and morphs between them.',
        code: `tab.onclick = () =>
  document.startViewTransition(() => show(tab.dataset.panel));`,
      },
      {
        name: 'Color and type',
        sel: 'body',
        check: () => CSS.supports('color: light-dark(#000, #fff)'),
        then: 'A sprite of web-safe colors, and Verdana at 11px because it was installed everywhere. A dark mode meant a second stylesheet.',
        now: 'oklch colors, light-dark() for both themes in one declaration, and the system font, which is a variable font on every current OS. Zero font bytes.',
        code: `:root {
  color-scheme: light dark;
  --paper: light-dark(oklch(98.4% .006 230), oklch(17.5% .02 252));
  font-family: system-ui, sans-serif;
}
h1 { font-weight: 720; text-wrap: balance; }`,
      },
    ],
  },
];

export const NOTE = 'Typical page is the nearest year with published data: 1996 uses 1995, 1999 uses 1997, 2004 uses 2003, 2007 uses January 2008. Download is page weight divided by connection speed, before latency and JavaScript, which is most of the wait today.';

export const SOURCES = [
  ['Page weight 1995 and 2003', 'websiteoptimization.com series, via HTTP Archive', 'https://discuss.httparchive.org/t/page-weight-in-1995/2626'],
  ['Page weight 1997', 'Nielsen Norman Group', 'https://www.nngroup.com/articles/size-limits-for-web-pages/'],
  ['Page weight 2001, 300 top home pages', 'Byte Level Research, via Dylan Tweney', 'https://dylan.tweney.com/?p=1992'],
  ['Page weight January 2008', 'Gomez, via websiteoptimization.com', 'https://www.websiteoptimization.com/speed/tweak/average-web-page/'],
  ['Median desktop page 2012 and 2026', 'HTTP Archive', 'https://httparchive.org/reports/page-weight'],
  ['28.8K was the most common modem in 1996', 'GVU 6th WWW User Survey', 'https://sites.cc.gatech.edu/gvu/user_surveys/survey-10-1996/graphs/use/Connection_Speed.html'],
  ['Dial-up averaged 34 kbps, DSL 861 kbps', 'comScore, 2004', 'https://www.comscore.com/Insights/Press-Releases/2004/04/National-Average-Download-Speeds'],
  ['US median 1.97 Mbps in 2007', 'CWA Speed Matters', 'https://benton.org/content/speed-matters-report-internet-speeds-all-50-states'],
  ['US average 7.4 Mbps, Q4 2012', 'Akamai State of the Internet', 'https://telecompaper.com/news/average-web-connection-speed-rises-5-in-q4-2012-akamai--939163'],
  ['US median fixed broadband 314 Mbps, September 2026', 'Ookla Speedtest Global Index', 'https://www.speedtest.net/global-index'],
];
