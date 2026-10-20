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
        then: 'A message crawling along the bottom of the window, rewritten into window.status ten times a second. Every JavaScript tutorial of 1996 had one. Watch this window\'s status bar once the page loads.',
        now: 'Browsers stopped letting pages write there, since a fake status line could hide where a link really went. Now it only shows real link targets.',
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
        then: 'One GIF of the route map with invisible circles drawn over it in HTML, each one a link. Click a city to try it.',
        now: 'An SVG map where each city is a real element with its own link. It stays sharp at any size, and a screen reader can read it.',
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
        now: 'CSS or SVG animation, video, or Lottie. If the motion bothers you, prefers-reduced-motion turns it off.',
        code: `<IMG SRC="img/plane.gif" WIDTH="160" HEIGHT="44" ALT="">

GIF89a, 160 x 44, 6 frames at 5 fps,
NETSCAPE2.0 application extension: loop forever`,
      },
      {
        name: 'Hit counter',
        sel: 'img[name="c1"]',
        then: 'The counter was an image from a CGI program on the server that added one to a file and drew the digits. The number here is real and counts visits to this 1996 page.',
        now: 'Analytics, out of sight. Public counters went away, mostly because the number was embarrassing.',
        code: `You are visitor number
<IMG SRC="/cgi-bin/Count.cgi?df=halcyon.dat&dd=A&ft=0">
since June 1, 1996.`,
      },
      {
        name: 'The mailto form',
        sel: 'form',
        then: 'No server code at all. Netscape warned you, then your own mail program e-mailed the form to the webmaster, who copied the answers out by hand.',
        now: 'fetch posts the form to a server that checks and stores it. Nobody\'s mail client is involved.',
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
        then: 'HTML had no way to style text, so Netscape invented its own tags, like <FONT>, <CENTER> and <BLINK>. Internet Explorer answered with <MARQUEE>. Pages were built for one browser and said so at the bottom.',
        now: 'Styling lives in CSS, and HTML only says what things are. Firefox dropped <BLINK> in 2013. This one only blinks because the page brings its own CSS.',
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
        then: 'Every visit started with the modem. About twenty seconds of handshake, and nobody could phone the house while you were online. The sound you heard is built live from the ITU frequencies. No recording.',
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
        then: 'The banner and buttons lived in one frame and the content in another, so a click only reloaded the bottom half. Bookmarks always pointed at the frameset and search engines indexed the pieces separately. Back went back inside one frame.',
        now: 'One document with a sticky header, so history, bookmarks and search engines see real pages.',
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
        then: 'Each button was two GIFs cut from one Photoshop file. JavaScript swapped the picture on mouseover, with the "on" states preloaded so the first hover didn\'t flash. Dreamweaver wrote it for you as MM_swapImage().',
        now: 'A single text link styled with :hover and :focus-visible. No images, and it works from the keyboard.',
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
        then: 'Layout was a table 760 pixels wide, since most screens were 800 by 600. Gaps were a transparent 1x1 GIF stretched to whatever size you needed. Text was Verdana at 11px, because every PC had it and it stayed readable that small.',
        now: 'CSS grid, gap, and widths that follow the window. The spacer is gone. It was 43 bytes and it was everywhere.',
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
        then: 'Month and day dropdowns with no year, an alert() when you got it wrong, then a full page reload to a Perl script on the server. Here the results page is built in the browser instead.',
        now: 'A date input the browser validates itself, and results that load without leaving the page.',
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
        then: 'Anything extra opened in a smaller new window with the toolbars off. Try About Us or the Y2K badge. A real window.open would leave this page, so here the pop-up is drawn on the desktop.',
        now: 'A <dialog> in the same page. Escape closes it, and pop-up blockers leave it alone.',
        code: `window.open("y2k.html", "halcyon",
  "width=440,height=380,toolbar=no,location=no," +
  "scrollbars=yes,resizable=no");`,
      },
      {
        name: 'Two-digit years',
        sel: null,
        then: 'getYear() returned 99 in 1999. On January 1, 2000, Netscape returned 100 and Internet Explorer 2000, so pages that wrote "19" in front of it printed the year 19100. This page\'s footer still runs the old code.',
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
        now: 'Nothing to preload. The browser paints HTML as the bytes arrive, and anything heavy loads lazily once the page is usable.',
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
        then: 'Every agency site opened with a 20 second animated intro, so every agency site also needed a button to get out of it. "Skip intro" became the running joke of the era.',
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
        now: 'A plain <a> or <button> with :hover and :focus-visible, which keyboards, screen readers and search engines already understand.',
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
        then: 'The loop was an 8-bit WAV inside the .swf, a big part of why the file was so heavy. The tiny equalizer bars were the mute button, and you had to find it fast.',
        now: 'Browsers block autoplaying sound until you click. The loop here is synthesized live with Web Audio, so there\'s nothing to download.',
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
        now: 'fetch() sends JSON and gets JSON back, and the response can be typed, cached or cancelled. The bigger change is plain HTML underneath, so the search still works with JavaScript off.',
        code: `// the two input boxes are bound to the variables "from" and "to"
on (release) {
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
        now: 'No plugin. Flash Player stopped running on January 12, 2021, and everything on this page is HTML, SVG and the Web Animations API.',
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
        code: `<PARAM NAME="scale" VALUE="showall">
<EMBED src="halcyon.swf" scale="showall" ...>

<!-- "noborder" filled the window and cropped the edges,
     "exactfit" filled it and squashed everything -->`,
      },
    ],
  },
  {
    year: 2004, browser: 'FIREFOX 1.0', os: 'xp', chrome: 'ff1', conn: 'DSL 861K', kbps: 108, page: 93.7, built: true,
    url: 'http://www.halcyonair.com/',
    title: 'Halcyon Airways | Cheap flights from Tel Aviv to Europe and New York - Mozilla Firefox',
    stack: 'XHTML 1.0 · CSS layout, no tables · A List Apart techniques',
    xray: [
      {
        name: 'Layout without tables',
        sel: '#wrapper',
        then: 'The big change of 2003 and 2004 was content in plain HTML and layout in CSS. Two floated columns, a clearing trick at the bottom, and a background image faking equal heights, because CSS had no way to say "same height as the one next to it". The fake was called faux columns.',
        now: 'Grid. Columns are equal height by default, and the layout can change completely without touching the HTML.',
        code: `#wrapper {
  background: url(../img/faux.gif) repeat-y;
}
#content { float: left; width: 480px; }
#sidebar { float: right; width: 220px; }

#wrapper:after {
  content: "."; display: block; height: 0;
  clear: both; visibility: hidden;
}`,
      },
      {
        name: 'Sliding doors',
        sel: '#nav',
        then: 'Tabs that stretch to fit their label, made from two images: a thin left edge on the list item and a wide right side on the link, sliding over each other. Both hover states sit in the same files, 150 pixels down. Douglas Bowman, A List Apart, 2003.',
        now: 'border-radius and a background colour. The label can be any length and nothing needs an image.',
        code: `#nav li {
  float: left;
  padding-left: 9px;
  background: url(../img/tab-left.gif) no-repeat left top;
}
#nav a {
  display: block;
  padding: 5px 15px 4px 6px;
  background: url(../img/tab-right.gif) no-repeat right top;
}
#nav li:hover { background-position: 0% -150px; }
#nav li:hover a { background-position: 100% -150px; }`,
      },
      {
        name: 'Image replacement',
        sel: '#logo',
        then: 'The logo is a real <h1> with real text, pushed 9999 pixels off screen and swapped for a background image. Search engines and screen readers got the text, everyone else got the picture. There were a dozen competing versions of the trick.',
        now: 'An inline SVG with a title, or real text in a web font. Nothing has to hide.',
        code: `<h1 id="logo"><a href="index.html">Halcyon Airways</a></h1>

#logo {
  width: 300px;
  height: 60px;
  background: url(../img/logo.gif) no-repeat;
  text-indent: -9999px;
}`,
      },
      {
        name: 'Style switcher',
        sel: '#styles',
        then: 'Separate the content from the look and you can swap the look. Alternate style sheets, switched with a small script and remembered in a cookie, gave readers high contrast or large text. Try it in the sidebar. Paul Sowden, A List Apart, 2001.',
        now: 'The page picks up the reader\'s system settings through prefers-color-scheme and prefers-contrast, and text sized in rem scales with browser zoom.',
        code: `<link rel="stylesheet" href="css/main.css" title="Default" />
<link rel="alternate stylesheet" href="css/contrast.css"
      title="High contrast" />

function setActiveStyleSheet(title) {
  for (i = 0; (a = document.getElementsByTagName("link")[i]); i++) {
    if (a.getAttribute("rel").indexOf("style") != -1
        && a.getAttribute("title")) {
      a.disabled = true;
      if (a.getAttribute("title") == title) a.disabled = false;
    }
  }
  createCookie("style", title, 365);
}`,
      },
      {
        name: 'The box model hack',
        sel: '#sidebar',
        then: 'Internet Explorer 5 counted padding inside the width and every other browser added it outside, so the same CSS gave two different widths. Tantek Celik\'s hack hid the second width from IE5 behind a parser bug in voice-family.',
        now: 'box-sizing: border-box, and browsers that agree. Since 2021 the browser makers have fixed their differences together each year through Interop.',
        code: `#sidebar {
  width: 240px;   /* IE5 reads this, then chokes */
  padding: 15px 10px;
  voice-family: "\\"}\\"";
  voice-family: inherit;
  width: 220px;   /* everyone else */
}
html>body #sidebar { width: 220px; }`,
      },
      {
        name: 'Web standards',
        sel: '.getff',
        then: '"Best viewed in" notices gave way to pages that validated, passed accessibility checks and worked in any browser. Firefox 1.0 shipped in November 2004, and its fans paid for a two-page ad in the New York Times.',
        now: 'Browsers follow the same specs now and update themselves every few weeks.',
        code: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<p>Valid XHTML 1.0 and CSS.
   Accessible to WCAG 1.0 AA.</p>`,
      },
      {
        name: 'RSS',
        sel: '.feed',
        then: 'A feed of new fares that people subscribed to in a reader instead of visiting the site. Firefox 1.0 noticed the feed and showed the orange icon in its status bar, bottom right.',
        now: 'E-mail newsletters and app notifications took most of that job. RSS still runs underneath podcasts.',
        code: `<link rel="alternate" type="application/rss+xml"
      title="Halcyon web fares" href="/fares.rss" />`,
      },
    ],
  },
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
        then: 'Type two letters and the airports show up without a page reload. Google Suggest and Google Maps made this the definition of Web 2.0 in 2005. Each keystroke hit a PHP script on the server, and the spinner was a GIF from ajaxload.info.',
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
        then: 'This page runs the original jQuery 1.2.1, released in September 2007 and billed as "New Wave Javascript". One file papered over the differences between IE6, Firefox and Safari, and $() with chaining changed how people wrote JavaScript.',
        now: 'querySelectorAll, fetch, classList and the Web Animations API are built into every browser. The differences jQuery hid are mostly gone.',
        code: `$("#lb-overlay").css("opacity", 0).show().fadeTo(250, 0.8);
$("#lb").fadeIn(300);

// 2026
dialog.showModal();`,
      },
      {
        name: 'Gloss and reflections',
        sel: '#header',
        then: 'The glossy logo, its wet-floor reflection and the BETA starburst are one flat image. Every effect came out of Photoshop, so changing one word meant re-exporting the picture.',
        now: 'Gradients, shadows and masks are CSS, and a reflection takes a few lines. The words stay real text you can select, translate or have read aloud.',
        code: `<div id="header"><a href="#"><img src="img/header.png"
  width="900" height="118"
  alt="halcyon. fly smarter. book faster. share everything." /></a></div>`,
      },
      {
        name: 'CSS sprites',
        sel: '#nav',
        then: 'Both states of a tab sat in one image, one above the other. Hover slid the background up 34 pixels, so the second state was already loaded and nothing flickered.',
        now: 'CSS draws the shape with gradients and borders, and :hover changes a color instead of a picture. Icons, if any, are SVG.',
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
        now: 'border-radius has worked everywhere for over a decade. Firefox dropped the -moz- version long ago. The -webkit- one still works, kept for old sites.',
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
        now: 'Grid and flexbox were made for layout. Browsers update themselves, so there\'s no IE6 left to write around.',
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
        then: 'Click a photo and the page dims behind it. Lightbox was the most copied script of 2006 and 2007: a fixed div, a black overlay at 80% opacity, and fades written by hand.',
        now: '<dialog> and showModal() come with the backdrop, focus handling and Escape to close.',
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
  {
    year: 2012, browser: 'CHROME 23', os: 'win7', chrome: 'ch23', conn: '7.4 MBPS', kbps: 925, page: 738, built: true,
    url: 'www.halcyonair.com',
    tab: 'Halcyon Airways - Cheap flights from Tel Aviv',
    title: 'Halcyon Airways - Cheap flights from Tel Aviv - Google Chrome',
    stack: 'HTML5 · Bootstrap 2.2.1 · jQuery 1.8.3 · responsive',
    xray: [
      {
        name: 'Responsive design',
        sel: '.navbar',
        then: 'Ethan Marcotte named it in A List Apart in 2010. A fluid grid, flexible images and media queries let one page fit a phone and a desktop. Drag this window\'s bottom-right corner to make it narrow, and the menu folds into the three-line button while the columns stack.',
        now: 'Mobile first is the default, since phones bring most of the traffic. Container queries let a component respond to its own space instead of the whole screen.',
        code: `<meta name="viewport"
      content="width=device-width, initial-scale=1.0">

@media (max-width: 767px) {
  .container { width: auto; }
  [class*="span"] {
    display: block; float: none;
    width: 100%; margin-left: 0;
  }
}`,
      },
      {
        name: 'Bootstrap',
        sel: '#destinations',
        then: 'Twitter open-sourced its internal toolkit in August 2011, and within a year it was the most popular project on GitHub. A 940 pixel grid of twelve floated columns, a black navbar, a carousel and three columns underneath. A lot of 2012 looked exactly like this page.',
        now: 'CSS Grid and flexbox do the layout without a framework. Companies build their own design systems, or compose pages from utility classes.',
        code: `<div class="row">
  <div class="span4">...</div>
  <div class="span4">...</div>
  <div class="span4">...</div>
</div>

[class*="span"] { float: left; min-height: 1px; margin-left: 20px; }
.span4 { width: 300px; }`,
      },
      {
        name: 'The carousel',
        sel: '#slides',
        then: 'Every homepage rotated three or four banners, one every few seconds. This is Bootstrap\'s jQuery plugin: one line starts it, and data attributes wire up the arrows. The University of Notre Dame measured theirs in 2013: 1% of visitors clicked a slide, and 84% of those clicks were on the first one.',
        now: 'One strong image, or a row you swipe with CSS scroll snapping and no script at all.',
        code: `<div id="slides" class="carousel slide">
  <div class="carousel-inner">
    <div class="active item"><img src="img/slide_tokyo.jpg"> ...</div>
  </div>
  <a class="carousel-control left" href="#slides"
     data-slide="prev">&lsaquo;</a>
</div>

$('#slides').carousel({ interval: 5000 });`,
      },
      {
        name: 'CSS3, prefixed',
        sel: '.search-box .btn',
        then: 'Gradients, rounded corners and shadows moved from images into CSS, but each browser had its own experimental syntax. This is Bootstrap\'s orange button: one gradient written five times, plus a Microsoft filter for Internet Explorer.',
        now: 'One unprefixed line. Browsers stopped shipping new features behind prefixes and put them behind flags instead, and build tools add the few prefixes that are left.',
        code: `.btn-warning {
  background-color: #faa732;
  background-image:
    -moz-linear-gradient(top, #fbb450, #f89406);
  background-image:
    -webkit-gradient(linear, 0 0, 0 100%,
      from(#fbb450), to(#f89406));
  background-image:
    -webkit-linear-gradient(top, #fbb450, #f89406);
  background-image:
    -o-linear-gradient(top, #fbb450, #f89406);
  background-image:
    linear-gradient(to bottom, #fbb450, #f89406);
  filter: progid:DXImageTransform.Microsoft.gradient(
    startColorstr='#fffbb450', endColorstr='#fff89406',
    GradientType=0);
}`,
      },
      {
        name: 'HTML5 forms',
        sel: '#search',
        then: 'Placeholder text and a real date input, with no script. Chrome drew its own calendar for type="date" from 2012, but Firefox only got one in 2017 and desktop Safari in 2021, so most sites still shipped a jQuery date picker. The city list is Bootstrap\'s typeahead, configured with a JSON array in an attribute.',
        now: 'The input types work everywhere, and <datalist> gives a text field suggestions without a plugin.',
        code: `<input type="text" placeholder="Where to?" autocomplete="off"
  data-provide="typeahead"
  data-source='["Athens","Barcelona","Berlin","Lisbon", ...]'>

<input type="date" name="depart">`,
      },
      {
        name: 'Web fonts',
        sel: '#destinations h3',
        then: 'Google Web Fonts launched in 2010 and made custom type one line of HTML. Before that, sites drew headlines with Flash (sIFR) or with JavaScript that turned text into canvas shapes (Cufón). Open Sans was the favourite. This copy serves it from this site, not from Google.',
        now: 'Self-hosted variable fonts: every weight in one file. Browsers stopped sharing the font cache between sites in 2020, so the big shared CDN stopped being faster.',
        code: `<link rel="stylesheet" type="text/css"
  href="http://fonts.googleapis.com/css?family=Open+Sans:400,700">

body { font-family: 'Open Sans', sans-serif; }`,
      },
      {
        name: 'Icon sprites',
        sel: '.search-box .btn i',
        then: 'Glyphicons Halflings: 140 icons in a single PNG, each one an empty <i> with a background position. One download instead of 140, because browsers opened at most six connections to a server at a time. White icons for dark buttons were a second PNG.',
        now: 'SVG icons that take any colour and size. HTTP/2 made lots of small files cheap, so nothing has to be stitched together.',
        code: `[class^="icon-"] {
  display: inline-block; width: 14px; height: 14px;
  background-image: url("../img/glyphicons-halflings.png");
  background-repeat: no-repeat;
}
.icon-search { background-position: -48px 0; }
.icon-white {
  background-image: url("../img/glyphicons-halflings-white.png");
}`,
      },
      {
        name: 'Like, Tweet, Pin',
        sel: '.social .span6 + .span6',
        then: 'The real 2012 page loaded Facebook\'s, Twitter\'s and Pinterest\'s scripts for these buttons, and each one could see every visit to every page that had one. Here they\'re plain buttons.',
        now: 'Safari and Firefox block third-party cookies by default, and in Europe the GDPR means asking before any of it loads.',
        code: `<div id="fb-root"></div>
<script>(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>

<div class="fb-like" data-href="http://www.halcyonair.com"
     data-send="false" data-show-faces="true"></div>`,
      },
    ],
  },
  {
    year: 2020, browser: 'CHROME 87', os: 'win10', chrome: 'ch87', conn: '86 MBPS', kbps: 10755, page: 2000, built: true,
    url: 'halcyonair.com',
    tab: 'Halcyon | Flexible flights from Tel Aviv',
    title: 'Halcyon | Flexible flights from Tel Aviv - Google Chrome',
    stack: 'React 17 · hooks · fetch · CSS custom properties',
    xray: [
      {
        name: 'Single-page app',
        sel: '.top',
        then: 'View source and the page is empty, just one <div id="root"> and three scripts. React builds everything in the browser, and a search changes the address through the History API without loading a new page. Most 2020 apps started from create-react-app, in JSX compiled by Babel and webpack. This copy skips the build and calls React.createElement directly.',
        now: 'Frameworks send real HTML from the server first and only make the interactive parts live: React Server Components, Astro islands, or plain HTML with a little script.',
        code: `<div id="root"></div>
<script src="/static/js/main.chunk.js"></script>

function App() {
  const [query, setQuery] = useState(readQuery);
  const city = query && CITIES.find(c => c.code === query.to);
  return (
    <>
      <CovidBar />
      <Header />
      {city ? <Results city={city} /> : <Home search={search} />}
      <Consent />
      <Chat />
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));`,
      },
      {
        name: 'The COVID banner',
        sel: '.covid',
        then: 'In April 2020 airline passenger traffic fell 94% from a year before. Every airline site added a bar like this one, waived change fees and listed entry rules country by country. The dismissible alert bar became a standard component.',
        now: 'The banners are gone. Some of the free changes stayed: the big US airlines dropped change fees on most tickets for good in August 2020.',
        code: `function CovidBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="covid" role="region" aria-label="Travel update">
      <p><strong>COVID-19:</strong> check the entry rules ...</p>
      <button aria-label="Dismiss" onClick={() => setOpen(false)}>
        <Icon name="x" />
      </button>
    </div>
  );
}`,
      },
      {
        name: 'Dark mode',
        sel: '.theme',
        then: 'macOS got a dark mode in 2018, iOS and Android in 2019, and the prefers-color-scheme media query reached every major browser the same year. Sites moved their colours into CSS custom properties so they could flip them all at once. The moon button saves your choice.',
        now: 'light-dark() sets both colours in one declaration, so there\'s no second block of variables to keep in sync.',
        check: () => CSS.supports('color: light-dark(#000, #fff)'),
        code: `:root {
  --bg: #fafaff;
  --text: #1f2041;
  --brand: #5a4fcf;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #12131c;
    --text: #ecedf7;
    --brand: #8b82ff;
    color-scheme: dark;
  }
}
body { background: var(--bg); color: var(--text); }`,
      },
      {
        name: 'Corporate Memphis',
        sel: '.art',
        then: 'Bendy oversized limbs, small heads, purple skin and no outlines. The style grew out of Alegria, the illustrations Buck made for Facebook in 2017, and by 2020 every startup and bank had it. It sat in a blob, a shape made from one border-radius. This one was drawn in that style by an image model in 2026.',
        now: '3D renders, AI images and video. The 2026 page opens with a film.',
        code: `<picture class="art">
  <source srcset="img/hero.webp" type="image/webp">
  <img src="img/hero.jpg" alt=""
       width="560" height="560">
</picture>

.art img {
  border-radius: 62% 38% 46% 54% / 49% 56% 44% 51%;
}`,
      },
      {
        name: 'Skeleton screens',
        sel: '.search',
        then: 'Search for a flight. Instead of a blank page or a spinner you get grey shapes where the results will be, shimmering until fetch() comes back. Facebook and LinkedIn made skeletons the standard way to wait.',
        now: 'Streaming HTML and React Suspense show the real content in pieces as each part is ready.',
        code: `useEffect(() => {
  (async () => {
    const res = await fetch('data/fares.json');
    setFlights(toFlights(await res.json()));
  })();
}, [city.code]);

return flights
  ? flights.map(f => <Flight key={f.no} {...f} />)
  : [0, 1, 2].map(i => <div key={i} className="flight card skel" />);`,
      },
      {
        name: 'Lazy images',
        sel: '.deal img',
        then: 'loading="lazy" reached Chrome in 2019: pictures further down wait until you scroll near them. Width and height on the tag reserve the space before the image arrives, which started to matter when Google announced in May 2020 that layout shift would count toward search ranking. WebP with a JPEG fallback, because Safari only learned WebP in September 2020.',
        now: 'AVIF, often half the size of JPEG and supported in every browser. The 2026 page uses it.',
        code: `<picture>
  <source srcset="img/lisbon.webp" type="image/webp">
  <img src="img/lisbon.jpg" alt="" width="640" height="420"
       loading="lazy">
</picture>`,
      },
      {
        name: 'Cookie consent',
        sel: '.consent',
        then: 'The GDPR took effect in May 2018, and by 2020 almost every site opened with a banner. Most made "Accept all" one click and put the way out a screen deeper, like this one.',
        now: 'Regulators started fining that design. In January 2022 France fined Google €150 million and Facebook €60 million because refusing cookies took more clicks than accepting them.',
        code: `{!done && (
  <div className="consent card">
    <p>We use cookies to make the site work ...</p>
    <button onClick={() => setManage(true)}>Manage</button>
    <button onClick={() => setDone(true)}>Accept all</button>
  </div>
)}`,
      },
      {
        name: 'Live chat',
        sel: '.chat',
        then: 'A bubble in the corner that waves at you after a few seconds. Intercom, Drift and Zendesk sold them to everyone, and each one loaded hundreds of kilobytes of script on every page. Behind the friendly name was usually a decision tree with three buttons.',
        now: 'An assistant that understands a question in your own words. The one on the 2026 page runs inside the browser.',
        code: `<script>
  window.intercomSettings = { app_id: "h4lcy0n" };
</script>
<script async src="https://widget.intercom.io/widget/h4lcy0n"></script>`,
      },
    ],
  },
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
        now: 'One variable font file with weight and width axes. A registered custom property turns scroll position into a plain number that drives both axes, so the headline narrows and thins as you leave the hero. No JavaScript.',
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
        then: 'Six dropdowns and a date picker, because the computer couldn\'t read a sentence. "Somewhere warm" wasn\'t a field.',
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

export const NOTE = '"Typical page" uses the nearest year with published data: 1995 for 1996, 1997 for 1999, 2003 for 2004 and January 2008 for 2007. "Download" is page weight divided by connection speed. It leaves out latency and JavaScript, which are most of the wait today.';

export const SOURCES = [
  ['Page weight 1995 and 2003', 'websiteoptimization.com series, via HTTP Archive', 'https://discuss.httparchive.org/t/page-weight-in-1995/2626'],
  ['Page weight 1997', 'Nielsen Norman Group', 'https://www.nngroup.com/articles/size-limits-for-web-pages/'],
  ['Page weight 2001, top 300 home pages', 'Byte Level Research, via Dylan Tweney', 'https://dylan.tweney.com/?p=1992'],
  ['Page weight January 2008', 'Gomez, via websiteoptimization.com', 'https://www.websiteoptimization.com/speed/tweak/average-web-page/'],
  ['Median desktop page 2012, 2020 and 2026', 'HTTP Archive', 'https://httparchive.org/reports/page-weight'],
  ['28.8K was the most common modem in 1996', 'GVU 6th WWW User Survey', 'https://sites.cc.gatech.edu/gvu/user_surveys/survey-10-1996/graphs/use/Connection_Speed.html'],
  ['Dial-up averaged 34 kbps, DSL 861 kbps', 'comScore, 2004', 'https://www.comscore.com/Insights/Press-Releases/2004/04/National-Average-Download-Speeds'],
  ['US median 1.97 Mbps in 2007', 'CWA Speed Matters', 'https://benton.org/content/speed-matters-report-internet-speeds-all-50-states'],
  ['US median fixed broadband 86 Mbps, Q2 2020', 'Ookla, via Fierce Network', 'https://www.fierce-network.com/telecom/ookla-verizon-fastest-fixed-u-s-broadband-isp-while-spectrum-chalks-up-highest-consistency'],
  ['US average 7.4 Mbps, Q4 2012', 'Akamai State of the Internet', 'https://telecompaper.com/news/average-web-connection-speed-rises-5-in-q4-2012-akamai--939163'],
  ['US median fixed broadband 314 Mbps, September 2026', 'Ookla Speedtest Global Index', 'https://www.speedtest.net/global-index'],
];
