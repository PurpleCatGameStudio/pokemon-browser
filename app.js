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

/* ---------------------------
   HELPERS UI
--------------------------- */
function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
}

function renderTeamAndBag() {
  const teamGrid = document.getElementById("team-grid");
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

/* ---------------------------
   TELAS
--------------------------- */
function initGenScreen(){
  const el=document.getElementById("screen-gen");
  el.innerHTML=`<h2>Escolha a Geração</h2><p class="muted">Por enquanto: apenas Geração 1</p><button id="gen1Btn" class="primary">Geração 1 (Kanto)</button>`;
  document.getElementById("gen1Btn").addEventListener("click",()=>{
    GameState.currentGen=1;
    showGenderScreen();
  });
  showScreen("screen-gen");
  renderTeamAndBag();
}

function showGenderScreen() {
  const el = document.getElementById("screen-gender");
  el.innerHTML = `<h2>Qual é o seu gênero?</h2><div class="row" id="gender-row"></div>`;
  showScreen("screen-gender");

  const row = document.getElementById("gender-row");
  const genders = [
    { name: "Boy", file: "sprites/gender/boy.png" },
    { name: "Girl", file: "sprites/gender/girl.png" }
  ];

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
  el.innerHTML = `<h2>Professor Oak: Escolha seu Pokémon inicial</h2><div class="row" id="starters-row"></div>`;
  const row = document.getElementById("starters-row");
  STARTERS.forEach(s => {
    const card = document.createElement("div"); card.className="card";
    const img = document.createElement("img"); img.src=`sprites/pokemon/${s.id}.png`; img.alt=s.name;
    const title = document.createElement("div"); title.className="title"; title.textContent=s.name;
    const btn = document.createElement("button"); btn.textContent="Escolher";
    btn.addEventListener("click",()=>{
      GameState.starter=s;
      showShinyScreen();
    });
    card.appendChild(img); card.appendChild(title); card.appendChild(btn);
    row.appendChild(card);
  });
  showScreen("screen-starter");
}

/* ---------------------------
   TELA ROLETA SHINY
--------------------------- */
function showShinyScreen() {
  const el = document.getElementById("screen-shiny");
  el.innerHTML = `
    <h2>Roleta de Shiny</h2>
    <div id="roulette-wrapper" style="position:relative;">
      <canvas id="roulette-canvas" width="400" height="400"></canvas>
      <div id="pointer" aria-hidden="true"></div>
      <button id="spinBtn" class="primary">Girar Roleta</button>
    </div>
  `;
  showScreen("screen-shiny");

  const slices = [
    { label: "Shiny", weight: 50, color: "#f0c040" },
    { label: "Normal", weight: 50, color: "#cfd8dc" }
  ];
  const totalWeight = slices.reduce((s, x) => s + x.weight, 0);
  slices.forEach(sl => sl.perc = Math.round((sl.weight / totalWeight) * 100) + "%");

  let start = -Math.PI / 2;
  for (let sl of slices) {
    const angle = (sl.weight / totalWeight) * 2 * Math.PI;
    sl.start = start;
    sl.end = start + angle;
    sl.mid = (sl.start + sl.end)/2;
    start += angle;
  }

  const canvas = document.getElementById("roulette-canvas");
  const ctx = canvas.getContext("2d");
  const center = canvas.width/2;
  const radius = center-12;

  function draw(rotationRad=0){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let sl of slices){
      ctx.beginPath();
      ctx.moveTo(center,center);
      ctx.arc(center,center,radius,sl.start+rotationRad,sl.end+rotationRad);
      ctx.closePath();
      ctx.fillStyle=sl.color;
      ctx.fill();
      ctx.strokeStyle="#333";
      ctx.lineWidth=2;
      ctx.stroke();

      const mid=sl.mid+rotationRad;
      ctx.save();
      ctx.translate(center,center);
      ctx.rotate(mid);
      ctx.textAlign="right";
      ctx.fillStyle="#222";
      ctx.font="bold 8px Arial";
      ctx.fillText(sl.perc,radius-10,3);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(center,center,40,0,Math.PI*2);
    ctx.fillStyle="#fff";
    ctx.fill();
    ctx.strokeStyle="#ddd";
    ctx.stroke();
  }

  const tick = document.getElementById("tick-sound");
  const shinySound = document.getElementById("shiny-sound");

  function sliceIndexAtPointer(rotationRad){
    const pointerAngle = -Math.PI/2;
    let adjusted = (pointerAngle-rotationRad)%(2*Math.PI);
    if(adjusted<0) adjusted+=2*Math.PI;
    for(let i=0;i<slices.length;i++){
      let s=(slices[i].start%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
      let e=(slices[i].end%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
      if(s<e){ if(adjusted>=s&&adjusted<e) return i; }
      else{ if(adjusted>=s||adjusted<e) return i; }
    }
    return 0;
  }

  let spinning=false;
  let lastTickIndex=-1;

  function spin(){
    if(spinning) return;
    spinning=true;
    lastTickIndex=-1;

    const btn = document.getElementById("spinBtn");
    if (btn) btn.disabled = true;

    const shinyChance = slices.find(s=>s.label==="Shiny").weight/totalWeight;
    const isShiny=Math.random()<shinyChance;
    const targetIndex=isShiny ? slices.findIndex(s=>s.label==="Shiny") : slices.findIndex(s=>s.label==="Normal");
    const targetSlice=slices[targetIndex];

    const targetAngleWithinSlice = targetSlice.start+Math.random()*(targetSlice.end-targetSlice.start);
    const pointerAngle=-Math.PI/2;
    let baseRotation = pointerAngle-targetAngleWithinSlice;
    baseRotation = ((baseRotation%(2*Math.PI))+2*Math.PI)%(2*Math.PI);

    const extraSpins = 5+Math.floor(Math.random()*4);
    const totalRotation = extraSpins*2*Math.PI+baseRotation;
    const duration = 4200+Math.floor(Math.random()*800);
    const startTime = performance.now();

    function step(now){
      const t = Math.min(1,(now-startTime)/duration);
      const eased = 1-Math.pow(1-t,3);
      const currentRotation = eased*totalRotation;
      draw(currentRotation);

      const idx = sliceIndexAtPointer(currentRotation);
      if(idx!==lastTickIndex){
        lastTickIndex=idx;
        try{ tick.currentTime=0; tick.play(); }catch(e){}
      }

      if(t<1) requestAnimationFrame(step);
      else {
        spinning=false;
        const pokeToAdd={...GameState.starter};
        if(isShiny) pokeToAdd.shiny=true;
        GameState.player.party.push(pokeToAdd);
        renderTeamAndBag();
        if(isShiny) shinySound.play();

        setTimeout(showFinalScreen, 800); 
      }
    }
    requestAnimationFrame(step);
  }

  draw(0);
    document.getElementById("spinBtn").addEventListener("click", spin);
}

/* ---------------------------
   FINAL SCREEN
--------------------------- */
function showFinalScreen() {
  const el = document.getElementById("screen-final");
  el.innerHTML = `
    <h2>Fim da versão teste!</h2>
    <p>Em breve mais conteúdo, continue acompanhando.</p>
    <button class="primary" onclick="location.reload()">Reiniciar</button>
  `;
  showScreen("screen-final");
}

/* ---------------------------
   BOOT
--------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initGenScreen();
  renderTeamAndBag();
});