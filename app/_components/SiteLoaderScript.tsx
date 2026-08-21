const SCRIPT = `(function () {
  var r = document.documentElement;
  var SHOW = 400, MIN = 300, SOFT = 800, CAP = 5000, FADE = 400, FLY = 1250;
  var shown = 0, done = 0, at = 0, t = 0;
  r.classList.add('loader-js');

  function gone() { r.classList.add('loader-gone'); }
  function reveal() { r.classList.add('header-in'); }

  function angle(m) {
    var p = /matrix\\(([^)]+)\\)/.exec(m || '');
    if (!p) return 0;
    var v = p[1].split(',');
    return (Math.atan2(+v[1], +v[0]) * 180 / Math.PI + 360) % 360;
  }

  function land() {
    try {
      if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
      var mark = document.querySelector('.site-loader-mark');
      var logo = document.querySelector('.header-mark');
      if (!mark || !logo || !mark.animate) return 0;
      var ms = getComputedStyle(mark), ls = getComputedStyle(logo);
      var cur = angle(ms.transform);
      var a = mark.getBoundingClientRect(), b = logo.getBoundingClientRect();
      if (!b.width || !b.height) return 0;
      var mw = parseFloat(ms.width) || 0;
      var lw = parseFloat(ls.width) || b.width;
      if (!(mw > 0) || !(lw > 0)) return 0;
      var dx = b.left + b.width / 2 - (a.left + a.width / 2);
      var dy = b.top + b.height / 2 - (a.top + a.height / 2);
      var sweep = (90 - cur % 90) % 90;
      if (sweep < 45) sweep += 90;
      r.classList.add('loader-done');
      r.classList.add('loader-landing');
      var anim = mark.animate([
        { transform: 'translate(0px,0px) scale(1) rotate(' + cur + 'deg)' },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + (lw / mw) + ') rotate(' + (cur + sweep) + 'deg)' }
      ], { duration: FLY, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'forwards' });
      var settled = 0;
      function settle() {
        if (settled) return;
        settled = 1;
        r.classList.remove('loader-landing');
        gone();
        reveal();
      }
      anim.onfinish = settle;
      setTimeout(settle, FLY + 260);
      return 1;
    } catch (e) {
      return 0;
    }
  }

  function hide() {
    if (shown && land()) return;
    r.classList.add('loader-done');
    reveal();
    setTimeout(gone, FADE);
  }

  function finish() {
    if (done) return;
    done = 1;
    clearTimeout(t);
    if (!shown) return hide();
    var left = MIN - (performance.now() - at);
    if (left > 0) setTimeout(hide, left); else hide();
  }

  function show() {
    if (done) return;
    shown = 1;
    at = performance.now();
    r.classList.add('loader-showing');
  }

  function ready() {
    var p = document.fonts && document.fonts.ready;
    setTimeout(finish, SOFT);
    if (p && p.then) p.then(function () { requestAnimationFrame(finish); }, finish);
    else requestAnimationFrame(finish);
  }

  t = setTimeout(show, Math.max(0, SHOW - performance.now()));
  setTimeout(finish, CAP);
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', ready, { once: true });
  else ready();
})();`;

const SiteLoaderScript = () => <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;

export default SiteLoaderScript;
