const config = {
  fromLabel: "DE",
  fromName: "DIOMANDE AZZIZ",
  herName: "Schenina Chouchou",
  introText: "J’ai codé une mini app juste pour toi. Glisse dans les écrans et lis jusqu’au bout.",
  confessionTitle: "Tu rends mes journées meilleures",
  confessionText: "Chaque discussion avec toi me donne le sourire. J’aime ton énergie, ton regard et ta douceur.",
  photos: Array.from({ length: 14 }, (_, i) => `assets/photo${i + 1}.jpeg`),
  secretNote: "PS: Tu viens de débloquer un petit feu d’artifice juste pour toi 💗",
};

const screens = [...document.querySelectorAll(".screen")];
const stepText = document.getElementById("stepText");
const bar = document.getElementById("bar");

document.getElementById("fromLabel").textContent = config.fromLabel;
document.getElementById("fromName").textContent = config.fromName;
document.getElementById("herName").textContent = config.herName;
document.getElementById("introText").textContent = config.introText;
document.getElementById("confTitle").textContent = config.confessionTitle;
document.getElementById("confText").textContent = config.confessionText;

let current = 1;

function show(n) {
  current = n;
  screens.forEach((s) => s.classList.toggle("active", Number(s.dataset.screen) === n));
  stepText.textContent = `${n}/4`;
  bar.style.width = `${(n / 4) * 100}%`;
  
  if (n === 2) startNotes();
  else stopNotes();
}

document.querySelectorAll("[data-next]").forEach((btn) =>
  btn.addEventListener("click", () => show(Math.min(4, current + 1)))
);
document.querySelectorAll("[data-back]").forEach((btn) =>
  btn.addEventListener("click", () => show(Math.max(1, current - 1)))
);

/* Masonry gallery */
const masonry = document.getElementById("masonry");
function buildMasonry() {
  if (!masonry) return;
  masonry.innerHTML = "";

  config.photos.forEach((src, idx) => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.innerHTML = `
      <img src="${src}" alt="Photo ${idx + 1}" loading="lazy" />
      <div class="cap">Photo ${idx + 1}</div>
    `;
    tile.addEventListener("click", () => openLightbox(idx));
    masonry.appendChild(tile);
  });
}
buildMasonry();

/* Lightbox */
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbClose = document.getElementById("lbClose");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");
const lbCopy = document.getElementById("lbCopy");

let lbIndex = 0;

function openLightbox(i) {
  lbIndex = i;
  lbImg.src = config.photos[lbIndex];
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
}
function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
}
function navLightbox(dir) {
  lbIndex = (lbIndex + dir + config.photos.length) % config.photos.length;
  lbImg.src = config.photos[lbIndex];
}

lbClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
lbPrev?.addEventListener("click", () => navLightbox(-1));
lbNext?.addEventListener("click", () => navLightbox(+1));

document.addEventListener("keydown", (e) => {
  if (!lightbox?.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") navLightbox(-1);
  if (e.key === "ArrowRight") navLightbox(+1);
});

lbCopy?.addEventListener("click", async () => {
  const msg = "Tu es magnifique. Et je suis chanceux de t’avoir 💗";
  try {
    await navigator.clipboard.writeText(msg);
    lbCopy.textContent = "✓";
    setTimeout(() => (lbCopy.textContent = "♡"), 900);
  } catch {
    prompt("Copie ce petit mot :", msg);
  }
});

/* Date & yes/no */
const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");
const dateHint = document.getElementById("dateHint");

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");

const chosenDate = document.getElementById("chosenDate");
const chosenTime = document.getElementById("chosenTime");

const dEl = document.getElementById("d");
const hEl = document.getElementById("h");
const mEl = document.getElementById("m");
const sEl = document.getElementById("s");

const restartBtn = document.getElementById("restartBtn");
const copyLinkBtn = document.getElementById("copyLinkBtn");

function pad(n){ return String(n).padStart(2,"0"); }
function formatDateFR(iso){
  const [y,m,d] = iso.split("-").map(Number);
  return new Date(y,m-1,d).toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
}
(function initDateMin(){
  const now = new Date();
  dateInput.min = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
})();

let countdownTimer = null;

function startCountdown(target){
  if (countdownTimer) clearInterval(countdownTimer);

  const tick = () => {
    const now = new Date();
    let diff = target - now;
    if (diff < 0) diff = 0;

    const total = Math.floor(diff/1000);
    const days = Math.floor(total/86400);
    const hours = Math.floor((total%86400)/3600);
    const mins = Math.floor((total%3600)/60);
    const secs = total%60;

    dEl.textContent = pad(days);
    hEl.textContent = pad(hours);
    mEl.textContent = pad(mins);
    sEl.textContent = pad(secs);
  };

  tick();
  countdownTimer = setInterval(tick, 1000);
}

yesBtn.addEventListener("click", () => {
  const dateVal = dateInput.value;
  const timeVal = timeInput.value || "20:00";

  if (!dateVal){
    dateHint.textContent = "Choisis une date. Sinon ton “oui” ne veut rien dire.";
    dateHint.style.color = "rgba(255,180,210,.95)";
    dateInput.focus();
    return;
  }

  chosenDate.textContent = formatDateFR(dateVal);
  chosenTime.textContent = timeVal;

  const [y,m,d] = dateVal.split("-").map(Number);
  const [hh,mm] = timeVal.split(":").map(Number);
  const target = new Date(y,m-1,d,hh,mm,0,0);

  show(4);
  startCountdown(target);
  launchSurprise(); // <-- surprise finale
});

/* "Non" qui fuit */
function moveNoButton(){
  const btn = noBtn;
  const card = document.querySelector(".card");
  const rect = card.getBoundingClientRect();

  const maxX = rect.width - btn.offsetWidth - 24;
  const maxY = rect.height - btn.offsetHeight - 24;

  const x = Math.max(12, Math.floor(Math.random() * maxX));
  const y = Math.max(12, Math.floor(Math.random() * maxY));

  btn.style.position = "absolute";
  btn.style.left = `${x}px`;
  btn.style.top = `${y}px`;
}
noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("touchstart", (e)=>{ e.preventDefault(); moveNoButton(); }, { passive:false });

restartBtn.addEventListener("click", () => {
  if (countdownTimer) clearInterval(countdownTimer);
  noBtn.style.position = "";
  noBtn.style.left = "";
  noBtn.style.top = "";
  dateInput.value = "";
  timeInput.value = "20:00";
  stopSurprise();
  show(1);
});
const notes = [
  "Merci d’être là 💗",
  "Ton amitié compte énormément",
  "Avec toi je me sens mieux",
  "Tu es une belle personne",
  "Je suis reconnaissant(e)",
  "Merci pour tes encouragements",
  "Tu illumines les journées",
  "Toujours dans mon cœur",
  "On avance ensemble 🤝",
  "T’es une bénédiction"
];

const floatingNotes = document.getElementById("floatingNotes");

function rand(min, max){ return Math.random() * (max - min) + min; }

function spawnNote(){
  if (!floatingNotes) return;

  const note = document.createElement("div");
  note.className = "note";
  note.textContent = notes[Math.floor(Math.random() * notes.length)];

  // Position verticale aléatoire dans la zone photos
  const y = rand(60, floatingNotes.clientHeight - 60);
  note.style.top = `${y}px`;

  // Vitesse / rotation légère
  note.style.setProperty("--dur", `${rand(9, 16)}s`);
  note.style.setProperty("--rot", `${rand(-4, 4)}deg`);

  // Petite variante: parfois un sous-texte
  if (Math.random() > 0.65){
    const sub = document.createElement("small");
    sub.textContent = "💖";
    note.appendChild(sub);
  }

  floatingNotes.appendChild(note);

  // Supprime après l’anim pour éviter l’accumulation
  setTimeout(() => note.remove(), 17000);
}

let notesTimer = null;

function startNotes(){
  if (!floatingNotes) return;
  stopNotes();

  // clean + (re)spawn
  floatingNotes.innerHTML = "";
  for (let i = 0; i < 6; i++) setTimeout(spawnNote, i * 700);

  notesTimer = setInterval(() => {
    // limite de bulles max
    if (floatingNotes.children.length < 10) spawnNote();
  }, 900);
}

function stopNotes(){
  if (notesTimer) clearInterval(notesTimer);
  notesTimer = null;
  if (floatingNotes) floatingNotes.innerHTML = "";
}

const card = document.querySelector(".card");

function onParallax(e){
  if (current !== 2) return; // seulement page photos
  const rect = card.getBoundingClientRect();
  const x = (("touches" in e) ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (("touches" in e) ? e.touches[0].clientY : e.clientY) - rect.top;

  const px = (x / rect.width - 0.5);
  const py = (y / rect.height - 0.5);

  // Déplace très légèrement toutes les tiles
  document.querySelectorAll(".tile").forEach((t, i) => {
    const k = (i % 6 + 1) * 0.6;
    t.style.transform = `translate3d(${px * k}px, ${py * k}px, 0)`;
  });
}

function resetParallax(){
  document.querySelectorAll(".tile").forEach((t) => {
    t.style.transform = "";
  });
}

card?.addEventListener("mousemove", onParallax);
card?.addEventListener("mouseleave", resetParallax);
card?.addEventListener("touchmove", onParallax, { passive: true });
card?.addEventListener("touchend", resetParallax);


copyLinkBtn.addEventListener("click", async () => {
  const url = window.location.href;
  try{
    await navigator.clipboard.writeText(url);
    copyLinkBtn.textContent = "Lien copié ✅";
    setTimeout(()=> copyLinkBtn.textContent = "Copier le lien", 1400);
  } catch {
    prompt("Copie le lien :", url);
  }
});

/* SURPRISE FINALE: Fireworks (Canvas) + message secret */
let fxCanvas, fxCtx, fxRAF, particles = [];
function ensureCanvas(){
  if (fxCanvas) return;
  fxCanvas = document.createElement("canvas");
  fxCanvas.style.position = "fixed";
  fxCanvas.style.inset = "0";
  fxCanvas.style.zIndex = "60";
  fxCanvas.style.pointerEvents = "none";
  document.body.appendChild(fxCanvas);
  fxCtx = fxCanvas.getContext("2d");

  const resize = () => {
    fxCanvas.width = window.innerWidth * devicePixelRatio;
    fxCanvas.height = window.innerHeight * devicePixelRatio;
  };
  window.addEventListener("resize", resize);
  resize();
}

function burst(x, y){
  const count = 90;
  for (let i=0;i<count;i++){
    const a = Math.random() * Math.PI * 2;
    const sp = 2 + Math.random()*6;
    particles.push({
      x, y,
      vx: Math.cos(a)*sp,
      vy: Math.sin(a)*sp,
      life: 70 + Math.random()*40,
      r: 1.2 + Math.random()*2.4,
    });
  }
}

function drawFx(){
  if (!fxCtx) return;
  const w = fxCanvas.width, h = fxCanvas.height;

  fxCtx.clearRect(0,0,w,h);
  fxCtx.save();
  fxCtx.scale(devicePixelRatio, devicePixelRatio);

  // fade trail
  fxCtx.fillStyle = "rgba(0,0,0,0.10)";
  fxCtx.fillRect(0,0,window.innerWidth,window.innerHeight);

  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.life -= 1;
    p.vy += 0.06; // gravity
    p.x += p.vx;
    p.y += p.vy;

    const t = p.life / 110;
    fxCtx.beginPath();
    fxCtx.fillStyle = `rgba(255,79,163,${Math.max(0,t)})`;
    fxCtx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    fxCtx.fill();
  });

  fxCtx.restore();
  fxRAF = requestAnimationFrame(drawFx);
}

let secretToast;
function showSecret(){
  if (secretToast) return;
  secretToast = document.createElement("div");
  secretToast.textContent = config.secretNote;
  secretToast.style.position = "fixed";
  secretToast.style.left = "50%";
  secretToast.style.bottom = "22px";
  secretToast.style.transform = "translateX(-50%)";
  secretToast.style.zIndex = "70";
  secretToast.style.padding = "12px 14px";
  secretToast.style.borderRadius = "999px";
  secretToast.style.border = "1px solid rgba(255,255,255,.14)";
  secretToast.style.background = "rgba(10,8,16,.60)";
  secretToast.style.backdropFilter = "blur(10px)";
  secretToast.style.boxShadow = "0 18px 70px rgba(0,0,0,.55)";
  secretToast.style.fontWeight = "750";
  document.body.appendChild(secretToast);

  setTimeout(()=> {
    secretToast?.remove();
    secretToast = null;
  }, 5000);
}

function launchSurprise(){
  ensureCanvas();
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  burst(cx, cy - 40);
  burst(cx - 140, cy + 10);
  burst(cx + 160, cy + 10);

  if (navigator.vibrate) navigator.vibrate([60, 30, 60]);

  if (!fxRAF) drawFx();
  showSecret();
}

function stopSurprise(){
  if (fxRAF) cancelAnimationFrame(fxRAF);
  fxRAF = null;
  particles = [];
  fxCanvas?.remove();
  fxCanvas = null;
  fxCtx = null;
}

/* Init */
show(1);
