import { FILM, PHOTOS, LOOK } from './eras/2026/prompts.js';

// One row per departure on the board. `kbps` is effective throughput in KB/s, `page` the
// typical page weight that year in KB. Both get filled from sourced numbers only.
export const ERAS = [
  {
    year: 1996, browser: 'NETSCAPE NAVIGATOR 3', short: 'NETSCAPE 3', os: 'win95', chrome: 'nn3', conn: '28.8K MODEM', kbps: 3.6, page: 14.1, built: true,
    url: 'http://www.halcyonair.com/',
    title: 'Netscape - [Halcyon Airways Home Page]',
    stack: 'HTML 3.2 · Netscape extensions · JavaScript 1.0 · a CGI counter',
    xray: [
      {
        name: 'The status bar ticker',
        sel: null,
        then: 'A message crawling along the bottom of the window, written into window.status ten times a second. It was in every JavaScript tutorial of 1996. Watch the status bar of this Netscape window once the page has loaded.',
        now: 'Browsers stopped letting pages write there, because a fake status line could hide where a link really went. The bottom of the window now only shows real link targets.',
        code: `var msg = "Welcome to Halcyon Airways!     Fly with us...";
var pos = 0;

function scroller() {
  window.status = msg.substring(pos, msg.length) +
                  msg.substring(0, pos);
  pos = (pos + 1) % msg.length;
  setTimeout("scroller()", 150);
}

<BODY onLoad="scroller()">`,
      },
      {
        name: 'Image map',
        sel: 'img[usemap]',
        then: 'One GIF of the route map, and invisible circles drawn over it in HTML. Each circle is a link. Click a city on the map to try it.',
        now: 'An SVG map where every city is a real element with its own link, so it scales, reads aloud, and stays sharp.',
        code: `<IMG SRC="img/routes.gif" WIDTH="420" HEIGHT="210"
     BORDER="0" USEMAP="#routes">
<MAP NAME="routes">
<AREA SHAPE="circle" COORDS="120,60,14" HREF="#london">
<AREA SHAPE="circle" COORDS="150,95,14" HREF="#paris">
<AREA SHAPE="default" NOHREF>
</MAP>`,
      },
      {
        name: 'Animated GIF',
        sel: 'img[src*="plane"]',
        then: 'Netscape 2 learned to play GIF89a animations in 1995, and the web filled up with spinning globes and flying envelopes. Six frames, 32 colors, looping forever.',
        now: 'CSS and SVG animation, video, or Lottie. And prefers-reduced-motion, so anyone who finds it distracting can turn it off.',
        code: `<IMG SRC="img/plane.gif" WIDTH="160" HEIGHT="44" ALT="">

GIF89a, 160 x 44, 6 frames at 5 fps,
NETSCAPE2.0 application extension: loop forever`,
      },
      {
        name: 'Hit counter',
        sel: 'img[name="c1"]',
        then: 'The counter was an image from a CGI program on the server, which added one to a file and drew the digits. The number on this page is real: it counts visits to this 1996 page.',
        now: 'Analytics, out of sight. Public counters went away, mostly because the number was embarrassing.',
        code: `You are visitor number
<IMG SRC="/cgi-bin/Count.cgi?df=halcyon.dat&dd=A&ft=0">
since June 1, 1996.`,
      },
      {
        name: 'The mailto form',
        sel: 'form',
        then: 'No server code needed: the form was e-mailed to the webmaster by the visitor\'s own mail program, and Netscape warned you first. The webmaster then copied the answers out of the e-mail by hand.',
        now: 'The form posts to the server with fetch, the server validates it and stores it, and nobody\'s mail client gets involved.',
        code: `<FORM ACTION="mailto:webmaster@halcyonair.com"
      METHOD="POST" ENCTYPE="text/plain">
Your name: <INPUT TYPE="text" NAME="name" SIZE="30">
<TEXTAREA NAME="comments" ROWS="4" COLS="50"></TEXTAREA>
<INPUT TYPE="submit" VALUE="Send">
</FORM>`,
      },
      {
        name: 'Netscape extensions',
        sel: 'blink',
        then: 'HTML had no way to style text, so Netscape invented its own tags: <FONT>, <CENTER> and the famous <BLINK>. Internet Explorer answered with <MARQUEE>. Pages were built for one browser and said so at the bottom.',
        now: 'Styling lives in CSS, and HTML only says what things are. Firefox dropped <BLINK> in 2013; this one blinks because the page brings its own CSS.',
        code: `<CENTER>
<BLINK><FONT COLOR="#CC0000"><B>NEW!</B></FONT></BLINK>
Our fares and schedules are now on the Internet!
</CENTER>

This page is best viewed with Netscape Navigator 2.0
or later at 640 x 480.`,
      },
    ],
  },
  {
    year: 1999, browser: 'INTERNET EXPLORER 5', short: 'IE 5', os: 'win98', chrome: 'ie5', conn: '56K MODEM', kbps: 4.25, page: 44, built: true, dialup: true,
    url: 'http://www.halcyonair.com/',
    title: 'Halcyon Airways - Welcome - Microsoft Internet Explorer',
    stack: 'HTML 4.0 frames · tables and spacer GIFs · JavaScript 1.2 · DHTML · a Perl CGI',
    xray: [
      {
        name: 'Dialing in',
        sel: null,
        then: 'Every visit started with the modem: about twenty seconds of handshake, and nobody could phone the house while you were online. The sound you heard is built live from the ITU frequencies, not a recording.',
        now: 'The connection is there before you open the browser. Nobody thinks about it until the Wi-Fi drops.',
        code: `; Dial-Up Networking > Halcyon Online > Properties
AT&F1 S7=60 L2 M1
; L2  speaker volume medium
; M1  speaker on until the carrier locks
ATDT 555-1999`,
      },
      {
        name: 'Frames',
        sel: 'frameset',
        then: 'The banner and buttons lived in one frame and the content in another, so only the bottom half reloaded when you clicked. Bookmarks always pointed at the frameset, Back went back inside one frame, and search engines indexed the pieces separately.',
        now: 'One document with a sticky header. History, bookmarks and search engines all see real pages.',
        code: `<FRAMESET ROWS="108,*" FRAMEBORDER="0" BORDER="0">
  <FRAME SRC="top.html" NAME="top" SCROLLING="no" NORESIZE>
  <FRAME SRC="home.html" NAME="main">
  <NOFRAMES>This site uses frames, but your browser
    doesn't support them.</NOFRAMES>
</FRAMESET>

<A HREF="home.html#book" TARGET="main">...</A>`,
      },
      {
        name: 'Rollover buttons',
        sel: 'frame[name="top"]',
        then: 'Each button was two GIFs, cut from one Photoshop file. JavaScript swapped the picture on mouseover, and the "on" states were preloaded so the first hover didn\'t flash. Dreamweaver wrote this for you as MM_swapImage().',
        now: 'A real link with text in it, styled with :hover and :focus-visible. One element, no images, and it works with a keyboard.',
        code: `<A HREF="home.html#book" TARGET="main"
  onMouseOver="swapImage('nav2','img/nav_fares_on.gif')"
  onMouseOut="restoreImage()"><IMG NAME="nav2"
  SRC="img/nav_fares.gif" WIDTH="126" HEIGHT="24"></A>

function swapImage(name, src) {
  var img = document.images[name];
  img.oldSrc = img.src;
  img.src = src;
  swapped = img;
}`,
      },
      {
        name: 'Tables and spacer.gif',
        sel: 'frame[name="main"]',
        then: 'Layout was a table 760 pixels wide, because most screens were 800 by 600. Gaps were a transparent 1x1 GIF stretched to whatever size was needed. Fonts were Verdana at 11px, because it was on every PC and still readable that small.',
        now: 'CSS grid, gap, and widths that follow the window. The spacer is gone; it was 43 bytes and it was everywhere.',
        code: `<TABLE WIDTH="760" BORDER="0" CELLPADDING="0"
       CELLSPACING="0" ALIGN="center">
<TR>
<TD WIDTH="160" VALIGN="top" BGCOLOR="#EEEEFF">...</TD>
<TD WIDTH="10"><IMG SRC="img/spacer.gif"
    WIDTH="10" HEIGHT="1" ALT=""></TD>
<TD WIDTH="420" VALIGN="top">...</TD>`,
      },
      {
        name: 'DHTML menus',
        sel: 'frame[name="main"]',
        then: 'Netscape 4 and IE 4 each had their own idea of a movable element, so every menu script started by asking which browser it was in. Hover Quick Links on the left to see one.',
        now: 'One standard DOM. A menu like this is a few lines of CSS with :hover and :focus-within, or a popover.',
        code: `function getLayer(id) {
  if (document.getElementById)
    return document.getElementById(id).style;
  if (document.all) return document.all[id].style;
  if (document.layers) return document.layers[id];
}

function showMenu(id) {
  clearTimeout(menuTimer);
  hideMenus();
  var m = getLayer(id);
  m.visibility = document.layers ? "show" : "visible";
}`,
      },
      {
        name: 'Booking form',
        sel: 'frame[name="main"]',
        then: 'Month and day dropdowns, no year, an alert() when you got it wrong, and a full page reload to a Perl script on the server. The results page you get here is built in the browser instead.',
        now: 'A date input, validation the browser does itself, and results that load without leaving the page.',
        code: `<FORM ACTION="/cgi-bin/booking.pl" METHOD="GET"
      onSubmit="return checkForm(this)">

function checkForm(f) {
  if (f.from.selectedIndex == f.to.selectedIndex) {
    alert("Please choose two different cities.");
    f.to.focus();
    return false;
  }
  return true;
}`,
      },
      {
        name: 'Pop-up windows',
        sel: null,
        then: 'Anything extra opened in a new, smaller window with the toolbars switched off. Try About Us or the Y2K badge. A real window.open would leave this page, so the pop-up is drawn on the desktop instead.',
        now: '<dialog>, opened in the same page, closed with Escape, and never blocked by a pop-up blocker.',
        code: `window.open("y2k.html", "halcyon",
  "width=440,height=380,toolbar=no,location=no," +
  "scrollbars=yes,resizable=no");`,
      },
      {
        name: 'Two-digit years',
        sel: null,
        then: 'getYear() returned 99 in 1999. On January 1, 2000 Netscape returned 100 and Internet Explorer returned 2000, so pages that added 1900 printed the year 19100. The footer of this page still uses the old code.',
        now: 'getFullYear(), ISO 8601 dates, and Intl.DateTimeFormat to show them in the reader\'s format.',
        code: `function today() {
  var d = new Date();
  return (d.getMonth() + 1) + "/" + d.getDate() + "/" +
         (d.getYear() % 100);
}
// the classic bug:  "19" + d.getYear()  ->  "19100"`,
      },
    ],
  },
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
  {
    year: 2007, browser: 'FIREFOX 2', os: 'vista', chrome: 'ff2', conn: '2 MBPS', kbps: 246, page: 312, built: true,
    url: 'http://www.halcyon.com/',
    tab: 'halcyon. fly smarter. (beta)',
    title: 'halcyon. fly smarter. (beta) - Mozilla Firefox',
    stack: 'XHTML 1.0 Strict · CSS 2.1 with hacks · jQuery 1.2.1 · AJAX',
    xray: [
      {
        name: 'AJAX search',
        sel: '#search',
        then: 'Type two letters and the airports appear, with no page reload. Google Suggest and Google Maps made this the definition of Web 2.0 in 2005. Every keystroke went to a PHP script on the server, and the spinner was a GIF from ajaxload.info.',
        now: 'fetch(), an AbortController so stale keystrokes cancel, and a native <datalist> or a combobox for the list itself.',
        code: `$("#from, #to").keyup(function () {
  var input = this;
  clearTimeout(typing);
  typing = setTimeout(function () { suggest(input); }, 250);
});

$.getJSON("data/airports.json", function (data) {
  $.each(data, function (i, a) {
    if (a.city.toLowerCase().indexOf(q) == 0)
      html += "<li><b>" + a.code + "</b> " + a.city + "</li>";
  });
  list.html(html).show();
});`,
      },
      {
        name: 'jQuery 1.2.1',
        sel: 'body',
        then: 'This page runs the real jQuery 1.2.1, released in September 2007 and called "New Wave Javascript". One file papered over the differences between IE6, Firefox and Safari, and $() with chaining changed how people wrote JavaScript.',
        now: 'querySelectorAll, fetch, classList and the Web Animations API are built into every browser. The differences jQuery hid are mostly gone.',
        code: `$("#lb-overlay").css("opacity", 0).show().fadeTo(250, 0.8);
$("#lb").fadeIn(300);

// 2026
dialog.showModal();`,
      },
      {
        name: 'Gloss and reflections',
        sel: '#header',
        then: 'The glossy logo, its wet-floor reflection and the BETA starburst are one flat image. Gradients, shadows and reflections all came out of Photoshop, so changing a word meant re-exporting the picture.',
        now: 'Gradients, shadows and masks are CSS, and a reflection is a few lines. Text stays text, so it can be translated, selected and read aloud.',
        code: `<div id="header"><a href="#"><img src="img/header.png"
  width="900" height="118"
  alt="halcyon. fly smarter. book faster. share everything." /></a></div>`,
      },
      {
        name: 'CSS sprites',
        sel: '#nav',
        then: 'Both states of a tab sat in one image, one above the other. Hover slid the background up 34 pixels, so the second state was already loaded and nothing flickered.',
        now: 'CSS gradients and borders for the shape, an SVG icon if it needs one, and :hover changes a color instead of a picture.',
        code: `#nav a {
  width: 132px; height: 34px;
  background: url(img/nav.png) 0 0 no-repeat;
}
#nav a:hover, #nav li.current a {
  background-position: 0 -34px;
}`,
      },
      {
        name: 'Rounded corners',
        sel: '.box',
        then: 'Firefox and Safari each had their own property for rounded corners, and Internet Explorer had none, so IE users saw square boxes. The fallback was four corner images per box.',
        now: 'border-radius has worked everywhere for over a decade. The last line of the snippet is the only one a browser in 2026 still reads.',
        code: `.box {
  -moz-border-radius: 10px;    /* Firefox 2 */
  -webkit-border-radius: 10px; /* Safari 3 */
  border-radius: 10px;         /* everyone, eventually */
}`,
      },
      {
        name: 'Floats and IE6 hacks',
        sel: '#main',
        then: 'Columns were floats, and a float didn\'t make its container grow, so every layout carried a clearfix. IE6 needed its own lines, hidden from other browsers with the * html selector, and a proprietary filter just to show a PNG with transparency.',
        now: 'Grid and flexbox were made for layout. Every browser updates itself, so there is no IE6 to write around.',
        code: `.clearfix:after {
  content: "."; display: block; height: 0;
  clear: both; visibility: hidden;
}
* html .clearfix { height: 1%; }  /* IE6 only */

* html img.png {
  filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(
    src='img/header.png', sizingMethod='crop');
}`,
      },
      {
        name: 'Lightbox',
        sel: '#dests',
        then: 'Click a photo and the page dims behind it. Lightbox was the most copied script of 2006 and 2007. It was a fixed div, a black overlay at 80% opacity, and fades written by hand.',
        now: '<dialog> with showModal(): a backdrop, focus handling and Escape to close, all built in.',
        code: `$("#dests a").click(function () {
  $("#lb-img").attr("src", this.href);
  $("#lb-caption").text(this.title);
  $("#lb-overlay").css("opacity", 0).show().fadeTo(250, 0.8);
  $("#lb").fadeIn(300);
  return false;
});`,
      },
    ],
  },
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
        sel: '.nav, .ask',
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
