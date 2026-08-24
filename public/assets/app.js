/* Arrow Escape — app.js (vanilla, no deps) */
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  // Fill placeholders from config.js if present
  const cfg = window.SITE_CONFIG || {};
  // GOOGLE_PLAY_URL: "" means beta mode (no public listing yet)
  const PLAY_RAW = cfg.GOOGLE_PLAY_URL;
  const PLAY = (typeof PLAY_RAW === 'string' && PLAY_RAW.trim() !== '' && PLAY_RAW !== 'GOOGLE_PLAY_URL') ? PLAY_RAW.trim() : '';
  const hasPlayUrl = PLAY !== '';
  const EMAIL = cfg.SUPPORT_EMAIL && cfg.SUPPORT_EMAIL !== "SUPPORT_EMAIL" ? cfg.SUPPORT_EMAIL : "fusionsix.tech@gmail.com";
  const DOMAIN = cfg.WEBSITE_DOMAIN && cfg.WEBSITE_DOMAIN !== "WEBSITE_DOMAIN" ? cfg.WEBSITE_DOMAIN : "";

  // Year
  $$("[data-year]").forEach(el=> el.textContent = String(new Date().getFullYear()));

  // Effective date + domain placeholders
  $$("[data-effective-date]").forEach(el=>{
    el.textContent = (cfg.PRIVACY_EFFECTIVE_DATE && cfg.PRIVACY_EFFECTIVE_DATE !== "PRIVACY_EFFECTIVE_DATE")
      ? cfg.PRIVACY_EFFECTIVE_DATE : "PRIVACY_EFFECTIVE_DATE";
  });
  $$("[data-domain]").forEach(el=>{
    el.textContent = DOMAIN || "WEBSITE_DOMAIN";
    if(DOMAIN) el.setAttribute("href", DOMAIN);
  });
  $$("[data-developer]").forEach(el=>{
    el.textContent = (cfg.DEVELOPER_NAME && cfg.DEVELOPER_NAME !== "DEVELOPER_NAME") ? cfg.DEVELOPER_NAME : "Fusix Studio";
  });

  // Set support email links
  $$("[data-email]").forEach(a=>{
    if(EMAIL && EMAIL.includes("@")){
      a.textContent = EMAIL;
      a.setAttribute("href", "mailto:"+EMAIL);
    }
  });

  // Beta / Play Store CTA logic
  // When GOOGLE_PLAY_URL is empty -> Join the Beta (opens modal)
  // When non-empty -> Get it on Google Play (real link)
  function updatePlayCtas(){
    $$("[data-play-url]").forEach(a=>{
      const isBetaBtn = a.hasAttribute("data-beta-open") || a.classList.contains("js-beta-cta");
      if(hasPlayUrl){
        a.setAttribute("href", PLAY);
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener");
        a.removeAttribute("data-beta-open");
        // restore label if it was beta
        if(a.dataset.originalLabel){
          // leave as is — but if label is Join the Beta, swap to Get it on Google Play
          if(a.textContent.trim().includes("Join the Beta") || a.textContent.trim().includes("Get Early Access")){
            a.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 20.5V3.5a1 1 0 0 1 1.45-.89l13.9 8.5a1 1 0 0 1 0 1.78l-13.9 8.5A1 1 0 0 1 3 20.5Z"/></svg> Get it on Google Play';
          }
        }
        a.setAttribute("aria-label", "Get it on Google Play (opens in new tab)");
      } else {
        // beta mode
        if(!a.dataset.originalLabel) a.dataset.originalLabel = a.innerHTML;
        a.setAttribute("href", "#beta");
        a.removeAttribute("target");
        a.removeAttribute("rel");
        a.setAttribute("data-beta-open", "");
        a.setAttribute("aria-label", "Join the Beta — open beta access dialog");
        // update label to Join the Beta if it was Play Store
        if(a.textContent.includes("Get it on Google Play")){
          // keep icon but change text
          const isNav = a.closest(".nav-cta") !== null;
          if(isNav){
            a.innerHTML = 'Join the Beta';
          } else {
            a.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> Join the Beta';
          }
        }
      }
    });
    // also handle standalone beta buttons
    $$("[data-beta-open]").forEach(btn=>{
      if(!hasPlayUrl){
        btn.setAttribute("href", btn.getAttribute("href") || "#beta");
      }
    });
  }
  updatePlayCtas();

  // Mobile menu
  const menuBtn = $("[data-menu-btn]");
  const panel = $("[data-mobile-panel]");
  if(menuBtn && panel){
    menuBtn.addEventListener("click", ()=>{
      const open = panel.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
    });
  }

  // Beta modal
  const overlay = $("[data-beta-overlay]");
  const dialog = $("[data-beta-dialog]");
  const emailInput = $("[data-beta-email]");
  const form = $("[data-beta-form]");
  const errorEl = $("[data-beta-error]");
  const successEl = $("[data-beta-success]");
  const successEmailEl = $("[data-beta-success-email]");
  const fallbackBtn = $("[data-beta-fallback]");
  let lastTrigger = null;
  let lastEmail = "";

  function isValidEmail(v){
    // simple RFC-ish check
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function openBeta(trigger){
    if(!overlay) return;
    lastTrigger = trigger || document.activeElement;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    // reset form state if previously success
    if(successEl) successEl.classList.remove("open");
    if(form) form.hidden = false;
    if(errorEl) errorEl.textContent = "";
    if(emailInput){
      emailInput.removeAttribute("aria-invalid");
      // don't clear if user already typed and we are reopening quickly? but clear on open for fresh
      // keep value if coming from error retry
      setTimeout(()=> emailInput.focus(), 30);
    }
    // trap focus will be handled via keydown
  }

  function closeBeta(){
    if(!overlay) return;
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if(lastTrigger && typeof lastTrigger.focus === 'function'){
      lastTrigger.focus();
    }
  }

  // Open triggers
  document.addEventListener("click", (e)=>{
    const trigger = e.target.closest("[data-beta-open]");
    if(trigger){
      // if we have a real Play URL, let the link navigate (updatePlayCtas already removed data-beta-open in that case)
      // but if trigger is explicitly beta (hero secondary etc), always open modal even when Play URL exists? spec says when GOOGLE_PLAY_URL non-empty, CTA may become Get it on Google Play and open Play Store. So beta-only buttons should still open modal.
      // Detect: if element has data-beta-only, always modal. Otherwise check hasPlayUrl and if trigger is a play-url link, let it go.
      const isPlayUrl = trigger.hasAttribute("data-play-url");
      if(isPlayUrl && hasPlayUrl){
        return; // allow navigation
      }
      e.preventDefault();
      openBeta(trigger);
    }
  });

  if(overlay){
    overlay.addEventListener("click", (e)=>{
      if(e.target === overlay) closeBeta();
    });
    $$("[data-beta-close]", overlay).forEach(btn=>{
      btn.addEventListener("click", (e)=>{
        e.preventDefault();
        closeBeta();
      });
    });
    document.addEventListener("keydown", (e)=>{
      if(e.key === "Escape" && overlay.classList.contains("open")){
        e.preventDefault();
        closeBeta();
      }
    });
  }

  if(form && emailInput && errorEl && successEl){
    form.addEventListener("submit", (e)=>{
      e.preventDefault();
      const val = (emailInput.value || "").trim();
      lastEmail = val;
      if(!val){
        errorEl.textContent = "Please enter your email address.";
        emailInput.setAttribute("aria-invalid", "true");
        emailInput.focus();
        return;
      }
      if(!isValidEmail(val)){
        errorEl.textContent = "Please enter a valid email address.";
        emailInput.setAttribute("aria-invalid", "true");
        emailInput.focus();
        return;
      }
      // valid
      errorEl.textContent = "";
      emailInput.removeAttribute("aria-invalid");
      // Show success state — do NOT claim backend storage
      form.hidden = true;
      successEl.classList.add("open");
      if(successEmailEl){
        successEmailEl.textContent = val;
      }
      // Update fallback mailto to include user's email in body for convenience (keeps required subject)
      if(fallbackBtn){
        const subject = encodeURIComponent("Arrow Escape Beta");
        const body = encodeURIComponent("Hi Fusix Studio,\n\nPlease add me to the Arrow Escape beta. My email is: " + val + "\n\nThanks!");
        fallbackBtn.setAttribute("href", "mailto:"+EMAIL+"?subject="+subject+"&body="+body);
        // Also ensure plain required href works without body as fallback per spec
        fallbackBtn.dataset.mailtoBase = "mailto:"+EMAIL+"?subject="+subject;
      }
      // Optional: store locally for future backend hook (no network request)
      try{
        localStorage.setItem("arrow_escape_beta_email", val);
        localStorage.setItem("arrow_escape_beta_ts", String(Date.now()));
      }catch(_){}

      // For future backend: expose event
      document.dispatchEvent(new CustomEvent("beta:requested", { detail: { email: val }}));
    });

    // clear error on input
    emailInput.addEventListener("input", ()=>{
      if(errorEl.textContent){
        errorEl.textContent = "";
        emailInput.removeAttribute("aria-invalid");
      }
    });
  }

  // Respect reduced motion
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Hero board demo: cycle arrows along a path ---
  const heroBoard = $("[data-hero-board]");
  if(heroBoard && !prefersReduced){
    let idx = 0;
    const arrows = $$(".arrow-move", heroBoard);
    const traces = $$(".path-trace", heroBoard);
    function tick(){
      arrows.forEach(a=> a.style.opacity = "1");
      traces.forEach(t=> t.classList.remove("on"));
      const a = arrows[idx % arrows.length];
      const t = traces[idx % traces.length];
      if(a){
        a.style.transform = "translateX(0)";
        requestAnimationFrame(()=>{
          a.style.transform = "translateX(8px)";
          if(t) t.classList.add("on");
          setTimeout(()=>{ a.style.transform = "translateX(0)"; }, 720);
        });
      }
      idx++;
    }
    tick();
    setInterval(tick, 1600);
  }

  // --- Motion section: sequenced escape ---
  const motion = $("[data-motion-board]");
  if(motion && !prefersReduced){
    const order = $$("[data-step]", motion);
    let k = 0;
    function run(){
      order.forEach(el=> {
        el.style.opacity = ".55";
        el.style.transform = "translate(0,0)";
        const trace = el.querySelector(".path-trace");
        if(trace) trace.classList.remove("on");
      });
      const el = order[k % order.length];
      if(!el) return;
      el.style.opacity = "1";
      el.style.transform = "translateX(6px)";
      const tr = el.querySelector(".path-trace");
      if(tr) tr.classList.add("on");
      setTimeout(()=>{ el.style.opacity = ".18"; el.style.transform = "translateX(38px)"; }, 900);
      k++;
    }
    let started=false;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting && !started){
          started=true;
          run();
          setInterval(run, 1500);
        }
      });
    }, {threshold:.3});
    if(motion) io.observe(motion);
  }

  // Smooth scroll for "How to Play"
  const howBtn = $("[data-how-btn]");
  if(howBtn){
    howBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const target = document.querySelector(howBtn.getAttribute("href"));
      if(target) target.scrollIntoView({behavior: prefersReduced ? "auto" : "smooth", block:"start"});
    });
  }

})();
