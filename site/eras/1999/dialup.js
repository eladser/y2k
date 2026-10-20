// Not 1999 code. This file replays the page the way it arrived over a 56K modem: text first,
// pictures one at a time as their bytes come in, each with its ALT text standing in until then.
// The status bar messages go to the IE5 window drawn around this page.
(() => {
  const RATE = 3000; // bytes per second; two frames share one 34 kbps line
  const host = 'http://www.halcyonair.com/';
  // one status bar, two frames: only the content frame reports, so they don't overwrite each other
  const say = (status, progress) => top !== self && window.name !== 'top' && top.postMessage({ status, progress }, location.origin);
  const key = `halcyon.56k.${location.pathname}`;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seen = false;
  try { seen = !!sessionStorage.getItem(key); } catch { /* fine */ }

  addEventListener('DOMContentLoaded', () => {
    const imgs = [...document.images].filter(i => !/spacer.gif$/.test(i.src));
    if (seen || reduce || !imgs.length) return say('Done', 0);

    const css = document.createElement('style');
    css.textContent = '.ph{display:inline-block;vertical-align:top;box-sizing:border-box;overflow:hidden;padding:2px 3px;border:1px solid #808080;background:#fff;color:#000;font:10px Arial,sans-serif;text-align:left}';
    document.head.append(css);
    const size = img => performance.getEntriesByName(img.src)[0]?.encodedBodySize || 1500;
    const holes = imgs.map(img => {
      const ph = document.createElement('span');
      ph.className = 'ph';
      ph.style.width = `${img.getAttribute('width')}px`;
      ph.style.height = `${img.getAttribute('height')}px`;
      ph.textContent = img.alt;
      img.style.display = 'none';
      img.before(ph);
      return ph;
    });
    const total = imgs.reduce((n, i) => n + size(i), 0);
    let got = 0;

    const next = k => {
      if (k >= imgs.length) {
        say('Done', 0);
        try { sessionStorage.setItem(key, '1'); } catch { /* fine */ }
        return;
      }
      const img = imgs[k], bytes = size(img), ms = (bytes / RATE) * 1000;
      const jpg = /\.jpg$/.test(img.src) && bytes > 4000;
      say(`Downloading picture ${host}${img.getAttribute('src')}...`, got / total);
      setTimeout(() => {
        holes[k].remove();
        img.style.display = '';
        got += bytes;
        if (!jpg) return next(k + 1);
        // baseline JPEGs drew top to bottom as they arrived
        img.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: ms * 0.8, easing: 'steps(12)' }).finished.then(() => next(k + 1));
      }, jpg ? ms * 0.2 : ms);
    };
    say(`Opening page ${host}${location.pathname.split('/').pop()}...`, 0);
    setTimeout(() => next(0), 400);
  });
})();
