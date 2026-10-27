/* Gaincations site config + behavior.
   Swap the links below once accounts exist. Elements with data-link="KEY" get the URL. */
const LINKS = {
  YOUTUBE:   "https://www.youtube.com/@Gaincations",
  INSTAGRAM: "https://www.instagram.com/gaincations",
  TIKTOK:    "https://www.tiktok.com/@gaincations",
  APPLY:     "#apply",                  // Tally form (embedded on coaching page)
  CHECKOUT:  "https://buy.stripe.com/eVqdR91Py4Ps4lG31LgQE01",  // Stripe Payment Link: 1-on-1 Coaching, $349.00/mo
  CALL:      "https://calendly.com/gaincations/15min",
  KICKOFF:   "https://calendly.com/gaincations/kickoff-call-new-clients",
  INTAKE:    "https://tally.so/r/zEEGO8",  // Calendly
  FREE:      "#get",                    // Lead magnet form (embedded on free page)
  EMAIL:     "mailto:gaincations@gmail.com"
};
const SPOTS_LEFT = 10;   // founding spots remaining; edit this number as clients join
const EMBEDS = {
  APPLY_FORM: "",   // e.g. https://tally.so/embed/XXXX?alignLeft=1&hideTitle=1&transparentBackground=1
  FREE_FORM:  "",   // e.g. https://tally.so/embed/YYYY?alignLeft=1&hideTitle=1&transparentBackground=1
  WAITLIST_FORM: ""
};

(function () {
  // language
  const saved = (() => { try { return localStorage.getItem("gc-lang"); } catch (e) { return null; } })();
  const browser = (navigator.language || "").toLowerCase().startsWith("es") ? "es" : "en";
  let lang = saved || browser;
  const apply = () => {
    document.body.classList.toggle("lang-es", lang === "es");
    document.documentElement.lang = lang;
    document.querySelectorAll(".langbtn").forEach(b => b.textContent = lang === "es" ? (b.closest(".hf-nav") ? "English" : "EN") : (b.closest(".hf-nav") ? "Español" : "ES"));
  };
  apply();
  document.querySelectorAll(".langbtn").forEach(b => b.addEventListener("click", () => {
    lang = lang === "es" ? "en" : "es";
    try { localStorage.setItem("gc-lang", lang); } catch (e) {}
    apply();
  }));

  // links
  document.querySelectorAll("[data-link]").forEach(a => {
    const url = LINKS[a.getAttribute("data-link")];
    if (url) a.setAttribute("href", url);
    if (url && /^https?:/.test(url)) { a.target = "_blank"; a.rel = "noopener"; }
  });

  // embeds
  document.querySelectorAll("[data-embed]").forEach(box => {
    const url = EMBEDS[box.getAttribute("data-embed")];
    if (!url) return;
    box.innerHTML = "";
    const f = document.createElement("iframe");
    f.src = url; f.loading = "lazy"; f.title = box.getAttribute("data-title") || "Form";
    box.appendChild(f);
  });

  // analytics: tracked clicks
  const track = (ev, props) => { try { window.posthog && posthog.capture(ev, props || {}); } catch (e) {} };
  document.addEventListener("click", e => {
    const el = e.target.closest("a,button");
    if (!el) return;
    const t = el.getAttribute("data-track");
    if (t) { track(t, { from: el.getAttribute("data-from") || location.pathname }); return; }
    const l = el.getAttribute("data-link");
    if (l === "CHECKOUT") track("checkout_clicked", { from: location.pathname });
    else if (l === "CALL") track("call_clicked", { from: location.pathname });
    else if (l === "YOUTUBE" || l === "TIKTOK" || l === "INSTAGRAM") track("social_clicked", { platform: l.toLowerCase(), from: location.pathname });
    else if (el.getAttribute("href") === "/coaching") track("coaching_clicked", { from: location.pathname });
    else if (el.getAttribute("href") === "#quiz") track("quiz_cta_clicked", { from: location.pathname });
  });

  // spots counter
  document.querySelectorAll("#spots, #spots-es").forEach(e => e.textContent = SPOTS_LEFT);

  // mobile menu
  const mb = document.querySelector(".menubtn"), links = document.querySelector(".links");
  if (mb && links) mb.addEventListener("click", () => links.classList.toggle("open"));
  const hm = document.querySelector(".hf-menu"), hl = document.querySelector(".hf-links");
  if (hm && hl) hm.addEventListener("click", () => hl.classList.toggle("open"));

  // active nav
  const here = location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll(".links a").forEach(a => {
    const p = a.getAttribute("href").replace(/\/$/, "") || "/";
    if (p === here) a.classList.add("active");
  });
})();

// Check-in slideshow: crossfades every picture in .checkins, in document order.
(function(){
  var box=document.querySelector('.checkins'); if(!box) return;
  var pics=box.querySelectorAll('picture'); if(pics.length<2) return;
  var i=0;
  setInterval(function(){
    pics[i].classList.remove('on'); i=(i+1)%pics.length; pics[i].classList.add('on');
  },3200);
})();

// Pain columns: three slots. Every 6 s two slots swap to the next cards; the third is "held"
// for a second cycle with a light sweep. Pauses on hover and once the quiz is started.
(function(){
  var src=document.querySelectorAll('.pains-src .col'), slots=document.querySelectorAll('#pains .slot');
  if(!src.length||!slots.length) return;
  var cards=Array.prototype.map.call(src,function(c){return c.innerHTML;});
  var n=0, held=0, mobile=window.matchMedia('(max-width:820px)').matches, paused=false, timer=null;
  function fill(slot,html,cb){
    slot.classList.add('out');
    setTimeout(function(){ slot.innerHTML=html; slot.classList.remove('out'); if(cb) cb(); },720);
  }
  function shine(slot){ slot.classList.remove('held'); void slot.offsetWidth; slot.classList.add('held'); }
  function next(){ var h=cards[n%cards.length]; n++; return h; }
  // initial state
  slots.forEach(function(s){ s.innerHTML=next(); });
  shine(slots[0]);
  function tick(){
    if(paused) return;
    if(mobile){ fill(slots[0],next(),function(){ shine(slots[0]); }); return; }
    held=(held+1)%slots.length;
    slots.forEach(function(s,i){
      if(i===held){ shine(s); } else { s.classList.remove('held'); fill(s,next()); }
    });
  }
  timer=setInterval(tick,6000);
  var box=document.getElementById('pains');
  box.addEventListener('mouseenter',function(){ paused=true; });
  box.addEventListener('mouseleave',function(){ paused=false; });
  var qz=document.getElementById('quiz-box');
  if(qz) qz.addEventListener('click',function(){ paused=true; box.onmouseleave=null; },{once:true});
})();

// "Take the quiz" links: smooth-scroll so the quiz card sits in the middle of the screen.
(function(){
  var box=document.getElementById('quiz-box'); if(!box) return;
  document.querySelectorAll('a[href="#quiz"]').forEach(function(a){
    a.addEventListener('click',function(e){
      e.preventDefault();
      box.scrollIntoView({behavior:'smooth',block:'center'});
      history.replaceState(null,'','#quiz');
    });
  });
})();
