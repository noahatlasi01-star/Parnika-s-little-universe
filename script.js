/* جهانی کوچک برای تو — متن‌ها را از بخش CONFIG در همین فایل شخصی‌سازی کن. */
const CONFIG = {
  recipientName: "تو", // نام یا لقب او را اینجا بنویس.
  senderName: "کسی که به تو اهمیت می‌دهد", // اسم یا لقب خودت
  personalMessage: "امیدوارم این جهان کوچک لبخندی روی لبت بیاورد و لحظه‌ای به تو فرصت بدهد که نفس راحتی بکشی و احساس کنی امروز، روز توست. سزاوار اتفاق‌های خوب، روزهای آرام و آسمانی پر از آرزوهای قشنگی.",
  secretMessage: "تولدت مبارک، ستاره‌ی قشنگ من. این گوشه‌ی کوچک از جهان را برای تو ساختم، به امید اینکه ذره‌ای از شگفتی‌ای را به تو هدیه بدهد که خودت به دنیای اطرافت می‌آوری. به شیوه‌ی خودت بدرخش و هیچ‌وقت فراموش نکن که دنیا هنوز پر از چیزهای قشنگی است که منتظر کشف شدن‌اند. ♡",
  showNameInput: true
};

const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");
let stars = [], width = 0, height = 0, dpr = 1, toastTimer;
const $ = (id) => document.getElementById(id);

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth; height = window.innerHeight;
  canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr);
  canvas.style.width = width + "px"; canvas.style.height = height + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stars = Array.from({ length: Math.min(220, Math.floor(width * height / 6500)) }, () => ({
    x: Math.random() * width, y: Math.random() * height, r: Math.random() * 1.35 + .25,
    a: Math.random() * .6 + .18, speed: Math.random() * .014 + .003, phase: Math.random() * Math.PI * 2
  }));
}
function drawStars(time = 0) {
  ctx.clearRect(0, 0, width, height);
  for (const s of stars) {
    const alpha = s.a * (.72 + .28 * Math.sin(time * s.speed + s.phase));
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(195,225,255,${alpha})`; ctx.fill();
  }
  requestAnimationFrame(drawStars);
}
resizeCanvas(); requestAnimationFrame(drawStars); window.addEventListener("resize", resizeCanvas);

function showToast(message) {
  const toast = $("toast"); toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function shootStar(x, y) {
  const el = document.createElement("span"); el.className = "shooting-star";
  el.style.left = `${x ?? (window.innerWidth * (.25 + Math.random() * .5))}px`;
  el.style.top = `${y ?? (window.innerHeight * (.15 + Math.random() * .4))}px`;
  document.body.appendChild(el); setTimeout(() => el.remove(), 1200);
}
$("shootingStarButton").addEventListener("click", () => { shootStar(); showToast("آرزویت راهی آسمان آبی شد ✧"); });
$("wishButton").addEventListener("click", () => {
  for (let i = 0; i < 4; i++) setTimeout(() => shootStar(window.innerWidth * (.25 + Math.random() * .5), window.innerHeight * (.2 + Math.random() * .45)), i * 150);
  $("wishFeedback").textContent = "آرزویت را آرام به ستاره‌ها سپردیم. امیدوارم اتفاقی قشنگ در راهت باشد. ✦";
  showToast("آرزو به جهان سپرده شد ✨");
});

const backdrop = $("modalBackdrop");
function safeText(text) {
  return String(text).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
}
function openModal(type) {
  backdrop.hidden = false; document.body.classList.add("modal-open");
  $("modalExtra").innerHTML = ""; $("modalVisual").innerHTML = "";
  const configs = {
    stars: {
      eyebrow: "کشفی کوچک", title: "آسمانی پر از شگفتی‌های کوچک", visual: "✦　✧　⋆　✧　✦",
      body: `<p>بعضی ستاره‌ها از زمانی بسیار دور می‌درخشند و بعضی دیگر تازه دارند نورشان را به ما می‌رسانند.</p><p>به آسمان کوچک زیر دست بزن. هر درخشش یادآوری کوچکی دارد: <em>لازم نیست همه‌چیز را یک‌باره انجام بدهی؛ می‌توانی زندگی را قدم‌به‌قدم و ستاره‌به‌ستاره پیش ببری.</em></p>`,
      extra: `<div class="constellation-board" id="sparkleBoard" aria-label="برای دیدن پیام‌ها روی ستاره‌ها بزن"></div><p id="sparkleMessage" class="personal-note">یکی از ستاره‌ها را انتخاب کن.</p>`
    },
    constellation: {
      eyebrow: "ستاره‌ی تو", title: "نورها را به هم وصل کن", visual: "✧",
      body: `<p>هر صورت فلکی از نورهای پراکنده شروع می‌شود. روی هر پنج ستاره بزن تا آن‌ها را به هم وصل کنی و پیامی را ببینی.</p>`,
      extra: `<div class="constellation-board" id="constellationBoard"><svg viewBox="0 0 300 150" preserveAspectRatio="none" id="constellationLines"></svg></div><p id="constellationMessage" class="personal-note">۵ ستاره منتظر تو هستند.</p>`
    },
    flower: {
      eyebrow: "هدیه‌ای کوچک", title: "گلی از جنس آبی",
      visual: `<div class="flower-art" id="flowerArt">${Array.from({length:6}, () => '<span class="petal"></span>').join("")}<span class="center"></span></div>`,
      body: `<p>بعضی چیزها برای شکوفه‌دادن به دلیل خاصی نیاز ندارند؛ فقط کمی نور، کمی زمان و جایی برای رشد می‌خواهند.</p><p>این گل آبی کوچک را برای خودت باز کن. 🌸</p>`,
      extra: `<button class="mini-button" id="bloomButton" type="button">کمک کن گل شکوفه کند ✧</button><p id="flowerMessage" class="personal-note"></p>`
    },
    letter: {
      eyebrow: "یادداشتی از دل", title: `چند کلمه برای ${safeText(CONFIG.recipientName)}`,
      visual: "♡", body: `<p class="personal-note">${safeText(CONFIG.personalMessage)}</p><p>— ${safeText(CONFIG.senderName)}</p>`,
      extra: `<p style="color:#799ac8;font-size:11px;margin-top:20px">یادداشتی کوچک، با دقت و مهر نوشته شده.</p>`
    },
    secret: {
      eyebrow: "پیدایش کردی!", title: "برای ستاره‌ی دوست‌داشتنی",
      visual: "✦　♡　✦",
      body: `<p class="personal-note">${safeText(CONFIG.secretMessage)}</p><p>تولدت مبارک، ${safeText(CONFIG.recipientName)}. امیدوارم دور تازه‌ای که به دور خورشید می‌زنی پر از آدم‌های مهربان، شگفتی‌های تازه و لحظه‌هایی باشد که به تو حس زنده‌بودن و خوشحالی می‌دهند.</p>`,
      extra: `<p style="color:#8acfff;font:italic 14px var(--serif);margin-top:22px">با مهر، ${safeText(CONFIG.senderName)} ♡</p>`
    }
  };
  const c = configs[type];
  $("modalEyebrow").textContent = c.eyebrow; $("modalTitle").textContent = c.title;
  $("modalVisual").innerHTML = c.visual; $("modalBody").innerHTML = c.body; $("modalExtra").innerHTML = c.extra;
  if (type === "stars") setupSparkleBoard();
  if (type === "constellation") setupConstellation();
  if (type === "flower") $("bloomButton").addEventListener("click", () => {
    $("flowerArt").classList.add("bloomed"); $("flowerMessage").textContent = "امیدوارم همیشه دلیل کوچکی برای شکوفه‌دادن پیدا کنی. ♡";
    for (let i = 0; i < 3; i++) setTimeout(() => shootStar(window.innerWidth / 2 + (Math.random() - .5) * 120, window.innerHeight / 2), i * 100);
  });
}
function setupSparkleBoard() {
  const board = $("sparkleBoard");
  const notes = [
    "تو هم سزاوار مهربانی هستی؛ مخصوصاً از طرف خودت. ✧",
    "قرار نیست با سرعت دیگران پیش بروی. ♡",
    "هنوز کلی اتفاق قشنگ در راه است.",
    "استراحت هم بخشی از رشد کردن است. ✦",
    "همین که خودت هستی، دنیا را کمی جالب‌تر می‌کنی."
  ];
  for (let i = 0; i < 18; i++) {
    const star = document.createElement("button"); star.type = "button"; star.setAttribute("aria-label", "نمایش پیام ستاره");
    star.style.left = `${6 + Math.random() * 88}%`; star.style.top = `${8 + Math.random() * 82}%`;
    star.style.opacity = `${.45 + Math.random() * .55}`; star.style.transform = `scale(${.55 + Math.random() * .7})`;
    star.addEventListener("click", () => {
      $("sparkleMessage").textContent = notes[Math.floor(Math.random() * notes.length)];
      star.classList.add("connected"); shootStar(window.innerWidth / 2 + (Math.random() - .5) * 150, window.innerHeight / 2);
    });
    board.appendChild(star);
  }
}
function setupConstellation() {
  const board = $("constellationBoard");
  const points = [{x:12,y:64},{x:33,y:25},{x:51,y:58},{x:71,y:28},{x:88,y:67}];
  let count = 0;
  points.forEach((p, i) => {
    const b = document.createElement("button"); b.type = "button"; b.style.left = `${p.x}%`; b.style.top = `${p.y}%`;
    b.setAttribute("aria-label", `اتصال ستاره‌ی ${i + 1}`);
    b.addEventListener("click", () => {
      if (b.classList.contains("connected")) return;
      b.classList.add("connected"); count++;
      if (count > 1) {
        const prev = points[i - 1], line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", `${prev.x * 3}`); line.setAttribute("y1", `${prev.y * 1.5}`);
        line.setAttribute("x2", `${p.x * 3}`); line.setAttribute("y2", `${p.y * 1.5}`);
        $("constellationLines").appendChild(line);
      }
      $("constellationMessage").textContent = count === 5
        ? `این صورت فلکی کوچک برای ${CONFIG.recipientName} است. حتی نورهای دور از هم هم می‌توانند چیز زیبایی بسازند. ♡`
        : `${5 - count} ستاره‌ی دیگر مانده…`;
    });
    board.appendChild(b);
  });
}
function closeModal() { backdrop.hidden = true; document.body.classList.remove("modal-open"); }
document.querySelectorAll("[data-modal]").forEach(button => button.addEventListener("click", () => openModal(button.dataset.modal)));
$("secretButton").addEventListener("click", () => openModal("secret"));
$("closeModal").addEventListener("click", closeModal);
backdrop.addEventListener("click", e => { if (e.target === backdrop) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !backdrop.hidden) closeModal(); });
document.addEventListener("click", e => {
  if (e.target.closest("button") || e.target.closest("a")) return;
  if (Math.random() > .5) shootStar(e.clientX, e.clientY);
});

/* موسیقی پس‌زمینه‌ی ساخته‌شده با Web Audio؛ بدون فایل خارجی و فقط پس از لمس دکمه پخش می‌شود. */
let audioContext = null, masterGain = null, musicTimer = null, musicOn = false, noteIndex = 0;
const melody = [261.63, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66, 349.23, 392.00, 349.23, 329.63, 261.63, 293.66, 329.63, 392.00, 329.63];
const chords = [
  [130.81, 196.00, 261.63], [110.00, 164.81, 220.00],
  [87.31, 130.81, 174.61], [98.00, 146.83, 196.00]
];
function playTone(freq, start, duration, volume, type = "sine") {
  const osc = audioContext.createOscillator(), gain = audioContext.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0002), start + 0.16);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain); gain.connect(masterGain);
  osc.start(start); osc.stop(start + duration + 0.04);
}
function musicStep() {
  if (!musicOn || !audioContext) return;
  const now = audioContext.currentTime;
  const note = melody[noteIndex % melody.length];
  playTone(note, now, 2.15, 0.075, "sine");
  playTone(note * 2, now + .06, 1.45, 0.014, "sine");
  if (noteIndex % 4 === 0) {
    const chord = chords[Math.floor(noteIndex / 4) % chords.length];
    chord.forEach((f, i) => playTone(f, now + i * .075, 3.7, 0.018, "triangle"));
  }
  noteIndex++;
}
async function startMusic() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) { showToast("مرورگر این دستگاه از موسیقی پشتیبانی نمی‌کند."); return; }
  audioContext = audioContext || new AudioCtx();
  await audioContext.resume();
  masterGain = audioContext.createGain(); masterGain.gain.value = 0.32; masterGain.connect(audioContext.destination);
  musicOn = true; musicStep(); musicTimer = setInterval(musicStep, 1050);
  $("soundState").textContent = "موسیقی روشن"; $("soundIcon").textContent = "♫";
  showToast("موسیقی آرام آسمان آبی پخش شد ♫");
}
function stopMusic() {
  musicOn = false; clearInterval(musicTimer); musicTimer = null;
  if (masterGain && audioContext) {
    const oldGain = masterGain; oldGain.gain.setTargetAtTime(0.0001, audioContext.currentTime, .18);
    setTimeout(() => { try { oldGain.disconnect(); } catch (_) {} }, 900);
  }
  masterGain = null; $("soundState").textContent = "موسیقی خاموش"; $("soundIcon").textContent = "♫";
}
const enterButton = $("enterUniverse");
if (enterButton) {
  enterButton.addEventListener("click", async () => {
    const welcome = $("welcomeScreen");
    welcome.classList.add("leaving");
    setTimeout(() => { welcome.remove(); }, 850);
    try { if (!musicOn) await startMusic(); } catch (_) { showToast("برای پخش موسیقی، دکمه‌ی موسیقی بالای صفحه را لمس کن."); }
  });
}

$("soundToggle").addEventListener("click", async () => {
  try { if (!musicOn) await startMusic(); else stopMusic(); }
  catch (_) { showToast("پخش موسیقی در این دستگاه شروع نشد."); }
});

// برای تغییر سریع نام، روی دکمه‌ی ستاره‌ی پنهان راست‌کلیک کن.
if (CONFIG.showNameInput) {
  $("secretButton").addEventListener("contextmenu", e => {
    e.preventDefault();
    const answer = prompt("دوست داری این جهان او را با چه نامی صدا کند؟", CONFIG.recipientName === "تو" ? "" : CONFIG.recipientName);
    if (answer !== null && answer.trim()) { CONFIG.recipientName = answer.trim(); showToast("نام ستاره‌ی این جهان تغییر کرد ✨"); }
  });
}
