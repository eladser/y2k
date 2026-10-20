import { FILM, PHOTOS, LOOK } from './eras/2026/prompts.js';

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
  { year: 2020, browser: 'CHROME 87', os: 'win10', conn: '86 MBPS', kbps: 10755, page: 2000, built: false },
  {
    year: 2026, browser: 'CHROME 153', os: 'now', chrome: 'now', conn: '314 MBPS', kbps: 39294, page: 2987, built: true,
    url: 'halcyon.example',
    title: 'Halcyon · Fly somewhere that feels like June',
    stack: 'AI-generated film and photos · liquid glass · on-device AI · scroll-driven motion',
    xray: [
      {
        name: 'The hero film',
        sel: '.film',
        then: 'A chase plane, a camera crew, a week in an edit suite, or a stock clip licensed per seat. Most airline sites used a photo, because video was too expensive to make and too heavy to send.',
        now: 'One paragraph of text. This shot was generated by Google Veo 3 through kie.ai, and the prompt below was the entire brief.',
        wrap: true,
        code: `${FILM.model}\n\n${FILM.prompt}`,
      },
      {
        name: 'Destination photos',
        sel: '.bento',
        then: 'A photographer on location or a stock library, and a spreadsheet tracking which licence covered which page.',
        now: 'Each photo was generated from one sentence. None of these exact scenes exists anywhere.',
        wrap: true,
        code: PHOTOS.map(p => `${p.city}: ${p.prompt.replace(LOOK, '').trim()}`).join('\n\n') + `\n\nEvery prompt ends with: ${LOOK}`,
      },
      {
        name: 'Liquid glass',
        sel: '.glass',
        check: () => CSS.supports('backdrop-filter: blur(1px)'),
        then: 'Translucency was a pre-rendered PNG with an alpha channel. A blurred panel meant shipping a second, blurred copy of the background image and lining the two up by hand.',
        now: 'backdrop-filter blurs and bends whatever is behind the element, live, including a playing video. An SVG displacement map adds the lens edge.',
        code: `.glass {
  backdrop-filter: blur(16px) saturate(1.7);
  background: oklch(100% 0 0 / .08);
  box-shadow: inset 0 1px 0 oklch(100% 0 0 / .45);
}
/* Chromium also takes an SVG filter for the bent edge */
.glass { backdrop-filter: url(#lens) blur(16px) saturate(1.7); }`,
      },
      {
        name: 'Type that moves',
        sel: 'h1',
        check: () => CSS.supports('animation-timeline: scroll()'),
        then: 'Headlines were images, or sIFR: a tiny Flash movie per headline, so the font could be anything other than Verdana.',
        now: 'One variable font file with weight and width axes. A registered custom property turns scroll position into a plain number, and that number drives the axes, so the headline narrows and thins as you leave the hero. No JavaScript.',
        code: `@property --s { syntax: '<number>'; inherits: true; initial-value: 0; }

h1 {
  font-variation-settings: 'wdth' calc(112 - var(--s) * 37),
                           'wght' calc(740 - var(--s) * 480);
  animation: squeeze linear both;
  animation-timeline: scroll();
  animation-range: 0 70vh;
}
@keyframes squeeze { to { --s: 1; } }`,
      },
      {
        name: 'Ask Halcyon',
        sel: '.ask',
        check: () => 'LanguageModel' in self,
        then: 'Six dropdowns and a date picker, because the computer could not read a sentence. "Somewhere warm" was not a field.',
        now: 'You describe the trip. If your Chrome has Gemini Nano, the model runs on your own machine through the Prompt API and nothing you type leaves the page. Without it, a plain keyword match takes over and says so.',
        code: `const ai = await LanguageModel.create({
  initialPrompts: [{ role: 'system', content: ROUTES }],
});
const answer = await ai.prompt(question, {
  responseConstraint: SCHEMA, // JSON: { city, why }
});`,
      },
      {
        name: 'Spring motion',
        sel: '.bento',
        check: () => CSS.supports('transition-timing-function: linear(0, 1)'),
        then: 'Bouncy easing meant a JavaScript animation library and a requestAnimationFrame loop for every hover.',
        now: 'linear() describes the spring curve as a list of points, so the overshoot and settle happen in CSS.',
        code: `.tile img {
  transition: scale .8s linear(0, .55 12%, 1.08 32%, .98 52%, 1.01 72%, 1);
}
.tile:hover img { scale: 1.06; }`,
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
  ['Median desktop page 2012, 2020 and 2026', 'HTTP Archive', 'https://httparchive.org/reports/page-weight'],
  ['28.8K was the most common modem in 1996', 'GVU 6th WWW User Survey', 'https://sites.cc.gatech.edu/gvu/user_surveys/survey-10-1996/graphs/use/Connection_Speed.html'],
  ['Dial-up averaged 34 kbps, DSL 861 kbps', 'comScore, 2004', 'https://www.comscore.com/Insights/Press-Releases/2004/04/National-Average-Download-Speeds'],
  ['US median 1.97 Mbps in 2007', 'CWA Speed Matters', 'https://benton.org/content/speed-matters-report-internet-speeds-all-50-states'],
  ['US median fixed broadband 86 Mbps, Q2 2020', 'Ookla, via Fierce Network', 'https://www.fierce-network.com/telecom/ookla-verizon-fastest-fixed-u-s-broadband-isp-while-spectrum-chalks-up-highest-consistency'],
  ['US average 7.4 Mbps, Q4 2012', 'Akamai State of the Internet', 'https://telecompaper.com/news/average-web-connection-speed-rises-5-in-q4-2012-akamai--939163'],
  ['US median fixed broadband 314 Mbps, September 2026', 'Ookla Speedtest Global Index', 'https://www.speedtest.net/global-index'],
];
