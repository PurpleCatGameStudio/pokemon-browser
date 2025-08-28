// Lista de Pokémon
const pokemonList = ["Pikachu", "Charmander", "Bulbasaur", "Squirtle", "Eevee"];
const spinBtn = document.getElementById("spinBtn");
const result = document.getElementById("result");

// Mensagem de anúncio
const announcement = document.getElementById("announcement");

// Botões de idioma
const ptBtn = document.getElementById("ptBtn");
const enBtn = document.getElementById("enBtn");

// Textos em cada idioma
const texts = {
    pt: {
        announcement: "🚀 Bem-vindo ao Pokémon Browser! Em breve você poderá jogar uma versão completa e divertida do jogo. 🎮",
        spin: "Girar Roleta",
        resultPrefix: "Você tirou: "
    },
    en: {
        announcement: "🚀 Welcome to Pokémon Browser! Soon you’ll be able to play a full, fun version of the game. 🎮",
        spin: "Spin Roulette",
        resultPrefix: "You got: "
    }
};

// Função para alterar idioma
function setLanguage(lang) {
    announcement.textContent = texts[lang].announcement;
    spinBtn.textContent = texts[lang].spin;
    spinBtn.dataset.lang = lang; // salva idioma atual
}

// Eventos dos botões de idioma
ptBtn.addEventListener("click", () => setLanguage("pt"));
enBtn.addEventListener("click", () => setLanguage("en"));

// Evento do botão da roleta
spinBtn.addEventListener("click", () => {
    const lang = spinBtn.dataset.lang || "pt"; // padrão pt
    const randomIndex = Math.floor(Math.random() * pokemonList.length);
    result.textContent = texts[lang].resultPrefix + pokemonList[randomIndex] + "!";
});
