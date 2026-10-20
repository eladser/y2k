// Not 1996 code. The original counter was one <IMG SRC="/cgi-bin/Count.cgi?df=halcyon.dat">
// that came back as a GIF with the digits drawn in. This asks a counting API for the real
// number of visits to this page and shows it with the same digit GIFs.
fetch('https://abacus.jasoncameron.dev/hit/y2k-eladser-dev/visits')
  .then(r => (r.ok ? r.json() : Promise.reject(new Error(`counter said ${r.status}`))))
  .then(({ value }) => {
    [...String(value).padStart(6, '0').slice(-6)].forEach((d, i) => {
      document.images[`c${i + 1}`].src = `img/d${d}.gif`;
    });
  })
  .catch(err => {
    // a counter CGI that was down showed a broken image, so this one does too
    console.warn('counter', err);
    document.images.c1.src = 'img/missing.gif';
  });
