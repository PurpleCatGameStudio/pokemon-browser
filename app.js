const pokemonList = ["Pikachu", "Charmander", "Bulbasaur", "Squirtle"];
const spinBtn = document.getElementById("spinBtn");
const result = document.getElementById("result");

spinBtn.addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * pokemonList.length);
    result.textContent = `Você tirou: ${pokemonList[randomIndex]}!`;
});
