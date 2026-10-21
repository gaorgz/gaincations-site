/* Gaincations site config + behavior.
   Swap the links below once accounts exist. Elements with data-link="KEY" get the URL. */
const LINKS = {
  YOUTUBE:   "https://www.youtube.com/@Gaincations",
  INSTAGRAM: "https://www.instagram.com/gaincations",
  TIKTOK:    "https://www.tiktok.com/@gaincations",
  APPLY:     "#apply",                  // Tally form (embedded on coaching page)
  CHECKOUT:  "https://buy.stripe.com/7sYeVdeCk2HkaK4dGpgQE00",  // Stripe Payment Link: 1-on-1 Coaching (Founding)
  CALL:      "https://calendly.com/gaincations/30min",  // Calendly
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
    document.querySelectorAll(".langbtn").forEach(b => b.textContent = lang === "es" ? "EN" : "ES");
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

  // spots counter
  document.querySelectorAll("#spots, #spots-es").forEach(e => e.textContent = SPOTS_LEFT);

  // mobile menu
  const mb = document.querySelector(".menubtn"), links = document.querySelector(".links");
  if (mb && links) mb.addEventListener("click", () => links.classList.toggle("open"));

  // active nav
  const here = location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll(".links a").forEach(a => {
    const p = a.getAttribute("href").replace(/\/$/, "") || "/";
    if (p === here) a.classList.add("active");
  });
})();
