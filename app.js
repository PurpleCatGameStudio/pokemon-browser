/* ===========================
   GAME STATE
=========================== */
const GameState = {
  currentGen: null,

  player: {
    gender: null,
    party: [],
    items: []
  },

  // 🔥 ADICIONADO (NAVEGAÇÃO)
  world: {
    currentLocationId: null,
    visited: new Set()
  }
};

const STARTERS = [
  { name: "Bulbasaur", id: 1 },
  { name: "Charmander", id: 4 },
  { name: "Squirtle", id: 7 }
];

/* ===========================
   TEXTS / LANG
=========================== */
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
    spin: "Spin",
    choose: "Choose",

    // 🔥 NAVEGAÇÃO
    wild: "Wild Pokémon",
    fishing: "Fishing",
    gym: "Gym",
    pokecenter: "PokéCenter",
    pokemart: "PokéMart",
    move: "Go to another area",
    where: "Where do you want to go?"
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
    spin: "Girar",
    choose: "Escolher",

    // 🔥 NAVEGAÇÃO
    wild: "Pokémon Selvagens",
    fishing: "Pescar",
    gym: "Ginásio",
    pokecenter: "PokéCenter",
    pokemart: "PokéMart",
    move: "Ir para outra área",
    where: "Para onde ir?"
  }
};

let currentLang = "en";

/* ===========================
   LANGUAGE STORAGE
=========================== */
function setLanguage(lang) {
  try { sessionStorage.setItem("preferredLanguage", lang); } catch (_) {}
  currentLang = lang;
}

function getLanguage() {
  try { return sessionStorage.getItem("preferredLanguage") || "en"; }
  catch (_) { return "en"; }
}

/* ===========================
   SCREENS / FLOW
=========================== */
const Screens = {
  GEN: "screen-gen",
  GENDER: "screen-gender",
  STARTER: "screen-starter",
  FINAL: "screen-final",
  LOCATION: "screen-location-actions" // 🔥 NOVA
};

const ScreenFlow = {
  current: null,

  go(screen) {
    if (!screen) screen = Screens.GEN;
    this.current = screen;
    showScreen(screen);

    switch (screen) {
      case Screens.GEN: renderGenScreen(); break;
      case Screens.GENDER: renderGenderScreen(); break;
      case Screens.STARTER: renderStarterScreen(); break;
      case Screens.FINAL: renderFinalScreen(); break;
    }
  }
};

/* ===========================
   UI HELPERS
=========================== */
function showScreen(id) {
  document.querySelectorAll(".screen")
    .forEach(s => s.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
}

function renderTeamAndBag() {
  const teamGrid = document.getElementById("team-grid");
  if (!teamGrid) return;

  teamGrid.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const slot = document.createElement("div");
    slot.className = "slot";

    const p = GameState.player.party[i];
    if (p) {
      const img = document.createElement("img");
      img.src = p.shiny
        ? `sprites/pokemon/${p.id}_shiny.png`
        : `sprites/pokemon/${p.id}.png`;
      slot.appendChild(img);
    } else {
      slot.classList.add("empty");
    }

    teamGrid.appendChild(slot);
  }
}

function updateBodySprite() {
  const el = document.getElementById("body-sprite");
  if (!el) return;

  el.innerHTML = "";
  if (GameState.player.gender) {
    const img = document.createElement("img");
    img.src = `sprites/gender/${GameState.player.gender}.png`;
    img.style.width = "80px";
    img.style.height = "80px";
    el.appendChild(img);
  }
}

/* ===========================
   RESET
=========================== */
function resetGameState() {
  GameState.currentGen = null;
  GameState.player.gender = null;
  GameState.player.party.length = 0;
  GameState.player.items.length = 0;

  GameState.world.currentLocationId = null;
  GameState.world.visited.clear();

  updateBodySprite();
  renderTeamAndBag();
}

/* ===========================
   SCREENS (INÍCIO)
=========================== */
function renderGenScreen() {
  const el = document.getElementById("screen-gen");
  el.innerHTML = `
    <h2>${texts[currentLang].genTitle}</h2>
    <button class="primary">${texts[currentLang].gen1}</button>
  `;

  el.querySelector("button").onclick = () => {
    GameState.currentGen = 1;
    ScreenFlow.go(Screens.GENDER);
  };

  renderTeamAndBag();
}

function renderGenderScreen() {
  const el = document.getElementById("screen-gender");
  el.innerHTML = `
    <h2>${texts[currentLang].genderTitle}</h2>
    <div class="row" id="gender-row"></div>
  `;

  const row = el.querySelector("#gender-row");

  ["boy", "girl"].forEach(g => {
    const div = document.createElement("div");
    div.className = "gender-option";
    div.innerHTML = `
      <img src="sprites/gender/${g}.png">
      <div>${g}</div>
    `;

    div.onclick = () => {
      GameState.player.gender = g;
      updateBodySprite();
      ScreenFlow.go(Screens.STARTER);
    };

    row.appendChild(div);
  });
}

function renderStarterScreen() {
  showScreen(Screens.STARTER);

  const el = document.getElementById("screen-starter");
  el.innerHTML = `
    <h2>${texts[currentLang].starterTitle}</h2>
    <div class="row" id="starters-row"></div>
  `;

  const row = el.querySelector("#starters-row");

  STARTERS.forEach(s => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="sprites/pokemon/${s.id}.png">
      <div class="title">${s.name}</div>
      <button type="button">${texts[currentLang].choose}</button>
    `;

    card.querySelector("button")
      .addEventListener("click", () => onStarterChosen(s));

    row.appendChild(card);
  });
}

/* ===========================
   STARTER → ROULETTE → NAVEGAÇÃO
=========================== */
async function onStarterChosen(starter) {
  const poke = { ...starter };

  const result = await openShinyRoulette({
    chance: 0.01,
    title: texts[currentLang].shinyTitle
  });

  if (result?.isShiny) {
    poke.shiny = true;
    document.getElementById("shiny-sound")?.play().catch(() => {});
  }

  GameState.player.party.push(poke);
  renderTeamAndBag();

  // 🔥 A ÚNICA MUDANÇA DE FLUXO
  await goToLocation("pallet-town");
}

/* ===========================
   NAVEGAÇÃO (NOVO SISTEMA)
=========================== */
async function loadLocation(id) {
  const res = await fetch(`data/locations/${id}.json`);
  if (!res.ok) throw new Error("Location not found: " + id);
  return await res.json();
}

async function goToLocation(id) {
  const location = await loadLocation(id);

  GameState.world.currentLocationId = id;
  GameState.world.visited.add(id);

  showLocationActions(location);
}

function createActionBtn(label, onClick) {
  const btn = document.createElement("button");
  btn.className = "primary";
  btn.textContent = label;
  btn.onclick = onClick;
  return btn;
}

function showLocationActions(location) {
  const el = document.getElementById("screen-location-actions");
  el.innerHTML = `<h2>${location.name[currentLang]}</h2>`;

  const row = document.createElement("div");
  row.className = "row";

  if (location.features.wildPokemon)
    row.appendChild(createActionBtn(texts[currentLang].wild, () => console.log("wild")));

  if (location.features.fishing)
    row.appendChild(createActionBtn(texts[currentLang].fishing, () => console.log("fishing")));

  if (location.features.gym)
    row.appendChild(createActionBtn(texts[currentLang].gym, () => console.log("gym")));

  if (location.features.pokecenter)
    row.appendChild(createActionBtn(texts[currentLang].pokecenter, () => console.log("pokecenter")));

  if (location.features.pokemart)
    row.appendChild(createActionBtn(texts[currentLang].pokemart, () => console.log("pokemart")));

  if (location.connections?.length)
    row.appendChild(createActionBtn(texts[currentLang].move, () => showMoveOptions(location)));

  el.appendChild(row);
  showScreen(Screens.LOCATION);
}

async function showMoveOptions(location) {
  const el = document.getElementById("screen-location-actions");
  el.innerHTML = `<h2>${texts[currentLang].where}</h2>`;

  const row = document.createElement("div");
  row.className = "row";

  for (const id of location.connections) {
    const target = await loadLocation(id);
    row.appendChild(createActionBtn(
      target.name[currentLang],
      () => goToLocation(id)
    ));
  }

  el.appendChild(row);
}

/* ===========================
   SHINY ROULETTE
=========================== */
/* ===========================
   SHINY ROULETTE
=========================== */
function openShinyRoulette({ chance = 0.01, title = null } = {}) {
  return new Promise((resolve) => {

    /* ================= UI ================= */
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position:fixed; inset:0;
      display:flex; align-items:center; justify-content:center;
      background:rgba(0,0,0,.45); z-index:9999;
    `;

    const panel = document.createElement("div");
    panel.style.cssText = `
      width:480px; max-width:95%;
      background:#fff; border-radius:12px;
      padding:16px; text-align:center;
      box-shadow:0 16px 40px rgba(0,0,0,.4);
    `;
    overlay.appendChild(panel);

    panel.innerHTML = `<h2>${title || texts[currentLang].shinyTitle}</h2>`;

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    panel.appendChild(wrapper);

    const canvas = document.createElement("canvas");
    canvas.width = 420;
    canvas.height = 420;
    wrapper.appendChild(canvas);

    const pointer = document.createElement("div");
    pointer.style.cssText = `
      position:absolute; top:0; left:50%;
      transform:translateX(-50%);
      width:0; height:0;
      border-left:14px solid transparent;
      border-right:14px solid transparent;
      border-top:26px solid rgb(228,56,56);
    `;
    wrapper.appendChild(pointer);

    const btn = document.createElement("button");
    btn.className = "primary";
    btn.textContent = texts[currentLang].spin;
    btn.style.marginTop = "12px";
    panel.appendChild(btn);

    document.body.appendChild(overlay);

    /* ================= AUDIO ================= */
    const baseTick = document.getElementById("tick-sound");
    const tickPool = [baseTick, baseTick.cloneNode(), baseTick.cloneNode()];
    let tickIdx = 0;

    function playTick() {
      const a = tickPool[tickIdx];
      a.currentTime = 0;
      a.play().catch(() => {});
      tickIdx = (tickIdx + 1) % tickPool.length;
    }

    /* ================= SLICES ================= */
    const slices = [
      { label: "Yes", weight: chance, color: "#f0c040" },
      { label: "No",  weight: 1 - chance, color: "#cfd8dc" }
    ];

    const ctx = canvas.getContext("2d");
    const center = canvas.width / 2;
    const radius = center - 16;

    let cursor = -Math.PI / 2;
    slices.forEach(s => {
      const size = s.weight * Math.PI * 2;
      s.start = cursor;
      s.end = cursor + size;
      cursor += size;
    });

    function draw(rot) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      slices.forEach(s => {
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, s.start + rot, s.end + rot);
        ctx.closePath();
        ctx.fillStyle = s.color;
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.stroke();

        const mid = (s.start + s.end) / 2 + rot;
        const textRadius = radius - 26;
        const x = center + Math.cos(mid) * textRadius;
        const y = center + Math.sin(mid) * textRadius;

        ctx.save();
        ctx.translate(x, y);

        let ang = mid % (Math.PI * 2);
        if (ang > Math.PI / 2 && ang < 3 * Math.PI / 2) {
          ctx.rotate(mid + Math.PI);
        } else {
          ctx.rotate(mid);
        }

        ctx.fillStyle = "#111";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const text =
          s.label === "Yes" ? texts[currentLang].yes :
          s.label === "No"  ? texts[currentLang].no  :
          s.label;

        ctx.fillText(text, 0, 0);
        ctx.restore();
      });

      ctx.beginPath();
      ctx.arc(center, center, 42, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = "#ddd";
      ctx.stroke();
    }

    draw(0);

    /* ================= SLICE DETECTION ================= */
    function getSliceIndex(rot) {
      let angle = (-Math.PI / 2 - rot) % (Math.PI * 2);
      if (angle < 0) angle += Math.PI * 2;

      for (let i = 0; i < slices.length; i++) {
        const s = slices[i];
        let a = s.start % (Math.PI * 2);
        let b = s.end % (Math.PI * 2);
        if (a < 0) a += Math.PI * 2;
        if (b < 0) b += Math.PI * 2;

        if (a < b) {
          if (angle >= a && angle < b) return i;
        } else {
          if (angle >= a || angle < b) return i;
        }
      }
      return 0;
    }

    /* ================= ANIMATION ================= */
    let lastSliceIndex = null;
    let lastRot = 0;
    let tickedThisFrame = false;

    btn.onclick = () => {
      btn.disabled = true;

      const isShiny = Math.random() < chance;
      const target = slices[isShiny ? 0 : 1];
      const targetAngle =
        target.start + Math.random() * (target.end - target.start);

      const spins = 5;
      const finalRot =
        spins * Math.PI * 2 + (-Math.PI / 2 - targetAngle);

      const duration = 2600;
      const startTime = performance.now();

      function animate(now) {
        tickedThisFrame = false;

        const t = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const rot = eased * finalRot;

        const STEP = Math.PI / 180;
        const delta = rot - lastRot;
        const steps = Math.max(1, Math.ceil(Math.abs(delta) / STEP));
        const stepRot = delta / steps;

        for (let i = 1; i <= steps; i++) {
          const testRot = lastRot + stepRot * i;
          const idx = getSliceIndex(testRot);

          if (lastSliceIndex === null) {
            lastSliceIndex = idx;
          } else if (idx !== lastSliceIndex) {
            if (!tickedThisFrame) {
              playTick();
              tickedThisFrame = true;
            }
            lastSliceIndex = idx;
          }
        }

        lastRot = rot;
        draw(rot);

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          overlay.remove();
          resolve({ isShiny });
        }
      }

      requestAnimationFrame(animate);
    };
  });
}


/* ===========================
   LANGUAGE TOGGLE
=========================== */
const langToggle = document.getElementById("language-toggle");
const langFlag = document.getElementById("lang-flag");

langToggle?.addEventListener("click", () => {
  const next = currentLang === "pt" ? "en" : "pt";
  setLanguage(next);

  if (langFlag) {
    langFlag.src = next === "pt"
      ? "assets/ui/brLanguage.png"
      : "assets/ui/enLanguage.png";
  }

  const target = ScreenFlow.current || Screens.GEN;
  ScreenFlow.go(target);
});

/* ===========================
   BOOT
=========================== */
document.addEventListener("DOMContentLoaded", () => {
  currentLang = getLanguage();
  resetGameState();
  ScreenFlow.go(Screens.GEN);
});
