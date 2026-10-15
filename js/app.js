(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const faDigits = value => String(value).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
  const defaultTexts = {
    stars: [
      "حتی کوچک‌ترین نور هم می‌تواند تاریکی را تغییر دهد.",
      "لازم نیست همه‌ی مسیر را ببینی؛ قدم بعدی هم کافی است.",
      "برای رؤیاهایی که هنوز جرئت دنبال‌کردنشان را پیدا نکرده‌ای.",
      "تو سزاوار آرامشی هستی که دنبالش می‌گردی.",
      "بعضی اتفاق‌های قشنگ، از یک امید کوچک شروع می‌شوند.",
      "اگر امروز سخت بود، فردا فرصت تازه‌ای برای شکفتن است.",
      "هیچ شبی برای همیشه شب نمی‌ماند.",
      "آرام‌آرام هم می‌شود به دورترین ستاره رسید.",
      "گاهی استراحت‌کردن هم بخشی از پیشرفت است.",
      "به خودت همان‌قدر مهربانی بده که به دیگران می‌دهی.",
      "جهان هنوز پر از چیزهایی است که ندیده‌ای.",
      "امید، چراغ کوچکی است که راه را پیدا می‌کند."
    ],
    locked: "این محتوا هنوز با رمز صحیح باز نشده است."
  };
  let texts = defaultTexts;
  let decryptedContent = null;
  let audioContext = null, masterGain = null, audioTimer = null, audioOn = false;
  const foundStars = new Set(JSON.parse(localStorage.getItem("parnika-found-stars") || "[]"));

  // Lightweight canvas starfield; scales with device pixel ratio and viewport.
  const canvas = $("#starfield"), ctx = canvas.getContext("2d");
  let stars = [], width = 0, height = 0, dpr = 1;
  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px"; canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(230, Math.max(105, Math.floor(width * height / 4200)));
    stars = Array.from({length: count}, () => ({x: Math.random()*width, y: Math.random()*height, r: Math.random()*1.3+.25, a: Math.random()*.55+.15, s: Math.random()*.012+.002, p: Math.random()*6}));
  }
  function drawStars() {
    ctx.clearRect(0,0,width,height);
    for (const s of stars) {
      s.p += s.s;
      const alpha = s.a * (.68 + Math.sin(s.p)*.32);
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(202,231,255,${alpha})`; ctx.fill();
      if (s.r > 1.1) { ctx.strokeStyle=`rgba(161,221,255,${alpha*.3})`;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(s.x-s.r*2.2,s.y);ctx.lineTo(s.x+s.r*2.2,s.y);ctx.moveTo(s.x,s.y-s.r*2.2);ctx.lineTo(s.x,s.y+s.r*2.2);ctx.stroke(); }
    }
    requestAnimationFrame(drawStars);
  }
  resizeCanvas(); drawStars(); window.addEventListener("resize", resizeCanvas);

  // Intro transition
  $("#enterBtn").addEventListener("click", async () => {
    // Browsers block unsolicited autoplay; this first tap is the permission gesture.
    audioOn = true;
    startAmbient();
    $("#intro").classList.add("leaving");
    try { sessionStorage.setItem("parnika-entered", "1"); } catch {}
  });
  // Respect the intro but don't replay it after navigating/reloading this session.
  try { if (sessionStorage.getItem("parnika-entered") === "1") $("#intro").classList.add("leaving"); } catch {}

  // Responsive navigation
  $("#menuToggle").addEventListener("click", () => {
    const open = $("#mainNav").classList.toggle("open");
    $("#menuToggle").setAttribute("aria-expanded", String(open));
    $("#menuToggle").textContent = open ? "×" : "☰";
  });
  $$("#mainNav a").forEach(a => a.addEventListener("click", () => {
    $("#mainNav").classList.remove("open"); $("#menuToggle").setAttribute("aria-expanded","false"); $("#menuToggle").textContent="☰";
  }));

  // Star messages are editable in data/texts.json; the bundled fallback makes file:// testing work.
  fetch("data/texts.json").then(r => r.ok ? r.json() : Promise.reject()).then(data => { if (Array.isArray(data.starMessages) && data.starMessages.length) texts.stars = data.starMessages; }).catch(() => {});
  const starContainer = $("#starButtons");
  // Every visit gets a fresh sky: random positions, varied twinkle speed, and many more stars.
  const skyStarCount = 42;
  const starPositions = [];
  for (let i = 0; i < skyStarCount; i++) {
    let candidate, tries = 0;
    do {
      candidate = {x: 4 + Math.random() * 92, y: 5 + Math.random() * 82};
      tries++;
    } while (tries < 35 && starPositions.some(p => Math.hypot(p.x-candidate.x, p.y-candidate.y) < 8));
    starPositions.push(candidate);
  }
  starPositions.forEach(({x,y}, i) => {
    const button = document.createElement("button");
    button.className = "sky-star" + (foundStars.has(i) ? " found" : "");
    button.style.left = x + "%"; button.style.top = y + "%";
    button.style.setProperty("--dur", (1.7 + Math.random()*3.1) + "s");
    button.style.setProperty("--size", (0.75 + Math.random()*0.8).toFixed(2));
    button.textContent = Math.random() > .72 ? "✦" : "✧";
    button.setAttribute("aria-label", `ستاره ${i+1}`);
    button.addEventListener("click", () => {
      const message = texts.stars[i % texts.stars.length];
      button.classList.add("found"); foundStars.add(i);
      localStorage.setItem("parnika-found-stars", JSON.stringify([...foundStars]));
      updateStarsFound();
      openMessage("یک پیام از آسمان", message, "A STAR FOR YOU");
    });
    starContainer.appendChild(button);
  });
  function updateStarsFound() { $("#starsFound").textContent = `${faDigits(foundStars.size)} ستاره کشف شده`; }
  updateStarsFound();

  // AES-GCM payload format: {version:1, kdf:"PBKDF2-SHA-256", iterations:250000, salt, iv, ciphertext}
  // The secret is never stored in source. PBKDF2 makes the entered passphrase the only key input.
  function fromB64(s) { const bin = atob(s); return Uint8Array.from(bin, c => c.charCodeAt(0)); }
  function toB64(bytes) { let bin=""; bytes.forEach(b => bin += String.fromCharCode(b)); return btoa(bin); }
  async function decryptPayload(payload, passphrase) {
    if (!payload || payload.version !== 1 || !payload.salt || !payload.iv || !payload.ciphertext) throw new Error("payload");
    const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey({name:"PBKDF2",salt:fromB64(payload.salt),iterations:payload.iterations||250000,hash:"SHA-256"}, material, {name:"AES-GCM",length:256}, false, ["decrypt"]);
    const plain = await crypto.subtle.decrypt({name:"AES-GCM",iv:fromB64(payload.iv)},key,fromB64(payload.ciphertext));
    return JSON.parse(new TextDecoder().decode(plain));
  }
  async function loadEncryptedFile(path, passphrase) {
    const url = new URL(path, document.baseURI);
    const response = await fetch(url.href, {cache:"no-store"});
    if (!response.ok) throw new Error(`http-${response.status}`);
    return decryptPayload(await response.json(), passphrase);
  }
  $("#unlockForm").addEventListener("submit", async event => {
    event.preventDefault();
    const passphrase = $("#passphrase").value;
    const status = $("#unlockStatus");
    status.className = "form-status"; status.textContent = "دارم رمز را بررسی می‌کنم…";
    if (!window.crypto || !crypto.subtle) { status.classList.add("error"); status.textContent = "رمزنگاری در این مرورگر در دسترس نیست. سایت را از طریق GitHub Pages یا localhost باز کن."; return; }
    try {
      // Both files must decrypt with the same passphrase. Nothing is retained beyond this page session.
      const [letters, gifts] = await Promise.all([
        loadEncryptedFile("data/letters.enc.json", passphrase),
        loadEncryptedFile("data/gifts.enc.json", passphrase)
      ]);
      if (!Array.isArray(letters.letters) || !Array.isArray(gifts.gifts)) throw new Error("format");
      decryptedContent = {letters:letters.letters, gifts:gifts.gifts};
      renderLetters(decryptedContent.letters); renderGifts(decryptedContent.gifts);
      $("#lettersGrid").classList.remove("hidden"); $("#giftsGrid").classList.remove("hidden"); $("#giftsLocked").classList.add("hidden");
      status.classList.add("success"); status.textContent = "رمز درست است؛ نامه‌ها و هدیه‌ها باز شدند. ✧";
      $("#passphrase").value = "";
      $("#lettersGrid").scrollIntoView({behavior:"smooth",block:"nearest"});
    } catch (error) {
      console.error("PARNIKA unlock error:", error);
      status.classList.add("error");
      if (error && (error.name === "OperationError" || error.name === "DataError")) {
        status.textContent = "رمز اشتباه است یا فایل‌ها با رمزهای متفاوت ساخته شده‌اند. برای نمونه‌های این پروژه رمز parnika-demo را وارد کن.";
      } else if (error && String(error.message).startsWith("http-")) {
        status.textContent = "فایل رمزنگاری‌شده پیدا نشد (" + error.message + "). مطمئن شو پوشه‌ی data کنار index.html قرار دارد و کل پروژه را آپلود کرده‌ای.";
      } else if (error instanceof TypeError) {
        status.textContent = "مرورگر نتوانست فایل‌ها را بخواند. اگر index.html را مستقیم باز کرده‌ای، این کار را نکن؛ پروژه را با localhost یا GitHub Pages اجرا کن.";
      } else {
        status.textContent = "باز کردن فایل‌ها ناموفق بود. پروژه را از localhost یا GitHub Pages اجرا کن و در کنسول مرورگر جزئیات خطا را ببین.";
      }
    }
  });
  function renderLetters(letters) {
    const grid = $("#lettersGrid"); grid.replaceChildren();
    letters.forEach((letter, i) => {
      const card = document.createElement("button"); card.type="button"; card.className="letter-card";
      card.innerHTML = `<span class="letter-icon">✉</span><h4></h4><p></p>`;
      $("h4",card).textContent = letter.title || `نامه ${i+1}`;
      $("p",card).textContent = letter.preview || "یک نامه‌ی کوچک برای تو";
      card.addEventListener("click", () => openMessage(letter.title || "نامه‌ای برای تو", letter.body || "", "A SEALED LETTER"));
      grid.appendChild(card);
    });
  }
  function renderGifts(gifts) {
    const grid = $("#giftsGrid"); grid.replaceChildren();
    gifts.forEach((gift, i) => {
      const card = document.createElement("button"); card.type="button"; card.className="gift-card";
      card.style.setProperty("--gift-glow", gift.glow || "#8acaff");
      card.innerHTML = `<div class="gift-art"></div><h3></h3><p></p><span class="gift-open-hint">برای باز کردن لمس کن ↗</span>`;
      $(".gift-art",card).textContent = gift.emoji || "🎁";
      $("h3",card).textContent = gift.title || `هدیه ${i+1}`;
      $("p",card).textContent = gift.description || "";
      card.addEventListener("click", () => {
        $("#giftModalArt").textContent = gift.emoji || "🎁";
        $("#giftModalTitle").textContent = gift.title || "یک هدیه برای تو";
        $("#giftModalDesc").textContent = gift.description || "";
        $("#giftModalLetter").textContent = gift.letter || "";
        $("#giftModal").classList.remove("hidden");
      });
      grid.appendChild(card);
    });
  }
  function openMessage(title, body, eyebrow) {
    $("#modalTitle").textContent=title; $("#modalBody").textContent=body; $("#modalEyebrow").textContent=eyebrow;
    $("#messageModal").classList.remove("hidden");
  }
  $$("[data-close='modal']").forEach(el => el.addEventListener("click", () => $("#messageModal").classList.add("hidden")));
  $$("[data-close='gift-modal']").forEach(el => el.addEventListener("click", () => $("#giftModal").classList.add("hidden")));
  document.addEventListener("keydown", e => { if(e.key==="Escape"){ $("#messageModal").classList.add("hidden"); $("#giftModal").classList.add("hidden"); } });

  // Original calm cosmic ambience, generated locally: soft layered pads + sparse bell notes.
  // Audio starts on the intro button tap because browsers block unsolicited autoplay.
  let chimeTimer = null;
  function startAmbient() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { $("#soundLabel").textContent="صدا پشتیبانی نمی‌شود"; return; }
    if (!audioContext) {
      audioContext = new AC();
      masterGain = audioContext.createGain(); masterGain.gain.value = 0; masterGain.connect(audioContext.destination);
      const compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.value = -26; compressor.knee.value = 20; compressor.ratio.value = 3;
      compressor.attack.value = .08; compressor.release.value = .8;
      // Keep the synth very quiet and warm.
      const padBus = audioContext.createGain(); padBus.gain.value = .42;
      const padFilter = audioContext.createBiquadFilter(); padFilter.type = "lowpass"; padFilter.frequency.value = 520; padFilter.Q.value = .25;
      padBus.connect(padFilter); padFilter.connect(compressor); compressor.connect(masterGain);
      const chords = [ [110,164.81,220,261.63], [98,146.83,196,246.94], [130.81,164.81,196,261.63], [87.31,130.81,174.61,220] ];
      chords[0].forEach((freq, i) => {
        const osc = audioContext.createOscillator(), gain = audioContext.createGain();
        osc.type = i === 0 ? "sine" : "triangle";
        osc.frequency.value = freq; osc.detune.value = i % 2 ? -4 : 3;
        gain.gain.value = [0.12,0.055,0.035,0.022][i];
        osc.connect(gain); gain.connect(padBus); osc.start();
      });
      // Slow, subtle harmonic movement.
      let chordIndex = 0;
      const changeChord = () => {
        if (!audioOn || !audioContext) return;
        chordIndex = (chordIndex + 1) % chords.length;
        const now = audioContext.currentTime;
        const oscillators = padBus; // gentle filter breathing gives the pad a floating feel
        padFilter.frequency.cancelScheduledValues(now);
        padFilter.frequency.setTargetAtTime([520,430,610,470][chordIndex], now, 3.5);
      };
      audioTimer = window.setInterval(changeChord, 9000);
      const lfo = audioContext.createOscillator(), lfoGain = audioContext.createGain();
      lfo.frequency.value = .055; lfoGain.gain.value = .018;
      lfo.connect(lfoGain); lfoGain.connect(masterGain.gain); lfo.start();
      // Soft, sparse pentatonic bell tones; no downloaded track or third-party service.
      const notes = [523.25,659.25,783.99,659.25,587.33,783.99,880,783.99,659.25,587.33,523.25];
      let noteIndex = 0;
      chimeTimer = window.setInterval(() => {
        if (!audioOn || !audioContext || audioContext.state !== "running") return;
        const now = audioContext.currentTime, osc = audioContext.createOscillator(), g = audioContext.createGain(), tone = notes[noteIndex++ % notes.length];
        osc.type = "sine"; osc.frequency.setValueAtTime(tone, now);
        g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.012, now + .22);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);
        osc.connect(g); g.connect(compressor); osc.start(now); osc.stop(now + 4);
      }, 3100);
    }
    audioContext.resume();
    masterGain.gain.cancelScheduledValues(audioContext.currentTime);
    masterGain.gain.setTargetAtTime(audioOn ? 0.75 : 0, audioContext.currentTime, 1.8);
    $("#soundLabel").textContent = audioOn ? "صدا روشن" : "صدا خاموش";
    $("#soundToggle").setAttribute("aria-pressed", String(audioOn));
  }
  $("#soundToggle").addEventListener("click", () => { audioOn = !audioOn; startAmbient(); });

  // Wish animation works now; actual Telegram delivery is intentionally not faked.
  $("#wishText").addEventListener("input", () => { $("#wishCount").textContent = `${faDigits($("#wishText").value.length)} / ۵۰۰`; });
  $("#wishForm").addEventListener("submit", event => {
    event.preventDefault();
    const text = $("#wishText").value.trim(); if (!text) return;
    const star = $("#shootingStar"); star.classList.remove("fly"); void star.offsetWidth; star.classList.add("fly");
    $("#wishStatus").className="form-status success";
    $("#wishStatus").textContent="آرزوت به آسمان سپرده شد… (نمایشی؛ اتصال تلگرام در مرحله‌ی سرور اضافه می‌شود)";
    $("#wishText").value=""; $("#wishCount").textContent="۰ / ۵۰۰";
    window.setTimeout(() => { $("#wishStatus").textContent="این آرزو هنوز به تلگرام ارسال نشده؛ برای ارسال واقعی باید API سرور را متصل کنیم."; $("#wishStatus").className="form-status"; }, 4200);
  });
  $("#year").textContent = new Date().getFullYear();
})();