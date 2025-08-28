// Lista de Pokémon
const pokemonList = ["Pikachu", "Charmander", "Bulbasaur", "Squirtle", "Eevee"];
const spinBtn = document.getElementById("spinBtn");
const result = document.getElementById("result");

// Anúncio e botão de idioma
const announcement = document.getElementById("announcement");
const langBtn = document.getElementById("langBtn");

// Idiomas disponíveis
let language = "pt"; // padrão português

const texts = {
    pt: {
        announcement: "🚀 Esta página acabou de ser criada! Em breve uma versão jogável estará disponível. 🎮",
        spin: "Girar Roleta",
    },
    en: {
        announcement: "🚀 This page was just created! A playable version will be available soon. 🎮",
        spin: "Spin Roulette",
    }
};

// Alternar idioma
langBtn.addEventListener("click", () => {
    language = language === "pt" ? "en" : "pt";
    announcement.textContent = texts[language].announcement;
    spinBtn.textContent = texts[language].spin;
    langBtn.textContent = language === "pt" ? "🇬🇧 English" : "🇧🇷 Português";
});

// Botão da roleta
spinBtn.addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * pokemonList.length);
    result.textContent = language === "pt" 
        ? `Você tirou: ${pokemonList[randomIndex]}!`
        : `You got: ${pokemonList[randomIndex]}!`;
});
