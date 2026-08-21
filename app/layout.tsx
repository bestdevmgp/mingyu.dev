import DeferredAnalytics from "@/_components/DeferredAnalytics";
import SiteLoader from "@/_components/SiteLoader";
import SmoothScroll from "@/_components/SmoothScroll";
import ThemeScript from "@/_components/ThemeScript";

import "./globals.css";

const BOOT_SCRIPT =
  "(function(){var r=document.documentElement,SHOW=400,MIN=300,SOFT=800,CAP=5000,FADE=400,shown=0,done=0,at=0,t=0;" +
  "r.classList.add('loader-js');" +
  "function gone(){r.classList.add('loader-gone')}" +
  "function hide(){r.classList.add('loader-done');setTimeout(gone,FADE)}" +
  "function finish(){if(done)return;done=1;clearTimeout(t);if(!shown)return hide();" +
  "var left=MIN-(performance.now()-at);if(left>0)setTimeout(hide,left);else hide()}" +
  "function show(){if(done)return;shown=1;at=performance.now();r.classList.add('loader-showing')}" +
  "t=setTimeout(show,Math.max(0,SHOW-performance.now()));setTimeout(finish,CAP);" +
  "function ready(){var p=document.fonts&&document.fonts.ready;setTimeout(finish,SOFT);" +
  "if(p&&p.then)p.then(function(){requestAnimationFrame(finish)},finish);else requestAnimationFrame(finish)}" +
  "if(document.readyState==='loading')addEventListener('DOMContentLoaded',ready,{once:true});else ready()})();" +
  "(function(){var d=document.documentElement,w=0;function s(){d.style.setProperty('--vh0',window.innerHeight/100+'px');w=window.innerWidth}s();addEventListener('resize',function(){if(window.innerWidth!==w)s()})})();" +
  "(function(){var r=document.documentElement;if(!window.IntersectionObserver)return;r.classList.add('reveal-js');" +
  "function s(){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-revealed');io.unobserve(e.target)}})},{rootMargin:'0px 0px -9% 0px'});" +
  "function w(n){if(n.nodeType!==1)return;if(n.matches('[data-reveal]')&&!n.classList.contains('is-revealed'))io.observe(n);" +
  "n.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach(function(el){io.observe(el)})}w(document.body);" +
  "new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(w)})}).observe(document.body,{childList:true,subtree:true})}" +
  "if(document.readyState!=='loading')s();else addEventListener('DOMContentLoaded',s,{once:true})})();" +
  "(function(){try{if(location.pathname.indexOf('/project/')===0)sessionStorage.setItem('from-project','1')}catch(e){}})();" +
  "(function(){if(!matchMedia('(hover: none)').matches)return;var o=null;" +
  "function c(){if(o){o.classList.remove('skill-open');o=null}}" +
  "document.addEventListener('click',function(e){var t=e.target&&e.target.closest?e.target.closest('[data-skill]'):null;" +
  "if(!t||t===o){c();return}c();t.classList.add('skill-open');o=t},true);" +
  "addEventListener('scroll',c,{capture:true,passive:true});addEventListener('touchmove',c,{passive:true})})();" +
  "addEventListener('load',function(){var r=document.documentElement,h=document.getElementById('main');r.classList.add('anim-ready');if(!h||!window.IntersectionObserver)return;new IntersectionObserver(function(e){r.classList.toggle('hero-idle',!e[0].isIntersecting)},{threshold:0}).observe(h)},{once:true})";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeScript />
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <SiteLoader />
        <SmoothScroll />
        {children}
        <div id="modal-root" />
        <DeferredAnalytics />
      </body>
    </html>
  );
}
