import { readFile, writeFile } from "fs/promises";

import pokemonList from "../data/pokemon.json" with { type: "json" };
import pokemonMoves from "../data/pokemon-moves.json" with { type: "json" };
import moves from "../data/moves.json" with { type: "json" };

function getPokemonMovesById(id) {
  return pokemonMoves.find((pokemon) => pokemon.pokemon === id);
}

const pokemon = pokemonList.map((pokemon) => {
  const myMoves = getPokemonMovesById(pokemon.id);
  if (!myMoves) {
    console.log(pokemon.pokemon);
    return pokemon;
  }
  const filtered = [];
  for (let move of myMoves.moves) {
    filtered.push({ id: move.move, level: move.level });
  }
  return {
    id: pokemon.id,
    pokemon: pokemon.pokemon,
    generation: pokemon.generation,
    type: pokemon.type,
    moves: filtered,
  };
});
await writeFile("data/pokemon-big.json", JSON.stringify(pokemon, null, 2));
