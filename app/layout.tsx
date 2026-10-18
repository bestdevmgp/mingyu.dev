import ConsoleGreeting from "@/_components/ConsoleGreeting";
import DeferredAnalytics from "@/_components/DeferredAnalytics";
import SiteLoader from "@/_components/SiteLoader";
import SmoothScroll from "@/_components/SmoothScroll";
import ThemeScript from "@/_components/ThemeScript";
import content from "@/lib/content";

import "./globals.css";

const PROJECT_PATH = `^(?:\\/[\\w-]+)?\\/project\\/(?:${content.project.map(({ id }) => id).join("|")})$`;

const BOOT_SCRIPT =
  "(function(){var r=document.documentElement,MIN=400,SOFT=800,FADE=600,done=0,at=performance.now();" +
  "r.classList.add('loader-js');" +
  "function gone(){r.classList.add('loader-gone')}" +
  "function hide(){r.classList.add('loader-done');setTimeout(gone,FADE)}" +
  "function wait(left){if(left>0)setTimeout(hide,left);else hide()}" +
  "function finish(){if(done)return;done=1;" +
  "var h=document.querySelector('.site-loader-hole'),a=h&&h.getAnimations&&h.getAnimations()[0];" +
  "if(!a)return wait(MIN-(performance.now()-at));" +
  "a.ready.then(function(){var e=a.effect,t=e.getTiming();wait(t.delay+e.getKeyframes()[1].computedOffset*t.duration-a.currentTime)},hide)}" +
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
  "(function(){try{if(/" +
  PROJECT_PATH +
  "/.test(location.pathname))sessionStorage.setItem('from-project','1')}catch(e){}})();" +
  "(function(){try{var h=history,s=h.state,n={},k;if(s&&s.projectModal){for(k in s)if(k!=='projectModal')n[k]=s[k];h.replaceState(n,'')}" +
  "addEventListener('pagehide',function(){h.scrollRestoration=h.state&&h.state.projectModal?'manual':'auto'});" +
  "addEventListener('pageshow',function(e){if(e.persisted)h.scrollRestoration='auto';else setTimeout(function(){h.scrollRestoration='auto'})})}catch(e){}})();" +
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
        <ConsoleGreeting />
      </body>
    </html>
  );
}
