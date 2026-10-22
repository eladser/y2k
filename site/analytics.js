// GA4, same property as eladser.dev. gtag.js is ~160 KB over the wire, so it waits
// for the first interaction or an idle moment instead of competing with the board.
(function () {
  var ID = 'G-Q92S02RPVS';
  var started = false;

  function start() {
    if (started) return;
    started = true;

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', ID);

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
  }

  // Whichever comes first: a real interaction, browser idle, or a 4s backstop.
  ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(function (evt) {
    window.addEventListener(evt, start, { once: true, passive: true });
  });
  if ('requestIdleCallback' in window) {
    requestIdleCallback(start, { timeout: 4000 });
  } else {
    setTimeout(start, 3000);
  }
})();
