/* ---------------------------
   CONFIGURAÇÃO / ESTADO
--------------------------- */
const GameState = {
  currentGen: null,
  starter: null,
  player: { gender: null, party: [], items: [] }
};

const STARTERS = [
  { name: "Bulbasaur", id: 1 },
  { name: "Charmander", id: 4 },
  { name: "Squirtle", id: 7 }
];

const texts = {
  en: {
    genTitle: "Choose Generation",
    gen1: "Generation 1 (Kanto)",
    genderTitle: "What is your gender?",
    starterTitle: "Professor Oak: Choose your starter Pokémon",
    shinyTitle: "Shiny Roulette",
    finalTitle: "End of test version!",
    finalText: "More content coming soon, stay tuned.",
    restart: "Restart",
    yes: "Yes",
    no: "No",
    spin: "Spin"
  },
  pt: {
    genTitle: "Escolha a Geração",
    gen1: "Geração 1 (Kanto)",
    genderTitle: "Qual é o seu gênero?",
    starterTitle: "Professor Oak: Escolha seu Pokémon inicial",
    shinyTitle: "Roleta de Shiny",
    finalTitle: "Fim da versão teste!",
    finalText: "Em breve mais conteúdo, continue acompanhando.",
    restart: "Reiniciar",
    yes: "Sim",
    no: "Não",
    spin: "Girar"
  }
};

let currentLang = "en";

/* ---------------------------
   sessionStorage helpers
--------------------------- */
function setLanguage(lang) {
  try {
    sessionStorage.setItem("preferredLanguage", lang);
  } catch (e) {
    /* ignore storage errors */
  }
  currentLang = lang;
}

function getLanguage() {
  try {
    return sessionStorage.getItem("preferredLanguage") || "en";
  } catch (e) {
    return "en";
  }
}

/* ---------------------------
   HELPERS UI
--------------------------- */
function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
}

function renderTeamAndBag() {
  const teamGrid = document.getElementById("team-grid");
  if (!teamGrid) return;
  teamGrid.innerHTML = "";
  const party = GameState.player.party || [];
  for (let i = 0; i < 6; i++) {
    const slot = document.createElement("div");
    slot.className = "slot";
    if (party[i]) {
      const p = party[i];
      const img = document.createElement("img");
      img.src = `sprites/pokemon/${p.id}.png`;
      img.alt = p.name;
      if (p.shiny) img.style.filter = "hue-rotate(110deg) saturate(180%)";
      slot.appendChild(img);
    } else { slot.classList.add("empty"); }
    teamGrid.appendChild(slot);
  }

  const bagGrid = document.getElementById("bag-grid");
  if (!bagGrid) return;
  bagGrid.innerHTML = "";
  const items = GameState.player.items || [];
  for (let i = 0; i < 12; i++) {
    const slot = document.createElement("div");
    slot.className = "slot";
    if (items[i]) {
      const it = items[i];
      if (it.icon) {
        const img = document.createElement("img");
        img.src = it.icon;
        img.alt = it.name;
        slot.appendChild(img);
      } else { slot.textContent = it.name; }
      const name = document.createElement("div");
      name.className = "slot-name";
      name.textContent = it.name;
      slot.appendChild(name);
      slot.title = it.name;
    } else { slot.classList.add("empty"); }
    bagGrid.appendChild(slot);
  }
}

function updateBodySprite() {
  const el = document.getElementById("body-sprite");
  if (!el) return;
  el.innerHTML = "";
  if(GameState.player.gender){
    const img = document.createElement("img");
    img.src = `sprites/gender/${GameState.player.gender}.png`;
    img.alt = GameState.player.gender;
    img.style.width="80px";
    img.style.height="80px";
    img.style.objectFit="contain";
    el.appendChild(img);
  }
}

function updateTexts() {
  // Geração
  const genBtn = document.getElementById("gen1Btn");
  if (genBtn) genBtn.textContent = texts[currentLang].gen1;
  const genTitle = document.querySelector("#screen-gen h2");
  if (genTitle) genTitle.textContent = texts[currentLang].genTitle;

  // Gênero
  const genderTitle = document.querySelector("#screen-gender h2");
  if (genderTitle) genderTitle.textContent = texts[currentLang].genderTitle;

  // Starter
  const starterTitle = document.querySelector("#screen-starter h2");
  if (starterTitle) starterTitle.textContent = texts[currentLang].starterTitle;

  // Shiny (if open)
  const shinyTitle = document.querySelector("#screen-shiny h2");
  if (shinyTitle) shinyTitle.textContent = texts[currentLang].shinyTitle;

  // Final
  const finalTitle = document.querySelector("#screen-final h2");
  if (finalTitle) finalTitle.textContent = texts[currentLang].finalTitle;
  const finalText = document.querySelector("#screen-final p");
  if (finalText) finalText.textContent = texts[currentLang].finalText;
  const restartBtn = document.querySelector("#screen-final button");
  if (restartBtn) restartBtn.textContent = texts[currentLang].restart;
}

/* ---------------------------
   TELAS
--------------------------- */
function initGenScreen(){
  const el=document.getElementById("screen-gen");
  if(!el) return;
  el.innerHTML=`<h2>${texts[currentLang].genTitle}</h2><button id="gen1Btn" class="primary">${texts[currentLang].gen1}</button>`;
  const btn = document.getElementById("gen1Btn");
  if(btn) btn.addEventListener("click",()=>{ GameState.currentGen=1; showGenderScreen(); });
  showScreen("screen-gen");
  renderTeamAndBag();
}

function showGenderScreen() {
  const el = document.getElementById("screen-gender");
  if(!el) return;
  el.innerHTML = `<h2>${texts[currentLang].genderTitle}</h2><div class="row" id="gender-row"></div>`;
  showScreen("screen-gender");

  const row = document.getElementById("gender-row");
  const genders = [
    { name: "Boy", file: "sprites/gender/boy.png" },
    { name: "Girl", file: "sprites/gender/girl.png" }
  ];

  row.innerHTML = "";
  genders.forEach(g => {
    const div = document.createElement("div");
    div.className = "gender-option";
    const img = document.createElement("img"); img.src=g.file; img.alt=g.name;
    const label = document.createElement("div"); label.textContent=g.name;
    div.appendChild(img); div.appendChild(label);
    row.appendChild(div);
    div.addEventListener("click", () => {
      GameState.player.gender = g.name.toLowerCase();
      updateBodySprite();
      showStarterScreen();
    });
  });
}

function showStarterScreen() {
  const el = document.getElementById("screen-starter");
  if(!el) return;
  el.innerHTML = `<h2>${texts[currentLang].starterTitle}</h2><div class="row" id="starters-row"></div>`;
  const row = document.getElementById("starters-row");
  row.innerHTML = "";

  STARTERS.forEach(s => {
    const card = document.createElement("div"); card.className="card";
    const img = document.createElement("img"); img.src=`sprites/pokemon/${s.id}.png`; img.alt=s.name;
    const title = document.createElement("div"); title.className="title"; title.textContent=s.name;
    const btn = document.createElement("button");
    btn.textContent = currentLang === "pt" ? "Escolher" : "Choose";
    btn.addEventListener("click", async () => {
      const poke = { ...s }; 
      try {
        const chance = 0.01; 
        const result = await openShinyRoulette({ chance, title: texts[currentLang].shinyTitle });
        if (result && result.isShiny) poke.shiny = true;
        GameState.player.party.push(poke);
        renderTeamAndBag();
        if (poke.shiny) {
          const shinySound = document.getElementById("shiny-sound");
          try { shinySound?.play(); } catch(_) {}
        }
        showFinalScreen();
      } catch (err) {
        console.log("Shiny roulette cancelled or failed:", err && err.message);
      }
    });
    card.appendChild(img); card.appendChild(title); card.appendChild(btn);
    row.appendChild(card);
  });
  showScreen("screen-starter");
}

/* ---------------------------
   Reusable Shiny Roulette (Promise-based, no cancel)
--------------------------- */
function openShinyRoulette({ chance = 0.01, title = null } = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.background = "rgba(0,0,0,0.45)";
    overlay.style.zIndex = 9999;

    const panel = document.createElement("div");
    panel.style.width = "480px";
    panel.style.maxWidth = "95%";
    panel.style.background = "var(--card, #fff)";
    panel.style.borderRadius = "12px";
    panel.style.padding = "16px";
    panel.style.boxShadow = "0 16px 40px rgba(0,0,0,0.4)";
    panel.style.textAlign = "center";
    panel.style.color = "var(--text, #111)";
    overlay.appendChild(panel);

    const h2 = document.createElement("h2");
    h2.style.margin = "0 0 12px 0";
    h2.textContent = title || texts[currentLang].shinyTitle || "Shiny?";
    panel.appendChild(h2);

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    panel.appendChild(wrapper);

    const canvas = document.createElement("canvas");
    canvas.width = 420;
    canvas.height = 420;
    canvas.style.display = "block";
    canvas.style.background = "transparent";
    wrapper.appendChild(canvas);

    const pointer = document.createElement("div");
    pointer.style.position = "absolute";
    pointer.style.top = "0px";
    pointer.style.left = "50%";
    pointer.style.transform = "translateX(-50%)";
    pointer.style.width = "0";
    pointer.style.height = "0";
    pointer.style.borderLeft = "14px solid transparent";
    pointer.style.borderRight = "14px solid transparent";
    pointer.style.borderTop = "26px solid rgb(228,56,56)";
    pointer.style.transformOrigin = "center top";
    wrapper.appendChild(pointer);

    const btn = document.createElement("button");
    btn.className = "primary";
    btn.textContent = texts[currentLang].spin || (currentLang === "pt" ? "Girar" : "Spin");
    btn.style.marginTop = "12px";
    panel.appendChild(btn);

    document.body.appendChild(overlay);

    // slices
    const slices = [
      { label: "Yes", weight: chance, color: "#f0c040" },
      { label: "No",  weight: Math.max(0, 1 - chance), color: "#cfd8dc" }
    ];
    const totalWeight = slices.reduce((s, x) => s + x.weight, 0) || 1;

    let start = -Math.PI / 2;
    for (let sl of slices) {
      const angle = (sl.weight / totalWeight) * 2 * Math.PI;
      sl.start = start;
      sl.end = start + angle;
      sl.mid = (sl.start + sl.end) / 2;
      start += angle;
    }

    const ctx = canvas.getContext("2d");
    const center = canvas.width / 2;
    const radius = center - 16;

    function draw(rotationRad = 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let sl of slices) {
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, sl.start + rotationRad, sl.end + rotationRad);
        ctx.closePath();
        ctx.fillStyle = sl.color;
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.stroke();

        // texto perto da borda (traduzido)
        const midRot = sl.mid + rotationRad;
        const textRadius = radius - 18;
        const x = center + textRadius * Math.cos(midRot);
        const y = center + textRadius * Math.sin(midRot);

        ctx.save();
        ctx.translate(x, y);
        let ang = (midRot + 2 * Math.PI) % (2 * Math.PI);
        if (ang > Math.PI / 2 && ang < 3 * Math.PI / 2) ctx.rotate(midRot + Math.PI);
        else ctx.rotate(midRot);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#111";
        ctx.font = "bold 14px Arial";

        const labelToShow =
          (sl.label === "Yes" || sl.label === "Shiny") ? texts[currentLang].yes
            : (sl.label === "No" || sl.label === "Normal") ? texts[currentLang].no
            : sl.label;

        ctx.fillText(labelToShow, 0, 0);
        ctx.restore();
      }

      // círculo central
      ctx.beginPath();
      ctx.arc(center, center, 44, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = "#ddd";
      ctx.stroke();
    }

    draw(0);

    // audio pool
    const baseTick = document.getElementById("tick-sound");
    const baseShiny = document.getElementById("shiny-sound");
    const poolSize = 3;
    const tickPool = [];
    for (let i = 0; i < poolSize; i++) {
      try {
        const a = baseTick.cloneNode();
        a.preload = "auto";
        tickPool.push(a);
      } catch (e) {
        tickPool.push(baseTick);
      }
    }
    let tickIdx = 0;
    function playTick() {
      try {
        const a = tickPool[tickIdx] || baseTick;
        a.currentTime = 0;
        a.play().catch(()=>{});
        tickIdx = (tickIdx + 1) % tickPool.length;
      } catch (e) {
        try { baseTick.currentTime = 0; baseTick.play().catch(()=>{}); } catch(_) {}
      }
    }

    // logic
    let spinning = false;
    let lastIdx = -1;
    const SMALL_SLICE_THRESHOLD = 0.08;
    const smallPlayed = new Set();

    function sliceIndexAtPointer(rotationRad) {
      const pointerAngle = -Math.PI / 2;
      let adjusted = (pointerAngle - rotationRad) % (2 * Math.PI);
      if (adjusted < 0) adjusted += 2 * Math.PI;
      for (let i = 0; i < slices.length; i++) {
        const s = (slices[i].start % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const e = (slices[i].end % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        if (s < e) {
          if (adjusted >= s && adjusted < e) return i;
        } else {
          if (adjusted >= s || adjusted < e) return i;
        }
      }
      return 0;
    }

    function animatePointerHit() {
      pointer.style.transition = "transform 90ms ease-out";
      pointer.style.transform = "translateX(-50%) rotate(-18deg)";
      setTimeout(() => {
        pointer.style.transform = "translateX(-50%) rotate(0deg)";
      }, 110);
    }

    function cleanup() {
      try { overlay.remove(); } catch (e) {}
    }

    function spin() {
      if (spinning) return;
      spinning = true;
      lastIdx = -1;
      smallPlayed.clear();
      btn.disabled = true;

      const isShinyRoll = Math.random() < chance;
      const targetIndex = isShinyRoll ? slices.findIndex(s => s.label === "Yes") : slices.findIndex(s => s.label === "No");
      const targetSlice = slices[targetIndex];

      const targetAngleWithin = targetSlice.start + Math.random() * (targetSlice.end - targetSlice.start);
      const pointerAngle = -Math.PI / 2;
      let baseRot = pointerAngle - targetAngleWithin;
      baseRot = ((baseRot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

      const extraSpins = 4 + Math.floor(Math.random() * 4);
      const totalRotation = extraSpins * 2 * Math.PI + baseRot;
      const duration = 2500 + Math.floor(Math.random() * 1800);
      const startTime = performance.now();

      function step(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const currentRotation = eased * totalRotation;
        draw(currentRotation);

        const idx = sliceIndexAtPointer(currentRotation);
        const sliceSize = Math.abs(slices[idx].end - slices[idx].start);

        if (idx !== lastIdx) {
          lastIdx = idx;
          if (sliceSize < SMALL_SLICE_THRESHOLD) {
            if (!smallPlayed.has(idx)) {
              smallPlayed.add(idx);
              playTick();
            }
          } else {
            playTick();
          }
          animatePointerHit();
        } else {
          if (sliceSize < SMALL_SLICE_THRESHOLD && !smallPlayed.has(idx)) {
            smallPlayed.add(idx);
            playTick();
            animatePointerHit();
          }
        }

        if (t < 1) requestAnimationFrame(step);
        else {
          spinning = false;
          btn.disabled = false;
          const finalIdx = sliceIndexAtPointer(totalRotation);
          const finalLabel = slices[finalIdx].label;
          const isShiny = (finalLabel === "Yes");
          try { if (isShiny && baseShiny) baseShiny.play().catch(()=>{}); } catch (e) {}
          setTimeout(() => {
            cleanup();
            resolve({ isShiny, label: finalLabel });
          }, 250);
        }
      }

      requestAnimationFrame(step);
    }

    btn.addEventListener("click", spin);
  });
}

/* ---------------------------
   FINAL SCREEN
--------------------------- */
function showFinalScreen() {
  const el = document.getElementById("screen-final");
  if(!el) return;
  el.innerHTML = `
    <h2>${texts[currentLang].finalTitle}</h2>
    <p>${texts[currentLang].finalText}</p>
    <button class="primary" id="restartBtn">${texts[currentLang].restart}</button>
  `;
  showScreen("screen-final");
  const r = document.getElementById("restartBtn");
  if (r) r.addEventListener("click", ()=> location.reload());
}

/* ---------------------------
   LANGUAGE TOGGLE
--------------------------- */
const langToggle = document.getElementById("language-toggle");
const langFlag = document.getElementById("lang-flag");

if (langToggle && langFlag) {
  langToggle.addEventListener("click", () => {
    const next = currentLang === "pt" ? "en" : "pt";
    setLanguage(next);
    langFlag.src = currentLang === "pt" ? "assets/ui/brLanguage.png" : "assets/ui/enLanguage.png";
    updateTexts();
  });
}

/* ---------------------------
   BOOT
--------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const lang = getLanguage();
  currentLang = lang;
  const lf = document.getElementById("lang-flag");
  if (lf) lf.src = currentLang === "pt" ? "assets/ui/brLanguage.png" : "assets/ui/enLanguage.png";
  updateTexts();
  initGenScreen();
  renderTeamAndBag();
});
